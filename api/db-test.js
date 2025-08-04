const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).json({ message: 'CORS preflight handled' });
    return;
  }

  try {
    // Test basic database connection
    const result = await sql`SELECT NOW() as current_time, version() as postgres_version`;
    
    // Get environment info
    const envInfo = {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
      postgresHost: process.env.POSTGRES_HOST || 'Not set',
      postgresDatabase: process.env.POSTGRES_DATABASE || 'Not set',
      nodeVersion: process.version,
      vercelEnv: process.env.VERCEL_ENV || 'local'
    };

    res.status(200).json({
      success: true,
      message: 'Database connection successful!',
      timestamp: new Date().toISOString(),
      databaseInfo: result.rows[0],
      environment: envInfo
    });

  } catch (error) {
    console.error('Database connection error:', error);
    
    // Get environment info even on error
    const envInfo = {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
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