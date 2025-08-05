// API endpoint for handling registration submissions
// Full implementation with database storage

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

  // Handle GET requests for testing
  if (req.method === 'GET') {
    return res.status(200).json({
      message: "Registration API is operational",
      status: "ready",
      environment: {
        node_version: process.version,
        postgres_url_configured: !!process.env.POSTGRES_URL,
        timestamp: new Date().toISOString()
      },
      endpoints: {
        POST: "Submit registration data",
        GET: "Check service status"
      }
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // For POST requests, validate and save to database
  try {
    const { 
      firstName, lastName, fullName, email, phone, 
      clubName, district, otherDistrict, position,
      ppoasPosition, districtCabinetPosition, clubPosition, positionInNgo, otherNgos,
      registrationType, gender, address, vegetarian,
      poolsideParty, communityService, installationBanquet,
      termsConditions, marketingEmails, privacyPolicy
    } = req.body;

    // Basic validation
    const requiredFields = ['email', 'registrationType'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Required fields missing',
        missing: missingFields
      });
    }

    // Calculate fees
    const registrationPrices = {
      'early-bird': 260,
      'standard': 390,
      'late': 430
    };
    
    const registrationFee = registrationPrices[registrationType] || 0;
    let optionalFee = 0;
    
    if (poolsideParty) optionalFee += 50;
    if (communityService) optionalFee += 30;
    if (installationBanquet) optionalFee += 120;
    
    const totalAmount = registrationFee + optionalFee;

    // Generate a registration ID
    const registrationId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Save to database
    const result = await sql`
      INSERT INTO registrations (
        first_name, last_name, email, phone, organization, position,
        registration_date, status, gender, address, district, other_district,
        ppoas_position, district_cabinet_position, club_position, position_in_ngo, other_ngos,
        registration_type, registration_fee, optional_fee, total_amount,
        vegetarian, poolside_party, community_service, installation_banquet,
        terms_conditions, marketing_emails, privacy_policy, registration_id
      ) VALUES (
        ${firstName || ''}, ${lastName || ''}, ${email}, ${phone || ''}, 
        ${clubName || ''}, ${position || ''}, NOW(), 'pending', ${gender || ''}, 
        ${address || ''}, ${district || ''}, ${otherDistrict || ''},
        ${ppoasPosition || ''}, ${districtCabinetPosition || ''}, ${clubPosition || ''}, 
        ${positionInNgo || ''}, ${otherNgos || ''}, ${registrationType}, 
        ${registrationFee}, ${optionalFee}, ${totalAmount}, ${vegetarian || ''},
        ${poolsideParty || ''}, ${communityService || ''}, ${installationBanquet || ''},
        ${termsConditions || false}, ${marketingEmails || false}, ${privacyPolicy || false},
        ${registrationId}
      ) RETURNING id
    `;

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Registration saved successfully to database",
      data: {
        registrationId,
        databaseId: result.rows[0].id,
        fullName: fullName || `${firstName} ${lastName}`,
        email,
        clubName,
        district,
        registrationType,
        totalAmount,
        registrationFee,
        optionalFee,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save registration',
      details: error.message
    });
  }
}