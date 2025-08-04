// API endpoint for getting registration counts
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
    // Get total registrations
    const totalResult = await sql`
      SELECT COUNT(*) as total FROM registrations;
    `;

    // Get early bird registrations (assuming early bird ends on a specific date)
    const earlyBirdResult = await sql`
      SELECT COUNT(*) as early_bird 
      FROM registrations 
      WHERE registration_type = 'early-bird';
    `;

    // Get recent registrations (last 24 hours)
    const recentResult = await sql`
      SELECT COUNT(*) as recent 
      FROM registrations 
      WHERE created_at >= NOW() - INTERVAL '24 hours';
    `;

    const counts = {
      total: parseInt(totalResult.rows[0].total),
      earlyBird: parseInt(earlyBirdResult.rows[0].early_bird),
      recent: parseInt(recentResult.rows[0].recent),
      earlyBirdAvailable: Math.max(0, 100 - parseInt(earlyBirdResult.rows[0].early_bird)) // Assuming 100 early bird slots
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
}