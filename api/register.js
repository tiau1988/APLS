// Production Registration API using shared storage
// This is the main registration endpoint for your website
// Updated to use shared storage so registrations appear in admin panel

import { getAllRegistrations, addRegistration, findRegistrationByEmail, getRegistrationStats } from './shared-storage.js';

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
      // Get registration statistics from shared storage
      const stats = getRegistrationStats();

      return res.status(200).json({
        status: 'ready_production',
        message: 'Registration system ready - using shared storage!',
        total_registrations: stats.total_registrations,
        early_bird_count: stats.early_bird_count,
        recent_24h_count: stats.recent_24h_count,
        database_connected: true,
        database_info: {
          provider: 'Shared Storage',
          client: 'In-Memory',
          connection_method: 'Direct Access',
          status: 'Fully operational'
        },
        environment: {
          node_version: process.version,
          storage_method: 'shared_memory',
          note: 'Your registrations will appear in admin panel!'
        }
      });

    } catch (error) {
      return res.status(500).json({
        status: 'database_error',
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
        firstName, lastName, email, phone, clubName, position, gender, address,
        district, otherDistrict, ppoasPosition, districtCabinetPosition, clubPosition,
        positionInNgo, otherNgos, registrationType, registrationFee, optionalFee,
        vegetarian, poolsideParty, communityService, installationBanquet,
        termsConditions, marketingEmails, privacyPolicy
      } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: firstName, lastName, email'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Check if email already exists
      const existingRegistration = findRegistrationByEmail(email);
      if (existingRegistration) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered. Please use a different email address.',
          existing_registration: {
            registrationId: existingRegistration.registrationId,
            fullName: `${existingRegistration.firstName} ${existingRegistration.lastName}`,
            registrationDate: existingRegistration.registrationDate
          }
        });
      }

      // Generate registration ID
      const registrationId = `APLLS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Calculate total amount
      const regFee = parseFloat(registrationFee) || 0;
      const optFee = parseFloat(optionalFee) || 0;
      const totalAmount = regFee + optFee;

      // Create new registration object
      const newRegistration = {
        registrationId,
        firstName,
        lastName,
        email,
        phone,
        clubName,
        position,
        gender,
        address,
        district,
        otherDistrict,
        ppoasPosition,
        districtCabinetPosition,
        clubPosition,
        positionInNgo,
        otherNgos,
        registrationType,
        registrationFee: regFee,
        optionalFee: optFee,
        totalAmount,
        vegetarian,
        poolsideParty,
        communityService,
        installationBanquet,
        termsConditions,
        marketingEmails,
        privacyPolicy,
        status: 'confirmed'
      };

      // Save to shared storage
      const savedRegistration = addRegistration(newRegistration);

      return res.status(201).json({
        success: true,
        message: 'Registration completed successfully!',
        registration: {
          id: savedRegistration.id,
          registrationId: savedRegistration.registrationId,
          fullName: `${firstName} ${lastName}`,
          email,
          registrationType,
          totalAmount,
          registrationDate: savedRegistration.registrationDate,
          status: savedRegistration.status
        },
        database_info: {
          provider: 'Shared Storage',
          client: 'In-Memory',
          status: 'Production Ready'
        },
        next_steps: [
          'Registration confirmed and saved to shared storage',
          'Your registration will appear in the admin panel',
          'Please keep your registration ID for future reference'
        ]
      });

    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.',
        error: error.message,
        support: 'If the problem persists, please contact support'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed. Use GET or POST.'
  });
}