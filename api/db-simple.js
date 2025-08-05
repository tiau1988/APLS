module.exports = (req, res) => {
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

    // Check if we can require the postgres module
    let moduleStatus = {};
    try {
      require.resolve('@vercel/postgres');
      moduleStatus.vercelPostgres = 'Available';
    } catch (e) {
      moduleStatus.vercelPostgres = 'Not available';
    }

    try {
      require.resolve('pg');
      moduleStatus.pg = 'Available';
    } catch (e) {
      moduleStatus.pg = 'Not available';
    }

    res.status(200).json({
      success: true,
      message: 'Database configuration check completed',
      timestamp: new Date().toISOString(),
      environment_variables: envStatus,
      module_status: moduleStatus
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database check failed',
      details: error.message
    });
  }
};