// Admin API endpoint for viewing all registrations
// Updated to work with shared storage system

import { getAllRegistrations, getRegistrationStats } from '../shared-storage.js';

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
    // Get all registrations from shared storage
    const registrations = await getAllRegistrations();
    
    // Format registrations for admin display
    const formattedRegistrations = registrations.map(reg => ({
      registration_id: reg.registration_id || reg.registrationId,
      full_name: `${reg.first_name || reg.firstName} ${reg.last_name || reg.lastName}`,
      email: reg.email,
      phone: reg.phone || '-',
      club_name: reg.club_name || reg.clubName || '-',
      district: reg.district || '-',
      position: reg.position || '-',
      registration_type: reg.registration_type || reg.registrationType,
      total_amount: reg.total_amount || reg.totalAmount,
      status: reg.status,
      created_at: reg.registration_date || reg.registrationDate
    }));

    // Get statistics from shared storage
    const statistics = await getRegistrationStats();

    res.status(200).json({
      success: true,
      registrations: formattedRegistrations,
      statistics: statistics,
      total: formattedRegistrations.length,
      system_info: {
        storage_method: 'shared_memory',
        note: 'Using shared storage - your new registrations will appear here!',
        last_updated: new Date().toISOString()
      }
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