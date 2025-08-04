// Admin API endpoint for viewing all registrations
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
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
        registration_id,
        full_name,
        email,
        phone,
        club_name,
        district,
        position,
        registration_type,
        total_amount,
        optional_programs,
        created_at
      FROM registrations 
      ORDER BY created_at DESC;
    `;

    // Get summary statistics
    const statsResult = await sql`
      SELECT 
        COUNT(*) as total_registrations,
        SUM(total_amount) as total_revenue,
        COUNT(CASE WHEN registration_type = 'early-bird' THEN 1 END) as early_bird_count,
        COUNT(CASE WHEN registration_type = 'standard' THEN 1 END) as standard_count,
        COUNT(CASE WHEN registration_type = 'late' THEN 1 END) as late_count
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
}