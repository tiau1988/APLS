export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Test database connection without external modules
  let connectionTest = null;
  
  if (process.env.POSTGRES_URL) {
    try {
      const dbUrl = new URL(process.env.POSTGRES_URL);
      connectionTest = {
        success: true,
        parsed_successfully: true,
        host: dbUrl.hostname,
        port: dbUrl.port || '5432',
        database: dbUrl.pathname.slice(1),
        username: dbUrl.username,
        has_password: !!dbUrl.password,
        ssl_mode: dbUrl.searchParams.get('sslmode') || 'prefer',
        url_length: process.env.POSTGRES_URL.length
      };
    } catch (error) {
      connectionTest = {
        success: false,
        error: 'URL parsing failed',
        details: error.message
      };
    }
  } else {
    connectionTest = {
      success: false,
      error: 'POSTGRES_URL environment variable not found'
    };
  }

  // Check module availability
  let moduleCheck = {};
  
  try {
    require('@vercel/postgres');
    moduleCheck.vercel_postgres = 'Available';
  } catch (error) {
    moduleCheck.vercel_postgres = 'Not available';
  }
  
  try {
    require('pg');
    moduleCheck.pg = 'Available';
  } catch (error) {
    moduleCheck.pg = 'Not available';
  }

  res.status(200).json({
    endpoint: "db-test-new",
    timestamp: new Date().toISOString(),
    node_version: process.version,
    environment: process.env.NODE_ENV,
    database_url_test: connectionTest,
    module_availability: moduleCheck,
    deployment_info: {
      vercel: !!process.env.VERCEL,
      function_region: process.env.VERCEL_REGION || 'unknown'
    }
  });
}