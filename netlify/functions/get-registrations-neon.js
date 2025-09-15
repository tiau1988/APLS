/**
 * Netlify Function: Get Registrations (Neon Version)
 * 
 * This is the updated version of get-registrations.js that works with Neon database
 * instead of Supabase. It provides public access to view registrations (filtered data).
 * 
 * Key Changes from Supabase version:
 * - Uses @neondatabase/serverless instead of @supabase/supabase-js
 * - Uses raw SQL queries instead of Supabase query builder
 * - Updated error handling and response formats
 */

const { neon } = require('@neondatabase/serverless');

// Initialize Neon SQL client
const sql = neon(process.env.NEON_DATABASE_URL);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

/**
 * Get public registration data (filtered for privacy)
 */
async function getPublicRegistrations() {
  try {
    const registrations = await sql`
      SELECT 
        registration_id,
        first_name,
        last_name,
        club_name,
        district,
        registration_type,
        status,
        created_at
      FROM registrations 
      WHERE status IN ('confirmed', 'pending')
      ORDER BY created_at DESC
    `;
    
    return registrations;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Failed to fetch registrations from database');
  }
}

/**
 * Format registration data for public view (privacy-filtered)
 */
function formatPublicRegistrationData(registrations) {
  return registrations.map(reg => {
    const displayName = `${reg.first_name} ${reg.last_name ? reg.last_name.charAt(0) + '.' : ''}`.trim();
    return {
      id: reg.registration_id,
      registrationId: reg.registration_id,
      firstName: reg.first_name,
      lastName: reg.last_name ? reg.last_name.charAt(0) + '.' : '', // Only show first letter of last name
      name: displayName, // Add name field for compatibility with registrations.html
      clubName: reg.club_name,
      club_name: reg.club_name, // Add snake_case version for compatibility
      district: reg.district,
      registrationType: reg.registration_type,
      status: reg.status,
      registrationDate: new Date(reg.created_at).toLocaleDateString(),
      // Computed fields
      displayName: displayName,
      isEarlyBird: reg.registration_type === 'early_bird'
    };
  });
}

/**
 * Main handler function
 */
exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }
  
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Method not allowed'
      })
    };
  }
  
  try {
    // Get public registrations
    const registrations = await getPublicRegistrations();
    
    // Format the data for public consumption
    const formattedRegistrations = formatPublicRegistrationData(registrations);
    
    // Filter out any records that shouldn't be public
    const validRegistrations = formattedRegistrations.filter(reg => 
      reg.firstName && 
      reg.registrationId && 
      ['confirmed', 'pending'].includes(reg.status)
    );
    
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        registrations: validRegistrations,
        meta: {
          total_count: validRegistrations.length,
          last_updated: new Date().toISOString(),
          database: 'Neon PostgreSQL',
          note: 'This is filtered public data. Personal information is protected.'
        }
      })
    };
    
  } catch (error) {
    console.error('Get registrations error:', error);
    
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch registrations',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

// Database Information:
// - Database: Neon PostgreSQL
// - Connection: @neondatabase/serverless
// - Environment: Production ready
// - Node.js Version: 18.x
// - Neon PostgreSQL Storage: Managed cloud database