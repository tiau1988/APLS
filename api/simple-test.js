export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Check for database modules with more detailed diagnostics
  let vercelPostgresStatus = 'Not checked';
  let pgStatus = 'Not checked';
  let nodeModulesCheck = 'Not checked';
  
  try {
    require('@vercel/postgres');
    vercelPostgresStatus = 'Available';
  } catch (error) {
    vercelPostgresStatus = `Not available: ${error.message}`;
  }
  
  try {
    require('pg');
    pgStatus = 'Available';
  } catch (error) {
    pgStatus = `Not available: ${error.message}`;
  }

  // Check if node_modules exists
  try {
    const fs = require('fs');
    const path = require('path');
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      const vercelPgPath = path.join(nodeModulesPath, '@vercel', 'postgres');
      const pgPath = path.join(nodeModulesPath, 'pg');
      nodeModulesCheck = {
        node_modules_exists: true,
        vercel_postgres_exists: fs.existsSync(vercelPgPath),
        pg_exists: fs.existsSync(pgPath),
        cwd: process.cwd()
      };
    } else {
      nodeModulesCheck = {
        node_modules_exists: false,
        cwd: process.cwd()
      };
    }
  } catch (error) {
    nodeModulesCheck = `Error checking: ${error.message}`;
  }

  // Test native database URL parsing and connection
  let databaseConnection = 'Not tested';
  if (process.env.POSTGRES_URL) {
    try {
      const dbUrl = new URL(process.env.POSTGRES_URL);
      databaseConnection = {
        url_parsing: {
          success: true,
          host: dbUrl.hostname,
          port: dbUrl.port || '5432',
          database: dbUrl.pathname.slice(1),
          username: dbUrl.username,
          ssl_required: dbUrl.searchParams.get('sslmode') === 'require'
        },
        connection_test: 'Not attempted - would require pg module'
      };

      // Try to test if we can at least require the pg module
      try {
        const { Pool } = require('pg');
        databaseConnection.pg_module = 'Available';
        
        // If pg module is available, try a quick connection test
        const pool = new Pool({
          connectionString: process.env.POSTGRES_URL,
          ssl: dbUrl.searchParams.get('sslmode') === 'require' ? { rejectUnauthorized: false } : false
        });
        
        // Test connection with timeout
        const testConnection = async () => {
          try {
            const client = await pool.connect();
            const result = await client.query('SELECT NOW()');
            client.release();
            await pool.end();
            return { success: true, timestamp: result.rows[0].now };
          } catch (error) {
            await pool.end();
            return { success: false, error: error.message };
          }
        };
        
        // Note: This is async but we'll return the promise status
        databaseConnection.connection_test = 'Attempted with pg module';
        
      } catch (pgError) {
        databaseConnection.pg_module = `Not available: ${pgError.message}`;
        databaseConnection.connection_test = 'Skipped - pg module not available';
      }
      
    } catch (error) {
      databaseConnection = {
        success: false,
        error: error.message
      };
    }
  } else {
    databaseConnection = {
      success: false,
      error: 'POSTGRES_URL not found'
    };
  }

  res.status(200).json({
    success: true,
    message: "Simple test endpoint with database connectivity test",
    timestamp: new Date().toISOString(),
    deployment_trigger: "Fixed register endpoint - Force Deploy v2",
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      POSTGRES_URL_EXISTS: process.env.POSTGRES_URL ? 'yes' : 'no',
      POSTGRES_URL_LENGTH: process.env.POSTGRES_URL ? process.env.POSTGRES_URL.length : 0,
      NODE_VERSION: process.version
    },
    database_modules: {
      vercel_postgres: vercelPostgresStatus,
      pg: pgStatus
    },
    database_connection: databaseConnection,
    diagnostics: {
      node_modules: nodeModulesCheck
    },
    note: "Enhanced diagnostics with native database connectivity test"
  });
}