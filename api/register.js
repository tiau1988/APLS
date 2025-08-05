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
      fullName,
      email,
      phone,
      gender,
      address,
      clubName,
      district,
      otherDistrict,
      ppoasPosition,
      districtCabinetPosition,
      clubPosition,
      positionInNgo,
      otherNgos,
      registrationType,
      vegetarian,
      poolsideParty,
      communityService,
      installationBanquet,
      termsConditions,
      marketingEmails,
      privacyPolicy,
      registrationDate,
      registrationId
    } = req.body;

    // Basic validation
    if (!fullName || !email || !clubName || !district || !registrationType) {
      return res.status(400).json({
        success: false,
        error: 'Full name, email, club name, district, and registration type are required'
      });
    }

    // Split full name into first and last name
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Calculate total amount based on registration type and optional programs
    let registrationFee = 0;
    const registrationPrices = {
      'early-bird': 260,
      'standard': 390,
      'late': 430
    };
    registrationFee = registrationPrices[registrationType] || 0;

    let optionalFee = 0;
    
    // Calculate optional fees based on selections
    if (poolsideParty && poolsideParty !== '') optionalFee += 50;
    if (communityService && communityService !== '') optionalFee += 30;
    if (installationBanquet && installationBanquet !== '') optionalFee += 120;

    const totalAmount = registrationFee + optionalFee;

    // Determine primary position
    let primaryPosition = '';
    if (ppoasPosition && ppoasPosition !== '') primaryPosition = ppoasPosition;
    else if (districtCabinetPosition && districtCabinetPosition !== '') primaryPosition = districtCabinetPosition;
    else if (clubPosition && clubPosition !== '') primaryPosition = clubPosition;
    else if (positionInNgo && positionInNgo !== '') primaryPosition = positionInNgo;

    // First, ensure basic table exists
    await sql`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        organization VARCHAR(255),
        position VARCHAR(255),
        total_amount INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending',
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Try to add new columns if they don't exist
    const newColumns = [
      'ALTER TABLE registrations ADD COLUMN IF NOT EXISTS gender VARCHAR(20)',
      'ALTER TABLE registrations ADD COLUMN IF NOT EXISTS address TEXT',
      'ALTER TABLE registrations ADD COLUMN IF NOT EXISTS district VARCHAR(100)',
      'ALTER TABLE registrations ADD COLUMN IF NOT EXISTS other_district VARCHAR(100)',
      'ALTER TABLE registrations ADD COLUMN IF NOT EXISTS ppoas_position VARCHAR(100)',
      'ALTER TABLE registrations ADD COLUMN IF NOT EXISTS district_cabinet_position VARCHAR(100)',
      'ALTER TABLE registrations ADD COLUMN IF NOT EXISTS club_position VARCHAR(100)',
      'ALTER TABLE registrations ADD COLUMN IF NOT EXISTS position_in_ngo VARCHAR(100)',
      'ALTER TABLE registrations ADD COLUMN IF NOT EXISTS other_ngos TEXT',
      'ALTER TABLE registrations ADD COLUMN IF NOT EXISTS registration_type VARCHAR(50)',
      'ALTER TABLE registrations ADD COLUMN IF NOT EXISTS registration_fee INTEGER DEFAULT 0',
      'ALTER TABLE registrations ADD COLUMN IF NOT EXISTS optional_fee INTEGER DEFAULT 0',
      'ALTER TABLE registrations ADD COLUMN IF NOT EXISTS vegetarian VARCHAR(20)',
      'ALTER TABLE registrations ADD COLUMN IF NOT EXISTS poolside_party VARCHAR(50)',
      'ALTER TABLE registrations ADD COLUMN IF NOT EXISTS community_service VARCHAR(50)',
      'ALTER TABLE registrations ADD COLUMN IF NOT EXISTS installation_banquet VARCHAR(50)',
      'ALTER TABLE registrations ADD COLUMN IF NOT EXISTS terms_conditions BOOLEAN DEFAULT FALSE',
      'ALTER TABLE registrations ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT FALSE',
      'ALTER TABLE registrations ADD COLUMN IF NOT EXISTS privacy_policy BOOLEAN DEFAULT FALSE',
      'ALTER TABLE registrations ADD COLUMN IF NOT EXISTS registration_id VARCHAR(50) UNIQUE',
      'ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_slip_url VARCHAR(500)'
    ];

    for (const columnSql of newColumns) {
      try {
        await sql.query(columnSql);
      } catch (error) {
        // Column might already exist, continue
        console.log('Column addition note:', error.message);
      }
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
        registration_date,
        status,
        gender,
        address,
        district,
        other_district,
        ppoas_position,
        district_cabinet_position,
        club_position,
        position_in_ngo,
        other_ngos,
        registration_type,
        registration_fee,
        optional_fee,
        total_amount,
        vegetarian,
        poolside_party,
        community_service,
        installation_banquet,
        terms_conditions,
        marketing_emails,
        privacy_policy,
        registration_id
      ) VALUES (
        ${firstName},
        ${lastName},
        ${email},
        ${phone || null},
        ${clubName},
        ${primaryPosition || null},
        ${registrationDate || new Date().toISOString()},
        'pending',
        ${gender || null},
        ${address || null},
        ${district},
        ${otherDistrict || null},
        ${ppoasPosition || null},
        ${districtCabinetPosition || null},
        ${clubPosition || null},
        ${positionInNgo || null},
        ${otherNgos || null},
        ${registrationType},
        ${registrationFee},
        ${optionalFee},
        ${totalAmount},
        ${vegetarian || null},
        ${poolsideParty || null},
        ${communityService || null},
        ${installationBanquet || null},
        ${termsConditions === 'on' || termsConditions === true},
        ${marketingEmails === 'on' || marketingEmails === true},
        ${privacyPolicy === 'on' || privacyPolicy === true},
        ${registrationId || `APC2026-${Date.now()}`}
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