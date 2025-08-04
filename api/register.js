// API endpoint for handling registration submissions
// This will work with Vercel's serverless functions

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      fullName,
      email,
      phone,
      clubName,
      district,
      position,
      registrationType,
      totalAmount,
      optionalPrograms,
      paymentSlip
    } = req.body;

    // Generate unique registration ID
    const registrationId = 'APLLS2026-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    // Insert registration into database
    const result = await sql`
      INSERT INTO registrations (
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
        payment_slip,
        created_at
      ) VALUES (
        ${registrationId},
        ${fullName},
        ${email},
        ${phone},
        ${clubName},
        ${district},
        ${position},
        ${registrationType},
        ${totalAmount},
        ${JSON.stringify(optionalPrograms)},
        ${paymentSlip || null},
        NOW()
      )
      RETURNING *;
    `;

    res.status(200).json({
      success: true,
      message: 'Registration successful!',
      registrationId: registrationId,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process registration',
      details: error.message
    });
  }
}