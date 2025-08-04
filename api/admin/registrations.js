// Admin API endpoint for viewing all registrations
const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all registrations with details
    const result = await sql`
      SELECT 
        id,
        first_name,
        last_name,
        email,
        phone,
        organization,
        position,
        country,
        dietary_restrictions,
        accessibility_needs,
        emergency_contact_name,
        emergency_contact_phone,
        registration_date,
        status
      FROM registrations 
      ORDER BY registration_date DESC;
    `;

    // Get summary statistics
    const statsResult = await sql`
      SELECT 
        COUNT(*) as total_registrations,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_count,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count
      FROM registrations;
    `;

    res.status(200).json({
      success: true,
      registrations: result.rows,
      statistics: statsResult.rows[0],
      total: result.rows.length
    });

  } catch (error) {
    console.error('Admin fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch registrations',
      details: error.message
    });
  }
};