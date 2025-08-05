module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const fs = require('fs');
    const path = require('path');
    
    // Check what's in the current directory
    let directoryContents = [];
    try {
      directoryContents = fs.readdirSync('/var/task');
    } catch (e) {
      directoryContents = ['Error reading directory: ' + e.message];
    }

    // Check if node_modules exists
    let nodeModulesExists = false;
    let nodeModulesContents = [];
    try {
      nodeModulesExists = fs.existsSync('/var/task/node_modules');
      if (nodeModulesExists) {
        nodeModulesContents = fs.readdirSync('/var/task/node_modules');
      }
    } catch (e) {
      nodeModulesContents = ['Error reading node_modules: ' + e.message];
    }

    // Check package.json
    let packageJson = null;
    try {
      const packagePath = '/var/task/package.json';
      if (fs.existsSync(packagePath)) {
        packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      }
    } catch (e) {
      packageJson = { error: e.message };
    }

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      node_version_update: "Updated to Node.js 22.x",
      runtime_info: {
        node_version: process.version,
        platform: process.platform,
        arch: process.arch,
        cwd: process.cwd(),
        env_vercel: process.env.VERCEL,
        env_node_env: process.env.NODE_ENV
      },
      directory_contents: directoryContents,
      node_modules: {
        exists: nodeModulesExists,
        contents: nodeModulesContents.slice(0, 20) // Limit to first 20 items
      },
      package_json: packageJson,
      environment_variables: {
        POSTGRES_URL: process.env.POSTGRES_URL ? 'Set' : 'Not set',
        POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? 'Set' : 'Not set',
        POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? 'Set' : 'Not set'
      },
      database_modules: {
        vercel_postgres: (() => {
          try {
            require.resolve('@vercel/postgres');
            return 'Available';
          } catch (e) {
            return 'Not available: ' + e.message;
          }
        })(),
        pg: (() => {
          try {
            require.resolve('pg');
            return 'Available';
          } catch (e) {
            return 'Not available: ' + e.message;
          }
        })()
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Debug failed',
      details: error.message
    });
  }
};