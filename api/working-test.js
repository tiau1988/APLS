module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.status(200).json({
    success: true,
    message: "This is a new test endpoint created to verify deployment",
    timestamp: new Date().toISOString(),
    node_version: process.version,
    environment: process.env.NODE_ENV || 'unknown'
  });
};