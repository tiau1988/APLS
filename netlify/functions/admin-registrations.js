const { neon } = require('@neondatabase/serverless');

// Initialize Neon client
const sql = neon(process.env.NEON_DATABASE_URL);

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    // Get all registrations from the database
    const registrations = await sql`
      SELECT 
        registration_id,
        first_name,
        last_name,
        email,
        residence_country,
        passport_nric,
        payment_slip_url,
        created_at,
        updated_at
      FROM registrations 
      ORDER BY created_at DESC
    `;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        data: registrations,
        count: registrations.length
      })
    };
    
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch registrations: ' + error.message 
      })
    };
  }
};