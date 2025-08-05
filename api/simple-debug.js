module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV,
        POSTGRES_URL: process.env.POSTGRES_URL ? 'SET' : 'NOT_SET',
        POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? 'SET' : 'NOT_SET',
        POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? 'SET' : 'NOT_SET'
      }
    };

    // Try to check if modules exist
    try {
      require.resolve('@vercel/postgres');
      debugInfo.vercelPostgres = 'AVAILABLE';
    } catch (e) {
      debugInfo.vercelPostgres = 'NOT_AVAILABLE';
      debugInfo.vercelPostgresError = e.message;
    }

    try {
      require.resolve('pg');
      debugInfo.pg = 'AVAILABLE';
    } catch (e) {
      debugInfo.pg = 'NOT_AVAILABLE';
      debugInfo.pgError = e.message;
    }

    res.status(200).json({
      success: true,
      message: 'Debug endpoint working',
      debug: debugInfo
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};