/**
 * Netlify Function: Registration Statistics (Neon Version)
 * 
 * This is the updated version of registration-stats.js that works with Neon database
 * instead of Supabase. It provides public registration statistics.
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

// Configuration
const EARLY_BIRD_LIMIT = 100; // Maximum early bird registrations
const TOTAL_CAPACITY = 500;   // Maximum total registrations

/**
 * Get comprehensive registration statistics
 */
async function getRegistrationStats() {
  try {
    // Get total registrations (excluding cancelled)
    const totalResult = await sql`
      SELECT COUNT(*) as count 
      FROM registrations 
      WHERE status != 'cancelled'
    `;
    
    // Get early bird registrations
    const earlyBirdResult = await sql`
      SELECT COUNT(*) as count 
      FROM registrations 
      WHERE registration_type = 'early_bird' 
      AND status != 'cancelled'
    `;
    
    // Get regular registrations
    const regularResult = await sql`
      SELECT COUNT(*) as count 
      FROM registrations 
      WHERE registration_type = 'regular' 
      AND status != 'cancelled'
    `;
    
    // Get registrations by status
    const statusStatsResult = await sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM registrations 
      GROUP BY status
    `;
    
    // Get recent registrations (last 24 hours)
    const recentResult = await sql`
      SELECT COUNT(*) as count 
      FROM registrations 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      AND status != 'cancelled'
    `;
    
    // Get registrations by district (top 10)
    const districtStatsResult = await sql`
      SELECT 
        district,
        COUNT(*) as count
      FROM registrations 
      WHERE status != 'cancelled' 
      AND district IS NOT NULL 
      AND district != ''
      GROUP BY district
      ORDER BY count DESC
      LIMIT 10
    `;
    
    // Get registrations with payment slips
    const paidResult = await sql`
      SELECT COUNT(*) as count 
      FROM registrations 
      WHERE payment_slip_url IS NOT NULL 
      AND payment_slip_url != ''
      AND status != 'cancelled'
    `;
    
    // Parse results
    const total = parseInt(totalResult[0].count);
    const earlyBird = parseInt(earlyBirdResult[0].count);
    const regular = parseInt(regularResult[0].count);
    const recent24h = parseInt(recentResult[0].count);
    const withPayment = parseInt(paidResult[0].count);
    
    // Calculate derived statistics
    const earlyBirdRemaining = Math.max(0, EARLY_BIRD_LIMIT - earlyBird);
    const totalRemaining = Math.max(0, TOTAL_CAPACITY - total);
    const earlyBirdAvailable = earlyBirdRemaining > 0;
    const registrationOpen = totalRemaining > 0;
    
    // Format status stats
    const statusStats = {};
    statusStatsResult.forEach(row => {
      statusStats[row.status] = parseInt(row.count);
    });
    
    // Format district stats
    const districtStats = districtStatsResult.map(row => ({
      district: row.district,
      count: parseInt(row.count),
      percentage: ((parseInt(row.count) / total) * 100).toFixed(1)
    }));
    
    return {
      // Main statistics
      total,
      early_bird: earlyBird,
      regular,
      with_payment: withPayment,
      
      // Availability
      early_bird_remaining: earlyBirdRemaining,
      total_remaining: totalRemaining,
      early_bird_available: earlyBirdAvailable,
      registration_open: registrationOpen,
      
      // Limits
      early_bird_limit: EARLY_BIRD_LIMIT,
      total_capacity: TOTAL_CAPACITY,
      
      // Recent activity
      recent_24h: recent24h,
      
      // Breakdown statistics
      by_status: statusStats,
      top_districts: districtStats,
      
      // Percentages
      early_bird_percentage: total > 0 ? ((earlyBird / total) * 100).toFixed(1) : '0.0',
      capacity_used_percentage: ((total / TOTAL_CAPACITY) * 100).toFixed(1),
      payment_completion_rate: total > 0 ? ((withPayment / total) * 100).toFixed(1) : '0.0',
      
      // Meta information
      last_updated: new Date().toISOString(),
      database: 'Neon PostgreSQL'
    };
  } catch (error) {
    console.error('Database stats query error:', error);
    throw new Error('Failed to get registration statistics');
  }
}

/**
 * Get simplified stats for quick display
 */
async function getSimpleStats() {
  try {
    const totalResult = await sql`
      SELECT COUNT(*) as count 
      FROM registrations 
      WHERE status != 'cancelled'
    `;
    
    const earlyBirdResult = await sql`
      SELECT COUNT(*) as count 
      FROM registrations 
      WHERE registration_type = 'early_bird' 
      AND status != 'cancelled'
    `;
    
    const total = parseInt(totalResult[0].count);
    const earlyBird = parseInt(earlyBirdResult[0].count);
    const earlyBirdRemaining = Math.max(0, EARLY_BIRD_LIMIT - earlyBird);
    
    return {
      total,
      early_bird: earlyBird,
      early_bird_remaining: earlyBirdRemaining,
      early_bird_available: earlyBirdRemaining > 0,
      registration_open: total < TOTAL_CAPACITY
    };
  } catch (error) {
    console.error('Database simple stats query error:', error);
    throw new Error('Failed to get simple registration statistics');
  }
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
    // Check if simple stats are requested
    const { simple } = event.queryStringParameters || {};
    
    let stats;
    if (simple === 'true') {
      stats = await getSimpleStats();
    } else {
      stats = await getRegistrationStats();
    }
    
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60' // Cache for 1 minute
      },
      body: JSON.stringify({
        success: true,
        data: stats
      })
    };
    
  } catch (error) {
    console.error('Registration stats error:', error);
    
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to get registration statistics',
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