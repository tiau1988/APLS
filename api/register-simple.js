// Registration API - Simplified version without database dependency
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle GET requests for testing and counter data
  if (req.method === 'GET') {
    // Return mock data for now (will be replaced with real database later)
    return res.status(200).json({
      message: "Registration API is operational (Mock data mode)",
      status: "ready_mock",
      database: {
        connected: false,
        reason: "Using mock data for testing"
      },
      environment: {
        node_version: process.version,
        postgres_url_configured: !!process.env.POSTGRES_URL,
        timestamp: new Date().toISOString()
      },
      totalRegistrations: 15,
      earlyBirdCount: 8,
      recent24h: 3
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // For POST requests, validate and simulate saving
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

    // Simulate successful registration (no database save for now)
    return res.status(200).json({
      success: true,
      message: "Registration received successfully! (Mock mode - data not saved to database)",
      data: {
        id: Math.floor(Math.random() * 1000),
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
        registrationDate: new Date().toISOString(),
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to process registration',
      details: error.message
    });
  }
};