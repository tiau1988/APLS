import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Export the handler function
export const handler = async (event, context) => {
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
    const { count: totalRegistrations, error: totalError } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true });
    
    if (totalError) {
      throw totalError;
    }

    // Get early bird registrations count (before March 1, 2025)
    const { count: earlyBirdRegistrations, error: earlyBirdError } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', '2025-03-01T00:00:00.000Z');
    
    if (earlyBirdError) {
      throw earlyBirdError;
    }

    const stats = {
      success: true,
      data: {
        total: totalRegistrations || 0,
        early_bird: earlyBirdRegistrations || 0,
        early_bird_limit: 150,
        early_bird_remaining: Math.max(0, 150 - (earlyBirdRegistrations || 0)),
        early_bird_available: (earlyBirdRegistrations || 0) < 150,
        recent_24h: 0 // This would require additional query for last 24h registrations
      }
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