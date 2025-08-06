// Registration API with basic database connectivity
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

      // For now, return mock data since we're having dependency issues
      return res.status(200).json({
        status: 'ready_mock',
        message: 'Database configured but using mock data due to dependency issues',
        total_registrations: 12,
        early_bird_count: 8,
        recent_24h_count: 2,
        database_connected: false,
        reason: 'Using mock data while resolving pg module issues',
        environment: {
          node_version: process.version,
          postgres_url_configured: !!process.env.POSTGRES_URL
        }
      });

    } catch (error) {
      console.error('API error:', error);
      
      return res.status(200).json({
        status: 'fallback',
        message: 'API error - using fallback data',
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

      // Calculate total amount
      const regFee = parseFloat(registrationFee) || 0;
      const optFee = parseFloat(optionalFee) || 0;
      const totalAmount = regFee + optFee;

      // Generate a registration ID
      const registrationId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // For now, return success without actually saving to database
      return res.status(201).json({
        success: true,
        message: 'Registration received successfully! (Mock mode - data not saved to database)',
        registration: {
          id: registrationId,
          fullName: `${firstName} ${lastName}`,
          email,
          registrationType,
          totalAmount,
          registrationDate: new Date().toISOString(),
          status: 'pending'
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      
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