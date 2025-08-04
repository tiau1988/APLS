// Database initialization script
// Run this once to create the registrations table

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use POST or GET.' });
  }

  try {
    // For now, just test the endpoint without database operations
    // TODO: Add database operations after confirming API works
    
    res.status(200).json({
      success: true,
      message: 'Database initialization endpoint is working! (Database operations will be added after Postgres is configured)',
      timestamp: new Date().toISOString(),
      method: req.method,
      vercel: process.env.VERCEL ? 'true' : 'false'
    });

  } catch (error) {
    console.error('Initialization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process request',
      details: error.message
    });
  }
}