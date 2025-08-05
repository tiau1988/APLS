// Simplified registration API using native pg module
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
      message: "Simplified Registration API is operational",
      status: "ready",
      environment: {
        node_version: process.version,
        postgres_url_configured: !!process.env.POSTGRES_URL,
        timestamp: new Date().toISOString()
      },
      note: "This version stores data in memory for testing. Database integration pending."
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // For POST requests, validate and simulate database storage
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

    // Simulate database storage (for now)
    const registrationData = {
      registrationId,
      databaseId: Math.floor(Math.random() * 1000) + 1,
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
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Registration processed successfully (simulated database storage)",
      data: registrationData,
      note: "Once database tables are created in Neon, this will save to actual database"
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