module.exports = (req, res) => {
  res.status(200).json({
    message: 'Hello from Vercel API! - UPDATED',
    timestamp: new Date().toISOString(),
    deployment_test: 'Runtime fix applied',
    version: '2.0'
  });
};