module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Basic environment check
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      message: "Database test endpoint is working",
      environment: {
        postgres_url_exists: !!process.env.POSTGRES_URL,
        postgres_url_length: process.env.POSTGRES_URL ? process.env.POSTGRES_URL.length : 0,
        postgres_url_preview: process.env.POSTGRES_URL ? process.env.POSTGRES_URL.substring(0, 20) + '...' : 'Not set'
      },
      node_info: {
        version: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    res.status(200).json(response);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Test failed',
      details: error.message
    });
  }
};