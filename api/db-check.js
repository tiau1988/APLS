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
        message: 'Please connect your Neon database to this project in Vercel Dashboard',
        next_steps: [
          '1. Go to Vercel Dashboard',
          '2. Select your project',
          '3. Go to Settings > Storage',
          '4. Connect your Neon database'
        ]
      });
    }

    // Parse the database URL to verify format
    let dbInfo = {};
    try {
      const url = new URL(process.env.POSTGRES_URL);
      dbInfo = {
        host: url.hostname,
        port: url.port || 5432,
        database: url.pathname.slice(1),
        username: url.username,
        protocol: url.protocol
      };
    } catch (urlError) {
      return res.status(500).json({
        success: false,
        error: 'Invalid database URL format',
        details: urlError.message,
        environment_variables: envStatus
      });
    }

    // Check if we can require the postgres module
    let moduleStatus = {};
    try {
      require.resolve('@vercel/postgres');
      moduleStatus.vercelPostgres = 'Available';
    } catch (e) {
      moduleStatus.vercelPostgres = 'Not available';
      moduleStatus.vercelPostgresError = e.message;
    }

    try {
      require.resolve('pg');
      moduleStatus.pg = 'Available';
    } catch (e) {
      moduleStatus.pg = 'Not available';
      moduleStatus.pgError = e.message;
    }

    res.status(200).json({
      success: true,
      message: 'Database configuration check completed',
      timestamp: new Date().toISOString(),
      environment_variables: envStatus,
      database_info: {
        host: dbInfo.host,
        port: dbInfo.port,
        database: dbInfo.database,
        protocol: dbInfo.protocol
      },
      module_status: moduleStatus,
      recommendations: moduleStatus.vercelPostgres === 'Available' ? 
        ['✅ @vercel/postgres is available', '👉 You can now use database functions'] :
        ['❌ @vercel/postgres not available', '🔧 Try using Vercel Storage integration', '📝 Or install dependencies manually']
    });

  } catch (error) {
    console.error('Database check error:', error);
    res.status(500).json({
      success: false,
      error: 'Database check failed',
      details: error.message,
      stack: error.stack
    });
  }
};