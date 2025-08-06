// Test environment variables and database connection
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
    const envCheck = {
      postgres_url_exists: !!process.env.POSTGRES_URL,
      postgres_url_length: process.env.POSTGRES_URL ? process.env.POSTGRES_URL.length : 0,
      postgres_url_starts_with: process.env.POSTGRES_URL ? process.env.POSTGRES_URL.substring(0, 20) + '...' : 'not set',
      node_version: process.version,
      all_env_keys: Object.keys(process.env).filter(key => key.includes('POSTGRES') || key.includes('DATABASE'))
    };

    // Try to import @vercel/postgres
    let importError = null;
    let sqlFunction = null;
    
    try {
      const { sql } = require('@vercel/postgres');
      sqlFunction = typeof sql;
    } catch (error) {
      importError = error.message;
    }

    return res.status(200).json({
      message: "Environment test completed",
      environment: envCheck,
      postgres_module: {
        import_success: !importError,
        import_error: importError,
        sql_function_type: sqlFunction
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Test failed',
      details: error.message,
      stack: error.stack
    });
  }
};