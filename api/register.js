// API endpoint for handling registration submissions
// Simplified version for Vercel serverless environment

export default async function handler(req, res) {
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

  // For POST requests, validate basic data and return success
  try {
    const { fullName, email, clubName, district, registrationType } = req.body;

    // Basic validation
    if (!fullName || !email || !clubName || !district || !registrationType) {
      return res.status(400).json({
        success: false,
        error: 'Required fields missing',
        required: ['fullName', 'email', 'clubName', 'district', 'registrationType']
      });
    }

    // Calculate fees (same logic as before)
    const registrationPrices = {
      'early-bird': 260,
      'standard': 390,
      'late': 430
    };
    
    const registrationFee = registrationPrices[registrationType] || 0;
    let optionalFee = 0;
    
    if (req.body.poolsideParty) optionalFee += 50;
    if (req.body.communityService) optionalFee += 30;
    if (req.body.installationBanquet) optionalFee += 120;
    
    const totalAmount = registrationFee + optionalFee;

    // Generate a registration ID
    const registrationId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Return success response (database storage will be implemented later)
    return res.status(200).json({
      success: true,
      message: "Registration received successfully",
      data: {
        registrationId,
        fullName,
        email,
        clubName,
        district,
        registrationType,
        totalAmount,
        registrationFee,
        optionalFee,
        timestamp: new Date().toISOString()
      },
      note: "Registration data validated. Database storage will be implemented in the next update."
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}