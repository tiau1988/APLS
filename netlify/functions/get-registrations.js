const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Method not allowed'
      })
    };
  }

  try {
    // Fetch only public registration data (ID, name, club_name)
    const { data: registrations, error } = await supabase
      .from('registrations')
      .select('id, first_name, last_name, club_name')
      .order('id', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Failed to fetch registrations from database'
        })
      };
    }

    // Format the data and filter out any records with missing essential data
    const formattedRegistrations = registrations.map(reg => ({
      id: reg.id,
      name: `${reg.first_name} ${reg.last_name}`.trim(),
      club_name: reg.club_name || 'N/A'
    }));
    
    const validRegistrations = formattedRegistrations.filter(reg => 
      reg.id && reg.name && reg.name.trim() !== ''
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        registrations: validRegistrations,
        count: validRegistrations.length
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error'
      })
    };
  }
};