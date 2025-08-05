// Simple database connection test
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Check if we can import @vercel/postgres
    let postgresModule;
    try {
      postgresModule = require('@vercel/postgres');
      
      // Try to make a simple query
      const { sql } = postgresModule;
      const result = await sql`SELECT NOW() as current_time`;
      
      res.status(200).json({
        success: true,
        message: "Database connection successful",
        postgres_module: "Available",
        current_time: result.rows[0].current_time,
        environment_variables: {
          POSTGRES_URL: process.env.POSTGRES_URL ? 'Set' : 'Not set',
          POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? 'Set' : 'Not set'
        }
      });
      
    } catch (moduleError) {
      res.status(500).json({
        success: false,
        error: "Cannot load @vercel/postgres module",
        details: moduleError.message,
        environment_variables: {
          POSTGRES_URL: process.env.POSTGRES_URL ? 'Set' : 'Not set',
          POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? 'Set' : 'Not set'
        },
        suggestion: "The @vercel/postgres dependency may not be installed properly"
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database connection test failed',
      details: error.message
    });
  }
};