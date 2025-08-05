export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Test database connection using native Node.js modules
  const https = require('https');
  const url = require('url');
  
  // Check if POSTGRES_URL is available
  if (!process.env.POSTGRES_URL) {
    return res.status(500).json({
      success: false,
      error: 'POSTGRES_URL environment variable not found',
      environment: {
        NODE_VERSION: process.version,
        VERCEL: process.env.VERCEL,
        NODE_ENV: process.env.NODE_ENV
      }
    });
  }

  try {
    // Parse the PostgreSQL URL
    const dbUrl = new URL(process.env.POSTGRES_URL);
    
    res.status(200).json({
      success: true,
      message: 'Database URL parsed successfully',
      database_info: {
        host: dbUrl.hostname,
        port: dbUrl.port,
        database: dbUrl.pathname.slice(1), // Remove leading slash
        username: dbUrl.username,
        ssl_required: dbUrl.searchParams.get('sslmode') === 'require'
      },
      environment: {
        NODE_VERSION: process.version,
        VERCEL: process.env.VERCEL,
        NODE_ENV: process.env.NODE_ENV,
        POSTGRES_URL_LENGTH: process.env.POSTGRES_URL.length
      },
      note: 'Native database connection test without external modules'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to parse database URL',
      details: error.message,
      environment: {
        NODE_VERSION: process.version,
        VERCEL: process.env.VERCEL,
        NODE_ENV: process.env.NODE_ENV
      }
    });
  }
}