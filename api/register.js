// API endpoint for handling registration submissions
// This will work with Vercel's serverless functions

const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
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
      firstName,
      lastName,
      email,
      phone,
      organization,
      position,
      country,
      dietaryRestrictions,
      accessibilityNeeds,
      emergencyContactName,
      emergencyContactPhone
    } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        error: 'First name, last name, and email are required'
      });
    }

    // Insert registration into database
    const result = await sql`
      INSERT INTO registrations (
        first_name,
        last_name,
        email,
        phone,
        organization,
        position,
        country,
        dietary_restrictions,
        accessibility_needs,
        emergency_contact_name,
        emergency_contact_phone,
        status
      ) VALUES (
        ${firstName},
        ${lastName},
        ${email},
        ${phone || null},
        ${organization || null},
        ${position || null},
        ${country || null},
        ${dietaryRestrictions || null},
        ${accessibilityNeeds || null},
        ${emergencyContactName || null},
        ${emergencyContactPhone || null},
        'pending'
      )
      RETURNING *;
    `;

    res.status(200).json({
      success: true,
      message: 'Registration successful!',
      registrationId: result.rows[0].id,
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
};