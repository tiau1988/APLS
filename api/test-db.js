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
    // Check if pg module is available
    const { Pool } = require('pg');
    
    // Check if environment variable is set
    const dbUrl = process.env.POSTGRES_URL;
    
    if (!dbUrl) {
      return res.status(200).json({
        status: 'error',
        message: 'POSTGRES_URL environment variable not set',
        hasEnvVar: false,
        pgModuleAvailable: true
      });
    }

    // Try to create a connection
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Test the connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    client.release();
    await pool.end();

    res.status(200).json({
      status: 'success',
      message: 'Database connection successful',
      hasEnvVar: true,
      pgModuleAvailable: true,
      currentTime: result.rows[0].current_time,
      connectionString: dbUrl ? `${dbUrl.substring(0, 20)}...` : 'not set'
    });

  } catch (error) {
    console.error('Database test error:', error);
    res.status(200).json({
      status: 'error',
      message: error.message,
      hasEnvVar: !!process.env.POSTGRES_URL,
      pgModuleAvailable: true,
      errorType: error.constructor.name
    });
  }
};