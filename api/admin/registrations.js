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
      
      res.status(200).json({
        success: true,
        registrations: registrations,
        stats: stats
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