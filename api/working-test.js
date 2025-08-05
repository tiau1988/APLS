module.exports = (req, res) => {
  res.status(200).json({
    message: "Working test endpoint",
    timestamp: new Date().toISOString(),
    method: req.method,
    deployment_id: Math.random().toString(36).substring(7)
  });
};