// Test deployment endpoint
export default function handler(req, res) {
  res.status(200).json({
    message: "New deployment test endpoint",
    timestamp: new Date().toISOString(),
    deployment_id: "deploy-test-" + Date.now(),
    method: req.method,
    node_version: process.version
  });
}