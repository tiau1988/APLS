const https = require('https');
const { URL } = require('url');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Check environment variables
    const envStatus = {
      POSTGRES_URL: process.env.POSTGRES_URL ? 'Set' : 'Not set',
      POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? 'Set' : 'Not set',
      POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? 'Set' : 'Not set'
    };

    // If no database URL, return configuration error
    if (!process.env.POSTGRES_URL) {
      return res.status(500).json({
        success: false,
        error: 'Database not configured',
        environment_variables: envStatus,
        message: 'Please connect your Neon database to this project in Vercel Dashboard'
      });
    }

    // Parse the database URL
    const dbUrl = new URL(process.env.POSTGRES_URL);
    
    // Test basic connectivity by attempting to parse the URL
    const connectionInfo = {
      host: dbUrl.hostname,
      port: dbUrl.port || 5432,
      database: dbUrl.pathname.slice(1),
      username: dbUrl.username,
      ssl: dbUrl.searchParams.get('sslmode') || 'require'
    };

    // Since we can't actually connect without a PostgreSQL client,
    // we'll just verify the URL format and environment setup
    res.status(200).json({
      success: true,
      message: 'Database configuration verified',
      timestamp: new Date().toISOString(),
      environment_variables: envStatus,
      connection_info: {
        host: connectionInfo.host,
        port: connectionInfo.port,
        database: connectionInfo.database,
        ssl_mode: connectionInfo.ssl
      },
      note: 'URL format is valid. Actual connection requires PostgreSQL client library.',
      next_steps: [
        '✅ Database URL configured',
        '⚠️ PostgreSQL client library needed for actual connection',
        '🔧 Consider using Vercel\'s built-in database integration'
      ]
    });

  } catch (error) {
    console.error('Database configuration error:', error);
    res.status(500).json({
      success: false,
      error: 'Database configuration failed',
      details: error.message,
      environment_variables: {
        POSTGRES_URL: process.env.POSTGRES_URL ? 'Set' : 'Not set',
        POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? 'Set' : 'Not set',
        POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? 'Set' : 'Not set'
      }
    });
  }
};