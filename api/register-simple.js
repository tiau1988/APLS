// Registration API with Neon database integration
const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

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
    try {
      // Test database connection
      const client = await pool.connect();
      const result = await client.query('SELECT COUNT(*) as count FROM registrations');
      client.release();
      
      return res.status(200).json({
        message: "Registration API with Neon Database is operational",
        status: "ready",
        database: {
          connected: true,
          total_registrations: parseInt(result.rows[0].count)
        },
        environment: {
          node_version: process.version,
          postgres_url_configured: !!process.env.POSTGRES_URL,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      return res.status(500).json({
        message: "Database connection failed",
        status: "error",
        error: error.message,
        environment: {
          node_version: process.version,
          postgres_url_configured: !!process.env.POSTGRES_URL,
          timestamp: new Date().toISOString()
        }
      });
    }
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
    
    if (poolsideParty === 'Yes') optionalFee += 50;
    if (communityService === 'Yes') optionalFee += 30;
    if (installationBanquet === 'Yes') optionalFee += 120;
    
    const totalAmount = registrationFee + optionalFee;

    // Generate a registration ID
    const registrationId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Save to database
    const client = await pool.connect();
    
    try {
      const insertQuery = `
        INSERT INTO registrations (
          first_name, last_name, email, phone, organization, position,
          gender, address, district, other_district, ppoas_position,
          district_cabinet_position, club_position, position_in_ngo, other_ngos,
          registration_type, registration_fee, optional_fee, total_amount,
          vegetarian, poolside_party, community_service, installation_banquet,
          terms_conditions, marketing_emails, privacy_policy, registration_id,
          status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
        ) RETURNING id, registration_date
      `;
      
      const values = [
        firstName || '', lastName || '', email, phone || '', 
        clubName || '', position || '', gender || '', address || '',
        district || '', otherDistrict || '', ppoasPosition || '',
        districtCabinetPosition || '', clubPosition || '', positionInNgo || '', otherNgos || '',
        registrationType, registrationFee, optionalFee, totalAmount,
        vegetarian || '', poolsideParty || '', communityService || '', installationBanquet || '',
        termsConditions || false, marketingEmails || false, privacyPolicy || false,
        registrationId, 'pending'
      ];

      const result = await client.query(insertQuery, values);
      const savedRegistration = result.rows[0];

      // Return success response
      return res.status(200).json({
        success: true,
        message: "Registration saved successfully to database!",
        data: {
          id: savedRegistration.id,
          registrationId,
          fullName: fullName || `${firstName} ${lastName}`,
          email,
          phone,
          clubName,
          district,
          position,
          registrationType,
          totalAmount,
          registrationFee,
          optionalFee,
          registrationDate: savedRegistration.registration_date,
          status: 'pending'
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate email error
    if (error.code === '23505' && error.constraint === 'registrations_email_key') {
      return res.status(400).json({
        success: false,
        error: 'Email already registered',
        message: 'This email address has already been used for registration.'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to save registration',
      details: error.message
    });
  }
};