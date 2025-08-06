// Simple health check API
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.status(200).json({
    status: 'healthy',
    message: 'API is working',
    timestamp: new Date().toISOString(),
    environment: {
      node_version: process.version,
      postgres_url_configured: !!process.env.POSTGRES_URL
    }
  });
};