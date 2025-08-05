// Simple database connection test endpoint
const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).json({ message: 'CORS preflight handled' });
    return;
  }

  // Check environment variables first
  const envVars = {
    POSTGRES_URL: process.env.POSTGRES_URL ? 'Set' : 'Missing',
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? 'Set' : 'Missing',
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? 'Set' : 'Missing'
  };

  try {
    // Test basic database connection
    const result = await sql`SELECT NOW() as current_time, version() as postgres_version`;
    
    // Check if registrations table exists
    let tableExists = false;
    let tableInfo = null;
    
    try {
      const tableCheck = await sql`
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'registrations'
        ORDER BY ordinal_position
      `;
      tableExists = tableCheck.rows.length > 0;
      tableInfo = tableCheck.rows;
    } catch (tableError) {
      console.log('Table check error:', tableError.message);
    }

    // Get registration count if table exists
    let registrationCount = 0;
    if (tableExists) {
      try {
        const countResult = await sql`SELECT COUNT(*) as count FROM registrations`;
        registrationCount = parseInt(countResult.rows[0].count);
      } catch (countError) {
        console.log('Count error:', countError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Database connection successful! 🎉',
      environment: envVars,
      connection: {
        connected: true,
        timestamp: result.rows[0].current_time,
        version: result.rows[0].postgres_version
      },
      table: {
        exists: tableExists,
        columns: tableInfo,
        registrationCount: registrationCount
      },
      nextSteps: tableExists ? 
        ['✅ Database connected', '✅ Table exists', '🎯 Ready to accept registrations!'] :
        ['✅ Database connected', '⚠️ Need to initialize tables', '👉 Visit /api/init-db to create tables']
    });

  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      details: error.message,
      environment: envVars,
      troubleshooting: [
        '1. Check if database is created in Vercel Dashboard',
        '2. Verify environment variables are set',
        '3. Try redeploying the project',
        '4. Check Vercel function logs for detailed errors'
      ]
    });
  }
};