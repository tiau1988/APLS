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
    // Check if environment variable is set
    const dbUrl = process.env.POSTGRES_URL;
    
    if (!dbUrl) {
      return res.status(200).json({
        status: 'error',
        message: 'POSTGRES_URL environment variable not set',
        hasEnvVar: false
      });
    }

    // Try to use postgres client
    const postgres = require('postgres');
    
    // Create connection
    const sql = postgres(dbUrl, {
      ssl: 'require'
    });

    // Test the connection
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    
    // Close connection
    await sql.end();

    res.status(200).json({
      status: 'success',
      message: 'Database connection successful with postgres client',
      hasEnvVar: true,
      postgresClientAvailable: true,
      currentTime: result[0].current_time,
      pgVersion: result[0].pg_version,
      connectionString: dbUrl ? `${dbUrl.substring(0, 20)}...` : 'not set'
    });

  } catch (error) {
    console.error('Database test error:', error);
    res.status(200).json({
      status: 'error',
      message: error.message,
      hasEnvVar: !!process.env.POSTGRES_URL,
      postgresClientAvailable: false,
      errorType: error.constructor.name
    });
  }
};