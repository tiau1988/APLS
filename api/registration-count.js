// API endpoint for getting registration counts
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
    // Get total registrations
    const totalResult = await sql`
      SELECT COUNT(*) as total FROM registrations;
    `;

    // Get confirmed registrations
    const confirmedResult = await sql`
      SELECT COUNT(*) as confirmed 
      FROM registrations 
      WHERE status = 'confirmed';
    `;

    // Get pending registrations
    const pendingResult = await sql`
      SELECT COUNT(*) as pending 
      FROM registrations 
      WHERE status = 'pending';
    `;

    // Get recent registrations (last 24 hours)
    const recentResult = await sql`
      SELECT COUNT(*) as recent 
      FROM registrations 
      WHERE registration_date >= NOW() - INTERVAL '24 hours';
    `;

    const counts = {
      total: parseInt(totalResult.rows[0].total),
      confirmed: parseInt(confirmedResult.rows[0].confirmed),
      pending: parseInt(pendingResult.rows[0].pending),
      recent: parseInt(recentResult.rows[0].recent),
      available: Math.max(0, 500 - parseInt(totalResult.rows[0].total)) // Assuming 500 total slots
    };

    res.status(200).json({
      success: true,
      counts: counts
    });

  } catch (error) {
    console.error('Count fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch registration counts',
      details: error.message
    });
  }
};