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
          '3. Go to Settings > Environment Variables',
          '4. Add your Neon database connection strings'
        ]
      });
    }

    // Try to import and test database connection
    const { sql } = require('@vercel/postgres');
    const result = await sql`SELECT NOW() as current_time`;
    
    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      timestamp: result.rows[0].current_time,
      environment_variables: envStatus,
      next_steps: [
        '✅ Database connected',
        '👉 Visit /api/init-db to create tables',
        '🎯 Then test registration form'
      ]
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      details: error.message,
      environment_variables: {
        POSTGRES_URL: process.env.POSTGRES_URL ? 'Set' : 'Not set',
        POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? 'Set' : 'Not set',
        POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? 'Set' : 'Not set'
      }
    });
  }
};