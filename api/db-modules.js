module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Check database modules availability
    let moduleStatus = {};
    
    // Check @vercel/postgres
    try {
      require.resolve('@vercel/postgres');
      moduleStatus.vercel_postgres = 'Available';
      try {
        const { sql } = require('@vercel/postgres');
        moduleStatus.vercel_postgres_import = 'Success';
      } catch (importError) {
        moduleStatus.vercel_postgres_import = 'Failed: ' + importError.message;
      }
    } catch (e) {
      moduleStatus.vercel_postgres = 'Not available: ' + e.message;
    }

    // Check pg module
    try {
      require.resolve('pg');
      moduleStatus.pg = 'Available';
      try {
        const { Client } = require('pg');
        moduleStatus.pg_import = 'Success';
      } catch (importError) {
        moduleStatus.pg_import = 'Failed: ' + importError.message;
      }
    } catch (e) {
      moduleStatus.pg = 'Not available: ' + e.message;
    }

    // Environment variables check
    const envStatus = {
      POSTGRES_URL: process.env.POSTGRES_URL ? 'Set' : 'Not set',
      POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? 'Set' : 'Not set',
      POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? 'Set' : 'Not set'
    };

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      environment_variables: envStatus,
      module_status: moduleStatus,
      recommendations: getRecommendations(moduleStatus, envStatus)
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Module check failed',
      details: error.message,
      stack: error.stack
    });
  }
};

function getRecommendations(moduleStatus, envStatus) {
  const recommendations = [];
  
  if (envStatus.POSTGRES_URL === 'Not set') {
    recommendations.push('❌ PostgreSQL URL not configured');
    recommendations.push('🔧 Connect your database in Vercel Dashboard > Storage');
  } else {
    recommendations.push('✅ PostgreSQL environment variables are set');
  }
  
  if (moduleStatus.vercel_postgres === 'Available') {
    recommendations.push('✅ @vercel/postgres module is available');
  } else {
    recommendations.push('❌ @vercel/postgres module not found');
    recommendations.push('🔧 Try using Vercel Storage integration');
  }
  
  if (moduleStatus.pg === 'Available') {
    recommendations.push('✅ pg module is available');
  } else {
    recommendations.push('❌ pg module not found');
    recommendations.push('📦 Install pg package manually');
  }
  
  return recommendations;
}