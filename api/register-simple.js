// Registration API with simplified database connectivity
module.exports = async (req, res) => {
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
      // Check if database is configured
      if (!process.env.POSTGRES_URL) {
        return res.status(200).json({
          status: 'ready_no_db',
          message: 'Database not configured - using fallback data',
          total_registrations: 0,
          early_bird_count: 0,
          recent_24h_count: 0,
          database_connected: false,
          reason: 'POSTGRES_URL not configured',
          environment: {
            node_version: process.version,
            postgres_url_configured: false
          }
        });
      }

      // Try to load pg module dynamically
      let Pool;
      try {
        const pg = require('pg');
        Pool = pg.Pool;
      } catch (error) {
        console.log('pg module not available, using fallback');
        return res.status(200).json({
          status: 'fallback_no_pg',
          message: 'PostgreSQL module not available - using fallback data',
          total_registrations: 3,
          early_bird_count: 2,
          recent_24h_count: 1,
          database_connected: false,
          reason: 'pg module not found: ' + error.message,
          environment: {
            node_version: process.version,
            postgres_url_configured: true
          }
        });
      }

      // Connect to database
      const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: { rejectUnauthorized: false }
      });

      // Get real statistics from database
      const totalResult = await pool.query('SELECT COUNT(*) as total FROM registrations');
      const earlyBirdResult = await pool.query("SELECT COUNT(*) as count FROM registrations WHERE registration_type = 'early-bird'");
      const recent24hResult = await pool.query("SELECT COUNT(*) as count FROM registrations WHERE registration_date >= NOW() - INTERVAL '24 hours'");

      const totalRegistrations = parseInt(totalResult.rows[0].total);
      const earlyBirdCount = parseInt(earlyBirdResult.rows[0].count);
      const recent24hCount = parseInt(recent24hResult.rows[0].count);

      await pool.end();

      return res.status(200).json({
        status: 'ready_live',
        message: 'Connected to Neon database - live data',
        total_registrations: totalRegistrations,
        early_bird_count: earlyBirdCount,
        recent_24h_count: recent24hCount,
        database_connected: true,
        reason: 'Live data from Neon PostgreSQL',
        environment: {
          node_version: process.version,
          postgres_url_configured: true
        }
      });

    } catch (error) {
      console.error('Database error:', error);
      
      return res.status(200).json({
        status: 'fallback_error',
        message: 'Database error - using fallback data',
        total_registrations: 5,
        early_bird_count: 3,
        recent_24h_count: 1,
        database_connected: false,
        reason: error.message,
        environment: {
          node_version: process.version,
          postgres_url_configured: !!process.env.POSTGRES_URL
        }
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
      if (!firstName || !lastName || !email || !registrationType) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: firstName, lastName, email, registrationType'
        });
      }

      // Check if database is configured
      if (!process.env.POSTGRES_URL) {
        return res.status(500).json({
          success: false,
          message: 'Database not configured - cannot save registration'
        });
      }

      // Try to load pg module dynamically
      let Pool;
      try {
        const pg = require('pg');
        Pool = pg.Pool;
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Database module not available - cannot save registration',
          error: 'pg_module_missing'
        });
      }

      // Connect to database
      const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: { rejectUnauthorized: false }
      });

      // Calculate total amount
      const regFee = parseFloat(registrationFee) || 0;
      const optFee = parseFloat(optionalFee) || 0;
      const totalAmount = regFee + optFee;

      // Generate a registration ID
      const registrationId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Save to database
      const insertQuery = `
        INSERT INTO registrations (
          first_name, last_name, email, phone, organization, position, gender, address,
          district, other_district, ppoas_position, district_cabinet_position, club_position,
          position_in_ngo, other_ngos, registration_type, registration_fee, optional_fee, total_amount,
          vegetarian, poolside_party, community_service, installation_banquet,
          terms_conditions, marketing_emails, privacy_policy, registration_id, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
        RETURNING id, registration_date
      `;

      const values = [
        firstName, lastName, email, phone, clubName, position, gender, address,
        district, otherDistrict, ppoasPosition, districtCabinetPosition, clubPosition,
        positionInNgo, otherNgos, registrationType, regFee, optFee, totalAmount,
        vegetarian, poolsideParty, communityService, installationBanquet,
        termsConditions, marketingEmails, privacyPolicy, registrationId, 'pending'
      ];

      const result = await pool.query(insertQuery, values);
      const savedRegistration = result.rows[0];

      await pool.end();

      return res.status(201).json({
        success: true,
        message: 'Registration saved successfully to Neon database!',
        registration: {
          id: savedRegistration.id,
          registrationId: registrationId,
          fullName: `${firstName} ${lastName}`,
          email,
          registrationType,
          totalAmount,
          registrationDate: savedRegistration.registration_date,
          status: 'pending'
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle duplicate email error
      if (error.code === '23505' && error.constraint === 'registrations_email_key') {
        return res.status(400).json({
          success: false,
          message: 'Email address already registered',
          error: 'duplicate_email'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Registration failed due to server error',
        error: error.message
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
};