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

  res.status(200).json({
    success: true,
    message: "Simple test endpoint with enhanced diagnostics",
    timestamp: new Date().toISOString(),
    deployment_trigger: "Enhanced module diagnostics",
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
    diagnostics: {
      node_modules: nodeModulesCheck
    },
    note: "Enhanced diagnostics for module loading issues"
  });
}