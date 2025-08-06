module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).json({ message: 'CORS preflight handled' });
    return;
  }

  try {
    // Check environment variables
    const dbUrl = process.env.POSTGRES_URL;
    
    // Check Node.js version and environment
    const nodeVersion = process.version;
    const platform = process.platform;
    const arch = process.arch;
    
    // Try to require pg module
    let pgAvailable = false;
    let pgError = null;
    
    try {
      require('pg');
      pgAvailable = true;
    } catch (error) {
      pgError = error.message;
    }

    res.status(200).json({
      status: 'info',
      environment: {
        nodeVersion,
        platform,
        arch,
        hasPostgresUrl: !!dbUrl,
        postgresUrlLength: dbUrl ? dbUrl.length : 0,
        pgModuleAvailable: pgAvailable,
        pgError: pgError,
        cwd: process.cwd(),
        env: process.env.NODE_ENV || 'not set'
      },
      message: pgAvailable ? 'pg module is available' : 'pg module not found'
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      stack: error.stack
    });
  }
};