const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
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
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get total registrations count
    const { count: totalCount, error: totalError } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('Error fetching total count:', totalError);
      throw totalError;
    }

    // Get early bird registrations count (registration_type = 'early-bird')
    const { count: earlyBirdCount, error: earlyBirdError } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('registration_type', 'early-bird');

    if (earlyBirdError) {
      console.error('Error fetching early bird count:', earlyBirdError);
      throw earlyBirdError;
    }

    // Get registrations from last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { count: recentCount, error: recentError } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday.toISOString());

    if (recentError) {
      console.error('Error fetching recent count:', recentError);
      throw recentError;
    }

    const stats = {
      totalCount: totalCount || 0,
      earlyBirdCount: earlyBirdCount || 0,
      recentCount: recentCount || 0,
      earlyBirdLimit: 150, // Set your early bird limit here
      earlyBirdRemaining: Math.max(0, 150 - (earlyBirdCount || 0))
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(stats)
    };

  } catch (error) {
    console.error('Error in registration-stats function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};