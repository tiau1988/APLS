// Admin API endpoint to view all registrations
// This endpoint provides access to all registration data for admin panel
// Uses simple in-memory storage for demonstration

// Simple in-memory storage (shared with register.js)
let registrations = [
  {
    id: 1,
    registration_id: 'APLLS-DEMO-001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+60123456789',
    club_name: 'Lions Club KL',
    position: 'President',
    district: 'District 308B1',
    registration_type: 'early-bird',
    total_amount: 260,
    registration_date: new Date('2024-01-15T10:30:00Z').toISOString(),
    status: 'confirmed'
  },
  {
    id: 2,
    registration_id: 'APLLS-DEMO-002',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+60123456790',
    club_name: 'Lions Club PJ',
    position: 'Secretary',
    district: 'District 308B2',
    registration_type: 'standard',
    total_amount: 390,
    registration_date: new Date('2024-01-16T14:20:00Z').toISOString(),
    status: 'pending'
  }
];

function getAllRegistrations() {
  return registrations;
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
    try {
      // Get all registrations from in-memory storage
      const allRegistrations = getAllRegistrations();
      
      // Calculate statistics
      const total = allRegistrations.length;
      const earlyBird = allRegistrations.filter(r => r.registration_type === 'early-bird').length;
      const standard = allRegistrations.filter(r => r.registration_type === 'standard').length;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const last24Hours = allRegistrations.filter(r => new Date(r.registration_date) > yesterday).length;
      const totalRevenue = allRegistrations.reduce((sum, r) => sum + r.total_amount, 0);
      const confirmed = allRegistrations.filter(r => r.status === 'confirmed').length;
      const pending = allRegistrations.filter(r => r.status === 'pending').length;
      
      // Format registrations for admin display
      const formattedRegistrations = allRegistrations.map(reg => ({
        registration_id: reg.registration_id,
        full_name: `${reg.first_name} ${reg.last_name}`,
        email: reg.email,
        phone: reg.phone || '-',
        club_name: reg.club_name || '-',
        district: reg.district || '-',
        position: reg.position || '-',
        registration_type: reg.registration_type,
        total_amount: reg.total_amount,
        status: reg.status,
        created_at: reg.registration_date,
        payment_slip_url: reg.payment_slip_url || null
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
            provider: 'In-Memory',
            client: 'JavaScript Array',
            connection_method: 'Direct Access',
            status: 'Demo Mode - Connect external DB for production'
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