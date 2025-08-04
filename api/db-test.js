module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).json({ message: 'CORS preflight handled' });
    return;
  }

  try {
    // Get environment info first (without database connection)
    const envInfo = {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasPrismaUrl: !!process.env.PRISMA_DATABASE_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      postgresHost: process.env.POSTGRES_HOST || 'Not set',
      postgresDatabase: process.env.POSTGRES_DATABASE || 'Not set',
      nodeVersion: process.version,
      vercelEnv: process.env.VERCEL_ENV || 'local'
    };

    // Only try database connection if we have the URL
    if (process.env.POSTGRES_URL) {
      const { sql } = require('@vercel/postgres');
      const result = await sql`SELECT NOW() as current_time`;
      
      res.status(200).json({
        success: true,
        message: 'Database connection successful!',
        timestamp: new Date().toISOString(),
        databaseInfo: result.rows[0],
        environment: envInfo
      });
    } else {
      res.status(200).json({
        success: false,
        message: 'No database URL found - database not configured',
        environment: envInfo,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Database connection error:', error);
    
    const envInfo = {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasPrismaUrl: !!process.env.PRISMA_DATABASE_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      postgresHost: process.env.POSTGRES_HOST || 'Not set',
      postgresDatabase: process.env.POSTGRES_DATABASE || 'Not set',
      nodeVersion: process.version,
      vercelEnv: process.env.VERCEL_ENV || 'local'
    };

    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      details: error.message,
      errorCode: error.code,
      environment: envInfo,
      timestamp: new Date().toISOString()
    });
  }
};