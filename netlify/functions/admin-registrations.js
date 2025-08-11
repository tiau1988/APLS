// Admin API endpoint to view all registrations
// This endpoint provides access to all registration data for admin panel
// Uses Supabase database for permanent storage

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://eragmmdwgtbylrmjzqwf.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  throw new Error('SUPABASE_KEY or SUPABASE_ANON_KEY environment variable is required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Admin authentication configuration
const ADMIN_PASSWORD = 'APLLS2026'; // Should match frontend password
const ADMIN_TOKEN_HEADER = 'x-admin-token';

// Helper function to verify admin authentication
function verifyAdminAuth(headers) {
  const token = headers[ADMIN_TOKEN_HEADER] || headers['X-Admin-Token'];
  return token === ADMIN_PASSWORD;
}

// Helper function to get all registrations from Supabase
async function getAllRegistrations() {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

exports.handler = async (event, context) => {
  const req = {
    method: event.httpMethod
  };

  if (req.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  if (req.method === 'GET') {
    // Check admin authentication
    if (!verifyAdminAuth(event.headers)) {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: 'Unauthorized access',
          message: 'Admin authentication required'
        })
      };
    }

    try {
      // Get all registrations from Supabase
      const allRegistrations = await getAllRegistrations();
      
      // Calculate statistics
      const total = allRegistrations.length;
      const earlyBird = allRegistrations.filter(r => r.registration_type === 'early-bird').length;
      const standard = allRegistrations.filter(r => r.registration_type === 'standard').length;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const last24Hours = allRegistrations.filter(r => new Date(r.created_at) > yesterday).length;
      const totalRevenue = allRegistrations.reduce((sum, r) => sum + (r.total_amount || 0), 0);
      const confirmed = allRegistrations.filter(r => r.status === 'confirmed').length;
      const pending = allRegistrations.filter(r => r.status === 'pending').length;
      
      // Format registrations for admin display
      const formattedRegistrations = allRegistrations.map(reg => ({
        registration_id: reg.registration_id,
        full_name: `${reg.first_name} ${reg.last_name}`,
        email: reg.email,
        phone: reg.phone || '-',
        residence_country: reg.residence_country || '-',
        passport_nric: reg.passport_nric || '-',
        club_name: reg.club_name || '-',
        district: reg.district || '-',
        position: reg.position || '-',
        registration_type: reg.registration_type,
        total_amount: reg.total_amount,
        status: reg.status,
        payment_slip_url: reg.payment_slip_url,
        created_at: reg.created_at
      }));
      
      // Format stats for admin display
      const formattedStats = {
        total_registrations: total,
        early_bird_count: earlyBird,
        standard_count: standard,
        recent_24h_count: last24Hours,
        total_revenue: totalRevenue,
        confirmed_count: confirmed,
        pending_count: pending
      };
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          registrations: formattedRegistrations,
          statistics: formattedStats,
          database_info: {
            provider: 'Supabase',
            client: '@supabase/supabase-js',
            connection_method: 'REST API',
            status: 'Production Ready - Permanent Storage'
          }
        })
      };
    } catch (error) {
      console.error('Error fetching registrations:', error);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: 'Failed to fetch registrations',
          message: error.message
        })
      };
    }
  } else {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
}