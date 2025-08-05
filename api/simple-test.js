module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Test database module availability
  let moduleStatus = {};
  
  // Check @vercel/postgres
  try {
    require.resolve('@vercel/postgres');
    moduleStatus.vercel_postgres = 'Available';
    try {
      const { sql } = require('@vercel/postgres');
      moduleStatus.vercel_postgres_import = 'Success';
    } catch (importError) {
      moduleStatus.vercel_postgres_import = 'Failed: ' + importError.message;
    }
  } catch (e) {
    moduleStatus.vercel_postgres = 'Not available: ' + e.message;
  }

  // Check pg module
  try {
    require.resolve('pg');
    moduleStatus.pg = 'Available';
    try {
      const { Client } = require('pg');
      moduleStatus.pg_import = 'Success';
    } catch (importError) {
      moduleStatus.pg_import = 'Failed: ' + importError.message;
    }
  } catch (e) {
    moduleStatus.pg = 'Not available: ' + e.message;
  }

  res.status(200).json({
    success: true,
    message: 'Simple test endpoint working with database checks',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      VERCEL: process.env.VERCEL || 'not set',
      POSTGRES_URL_EXISTS: process.env.POSTGRES_URL ? 'yes' : 'no',
      POSTGRES_URL_LENGTH: process.env.POSTGRES_URL ? process.env.POSTGRES_URL.length : 0
    },
    database_modules: moduleStatus,
    note: "Database module checks added to working endpoint"
  });
};