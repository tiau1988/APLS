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
    // Fetch all registrations with summary data
    const registrations = await sql`
      SELECT 
        id as registration_id,
        CONCAT(first_name, ' ', last_name) as full_name,
        email,
        phone,
        organization as club_name,
        district,
        COALESCE(
          NULLIF(ppoas_position, ''),
          NULLIF(district_cabinet_position, ''),
          NULLIF(club_position, ''),
          NULLIF(position_in_ngo, ''),
          position
        ) as position,
        registration_type,
        total_amount,
        status,
        registration_date as created_at,
        registration_id as reg_id
      FROM registrations 
      ORDER BY registration_date DESC
    `;

    // Get summary statistics
    const stats = await sql`
      SELECT 
        COUNT(*) as total_registrations,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COALESCE(SUM(total_amount), 0) as total_revenue
      FROM registrations
    `;

    res.status(200).json({
      success: true,
      registrations: registrations.rows,
      statistics: stats.rows[0],
      total: registrations.rows.length
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