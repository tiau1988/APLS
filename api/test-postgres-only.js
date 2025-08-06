// Test endpoint specifically for postgres package
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const postgresUrl = process.env.POSTGRES_URL;
  
  // Basic environment check
  const envInfo = {
    node_version: process.version,
    postgres_url_configured: !!postgresUrl,
    platform: process.platform,
    arch: process.arch,
    cwd: process.cwd()
  };

  if (!postgresUrl) {
    return res.status(200).json({
      status: 'no_db_url',
      message: 'POSTGRES_URL not configured',
      environment: envInfo
    });
  }

  // Test postgres package specifically
  try {
    const postgres = require('postgres');
    
    // Try to create connection
    const sql = postgres(postgresUrl, {
      ssl: 'require',
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10
    });

    // Test simple query
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    
    await sql.end();

    return res.status(200).json({
      status: 'postgres_success',
      message: 'postgres package working correctly',
      database_time: result[0].current_time,
      postgres_version: result[0].pg_version,
      environment: envInfo
    });

  } catch (error) {
    return res.status(200).json({
      status: 'postgres_error',
      message: 'postgres package failed',
      error: error.message,
      stack: error.stack,
      environment: envInfo
    });
  }
}