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
    const optionalPrices = {
      'poolside-party': 50,
      'community-service': 30,
      'installation-banquet': 120
    };

    if (poolsideParty && poolsideParty !== '') optionalFee += optionalPrices['poolside-party'] || 0;
    if (communityService && communityService !== '') optionalFee += optionalPrices['community-service'] || 0;
    if (installationBanquet && installationBanquet !== '') optionalFee += optionalPrices['installation-banquet'] || 0;

    const totalAmount = registrationFee + optionalFee;

    // Determine primary position
    let primaryPosition = '';
    if (ppoasPosition && ppoasPosition !== '') primaryPosition = ppoasPosition;
    else if (districtCabinetPosition && districtCabinetPosition !== '') primaryPosition = districtCabinetPosition;
    else if (clubPosition && clubPosition !== '') primaryPosition = clubPosition;
    else if (positionInNgo && positionInNgo !== '') primaryPosition = positionInNgo;

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