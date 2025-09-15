/**
 * Netlify Function: Admin Registrations Handler (Neon Version)
 * 
 * This is the updated version of admin-registrations.js that works with Neon database
 * instead of Supabase. It provides admin access to view all registrations.
 * 
 * Key Changes from Supabase version:
 * - Uses @neondatabase/serverless instead of @supabase/supabase-js
 * - Uses raw SQL queries instead of Supabase query builder
 * - Updated error handling and response formats
 * - Maintains same admin authentication logic
 */

const { neon } = require('@neondatabase/serverless');

// Initialize Neon SQL client
const sql = neon(process.env.NEON_DATABASE_URL);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

// Admin credentials (in production, use proper authentication)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@aplls2026.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

/**
 * Verify admin credentials
 */
function verifyAdminCredentials(email, password) {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

/**
 * Get all registrations from database
 */
async function getAllRegistrations() {
  try {
    const registrations = await sql`
      SELECT 
        registration_id,
        first_name,
        last_name,
        email,
        phone,
        residence_country,
        passport_nric,
        gender,
        address,
        club_name,
        district,
        other_district,
        ppoas_position,
        district_cabinet_position,
        club_position,
        position,
        position_in_ngo,
        other_ngos,
        registration_type,
        vegetarian,
        poolside_party,
        community_service,
        installation_banquet,
        terms_conditions,
        marketing_emails,
        privacy_policy,
        total_amount,
        payment_slip_url,
        status,
        created_at
      FROM registrations 
      ORDER BY created_at DESC
    `;
    
    return registrations;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Failed to fetch registrations from database');
  }
}

/**
 * Get registration statistics
 */
async function getRegistrationStats() {
  try {
    // Get total registrations
    const totalResult = await sql`
      SELECT COUNT(*) as count 
      FROM registrations 
      WHERE status != 'cancelled'
    `;
    
    // Get registrations by type
    const typeStatsResult = await sql`
      SELECT 
        registration_type,
        COUNT(*) as count
      FROM registrations 
      WHERE status != 'cancelled'
      GROUP BY registration_type
    `;
    
    // Get registrations by status
    const statusStatsResult = await sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM registrations 
      GROUP BY status
    `;
    
    // Get registrations by district
    const districtStatsResult = await sql`
      SELECT 
        district,
        COUNT(*) as count
      FROM registrations 
      WHERE status != 'cancelled' AND district IS NOT NULL AND district != ''
      GROUP BY district
      ORDER BY count DESC
    `;
    
    // Get recent registrations (last 7 days)
    const recentResult = await sql`
      SELECT COUNT(*) as count 
      FROM registrations 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      AND status != 'cancelled'
    `;
    
    // Calculate early bird remaining
    const earlyBirdResult = await sql`
      SELECT COUNT(*) as count 
      FROM registrations 
      WHERE registration_type = 'early_bird' 
      AND status != 'cancelled'
    `;
    
    const total = parseInt(totalResult[0].count);
    const earlyBird = parseInt(earlyBirdResult[0].count);
    const earlyBirdRemaining = Math.max(0, 100 - earlyBird); // Assuming 100 early bird slots
    const recent = parseInt(recentResult[0].count);
    
    // Format type stats
    const typeStats = {};
    typeStatsResult.forEach(row => {
      typeStats[row.registration_type] = parseInt(row.count);
    });
    
    // Format status stats
    const statusStats = {};
    statusStatsResult.forEach(row => {
      statusStats[row.status] = parseInt(row.count);
    });
    
    // Format district stats
    const districtStats = districtStatsResult.map(row => ({
      district: row.district,
      count: parseInt(row.count)
    }));
    
    return {
      total,
      early_bird: earlyBird,
      early_bird_remaining: earlyBirdRemaining,
      recent_7_days: recent,
      by_type: typeStats,
      by_status: statusStats,
      by_district: districtStats
    };
  } catch (error) {
    console.error('Database stats query error:', error);
    throw new Error('Failed to get registration statistics');
  }
}

/**
 * Format registration data for admin view
 */
function formatRegistrationData(registrations) {
  return registrations.map(reg => ({
    id: reg.registration_id,
    registrationId: reg.registration_id,
    firstName: reg.first_name,
    lastName: reg.last_name,
    email: reg.email,
    phone: reg.phone,
    residenceCountry: reg.residence_country,
    passportNric: reg.passport_nric,
    gender: reg.gender,
    address: reg.address,
    clubName: reg.club_name,
    district: reg.district,
    otherDistrict: reg.other_district,
    ppoasPosition: reg.ppoas_position,
    districtCabinetPosition: reg.district_cabinet_position,
    clubPosition: reg.club_position,
    position: reg.position,
    positionInNgo: reg.position_in_ngo,
    otherNgos: reg.other_ngos,
    registrationType: reg.registration_type,
    vegetarian: reg.vegetarian,
    poolsideParty: reg.poolside_party,
    communityService: reg.community_service,
    installationBanquet: reg.installation_banquet,
    termsConditions: reg.terms_conditions,
    marketingEmails: reg.marketing_emails,
    privacyPolicy: reg.privacy_policy,
    totalAmount: reg.total_amount,
    paymentSlipUrl: reg.payment_slip_url,
    status: reg.status,
    createdAt: reg.created_at,
    // Additional computed fields
    fullName: `${reg.first_name} ${reg.last_name}`.trim(),
    hasPaymentSlip: !!reg.payment_slip_url,
    registrationDate: new Date(reg.created_at).toLocaleDateString(),
    registrationTime: new Date(reg.created_at).toLocaleTimeString()
  }));
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
    // Get admin credentials from query parameters, headers, or X-Admin-Token
    const { email, password } = event.queryStringParameters || {};
    const authHeader = event.headers.authorization || event.headers.Authorization;
    const adminToken = event.headers['x-admin-token'] || event.headers['X-Admin-Token'];
    
    let adminEmail = email;
    let adminPassword = password;
    
    // Check X-Admin-Token header first (used by admin.html)
    if (adminToken && adminToken === ADMIN_PASSWORD) {
      // Valid admin token, proceed without further authentication
    } else if (!adminEmail && !adminPassword && authHeader) {
      // Try to extract credentials from Authorization header if not in query params
      try {
        const base64Credentials = authHeader.replace('Basic ', '');
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [headerEmail, headerPassword] = credentials.split(':');
        adminEmail = headerEmail;
        adminPassword = headerPassword;
      } catch (error) {
        console.error('Failed to parse authorization header:', error);
      }
    }
    
    // Verify admin credentials (skip if valid admin token was provided)
    if (!adminToken || adminToken !== ADMIN_PASSWORD) {
      if (!verifyAdminCredentials(adminEmail, adminPassword)) {
        return {
          statusCode: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'WWW-Authenticate': 'Basic realm="Admin Access"'
          },
          body: JSON.stringify({
            success: false,
            error: 'Unauthorized. Invalid admin credentials.'
          })
        };
      }
    }
    
    // Get all registrations and statistics
    const [registrations, stats] = await Promise.all([
      getAllRegistrations(),
      getRegistrationStats()
    ]);
    
    // Format the data
    const formattedRegistrations = formatRegistrationData(registrations);
    
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        registrations: formattedRegistrations,
        statistics: {
          total_registrations: stats.total,
          total_revenue: formattedRegistrations.reduce((sum, reg) => sum + (reg.totalAmount || 0), 0),
          early_bird_count: stats.early_bird,
          standard_count: stats.by_type?.standard || 0
        },
        data: {
          registrations: formattedRegistrations,
          stats,
          meta: {
            total_count: formattedRegistrations.length,
            last_updated: new Date().toISOString(),
            database: 'Neon PostgreSQL'
          }
        }
      })
    };
    
  } catch (error) {
    console.error('Admin registrations error:', error);
    
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch admin data',
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