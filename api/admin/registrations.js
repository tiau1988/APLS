// Admin API endpoint for viewing all registrations
// Updated to work with shared storage system

import { getAllRegistrations, getRegistrationStats } from '../shared-storage.js';

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const registrations = getAllRegistrations();
      const stats = getRegistrationStats();
      
      // Format registrations for admin display
      const formattedRegistrations = registrations.map(reg => ({
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
        created_at: reg.registration_date
      }));
      
      // Format stats for admin display
      const formattedStats = {
        total_registrations: stats.total,
        early_bird_count: stats.earlyBird,
        standard_count: stats.regular,
        recent_24h_count: stats.last24Hours,
        total_revenue: stats.totalRevenue,
        confirmed_count: stats.confirmed,
        pending_count: stats.pending
      };
      
      res.status(200).json({
        success: true,
        registrations: formattedRegistrations,
        statistics: formattedStats
      });
    } catch (error) {
      console.error('Error fetching registrations:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch registrations',
        message: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}