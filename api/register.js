// Registration API for Netlify Functions
// Uses simple in-memory storage for demonstration
// In production, connect to external database service

import { v4 as uuidv4 } from 'uuid';

// Simple in-memory storage (resets on each deployment)
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

// Helper functions
function getAllRegistrations() {
  return registrations;
}

function addRegistration(registration) {
  const newId = registrations.length > 0 
    ? Math.max(...registrations.map(r => r.id)) + 1 
    : 1;
  
  const newRegistration = {
    ...registration,
    id: newId
  };
  
  registrations.push(newRegistration);
  return newRegistration;
}

function findRegistrationByEmail(email) {
  return registrations.find(reg => reg.email.toLowerCase() === email.toLowerCase());
}

function getRegistrationStats() {
  const total = registrations.length;
  const earlyBird = registrations.filter(r => r.registration_type === 'early-bird').length;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const last24Hours = registrations.filter(r => new Date(r.registration_date) > yesterday).length;
  
  return {
    total,
    earlyBird,
    last24Hours
  };
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // Get registration statistics
      const stats = getRegistrationStats();

      return res.status(200).json({
        status: 'ready_netlify',
        message: 'Registration system ready - using in-memory storage for demo!',
        total_registrations: stats.total,
        early_bird_count: stats.earlyBird,
        recent_24h_count: stats.last24Hours,
        database_connected: true,
        database_info: {
          provider: 'In-Memory',
          client: 'JavaScript Array',
          connection_method: 'Direct Access',
          status: 'Demo Mode - Connect external DB for production'
        },
        environment: {
          node_version: process.version,
          storage_method: 'in_memory_demo',
          note: 'Connect to external database service for production use!'
        }
      });

    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get statistics',
        error: error.message,
        total_registrations: 0,
        database_connected: false
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        clubName,
        position,
        district,
        registrationType,
        totalAmount,
        paymentSlip
      } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !phone || !clubName || !position || !district || !registrationType) {
        return res.status(400).json({
          success: false,
          message: 'All required fields must be provided'
        });
      }

      // Check for duplicate email
      const existingRegistration = findRegistrationByEmail(email);
      if (existingRegistration) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered. Please use a different email address.'
        });
      }

      // Generate registration ID
      const registrationId = `APLLS-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Create registration object
      const registration = {
        registration_id: registrationId,
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        phone,
        club_name: clubName,
        position,
        district,
        registration_type: registrationType,
        total_amount: parseFloat(totalAmount) || 0,
        payment_slip_url: paymentSlip || null,
        registration_date: new Date().toISOString(),
        status: 'pending'
      };

      // Save to in-memory storage
      const savedRegistration = addRegistration(registration);

      return res.status(201).json({
        success: true,
        message: 'Registration submitted successfully!',
        registration_id: registrationId,
        data: {
          id: savedRegistration.id,
          registration_id: registrationId,
          name: `${firstName} ${lastName}`,
          email: email.toLowerCase(),
          club_name: clubName,
          registration_type: registrationType,
          total_amount: parseFloat(totalAmount) || 0,
          status: 'pending'
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process registration. Please try again.',
        error: error.message
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed. Use GET or POST.'
  });
}