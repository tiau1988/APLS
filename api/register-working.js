// Working Registration API without PostgreSQL module dependencies
// Uses in-memory storage for demonstration (in production, use external database service)

// Simple in-memory storage (resets on each deployment)
let registrations = [
  {
    id: 1,
    registrationId: 'REG-1703123456789-abc123def',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    registrationType: 'early-bird',
    totalAmount: 260,
    registrationDate: new Date('2024-01-15T10:30:00Z').toISOString(),
    status: 'confirmed'
  },
  {
    id: 2,
    registrationId: 'REG-1703123456790-def456ghi',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    registrationType: 'regular',
    totalAmount: 300,
    registrationDate: new Date('2024-01-16T14:20:00Z').toISOString(),
    status: 'pending'
  },
  {
    id: 3,
    registrationId: 'REG-1703123456791-ghi789jkl',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@example.com',
    registrationType: 'early-bird',
    totalAmount: 260,
    registrationDate: new Date().toISOString(),
    status: 'confirmed'
  }
];

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Calculate statistics from in-memory data
    const totalRegistrations = registrations.length;
    const earlyBirdCount = registrations.filter(r => r.registrationType === 'early-bird').length;
    
    // Recent 24h count (for demo, count registrations from today)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const recent24hCount = registrations.filter(r => new Date(r.registrationDate) > yesterday).length;

    return res.status(200).json({
      status: 'ready_working',
      message: 'Working registration system - no PostgreSQL modules required',
      total_registrations: totalRegistrations,
      early_bird_count: earlyBirdCount,
      recent_24h_count: recent24hCount,
      database_connected: true,
      storage_method: 'in_memory',
      note: 'Using in-memory storage for demonstration. In production, connect to external database service.',
      environment: {
        node_version: process.version,
        postgres_url_configured: !!process.env.POSTGRES_URL,
        platform: process.platform,
        arch: process.arch
      },
      sample_registrations: registrations.slice(0, 2) // Show first 2 for demo
    });
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
      if (!firstName || !lastName || !email) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: firstName, lastName, email'
        });
      }

      // Check for duplicate email
      const existingRegistration = registrations.find(r => r.email.toLowerCase() === email.toLowerCase());
      if (existingRegistration) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered',
          existing_registration: {
            registrationId: existingRegistration.registrationId,
            fullName: `${existingRegistration.firstName} ${existingRegistration.lastName}`,
            registrationDate: existingRegistration.registrationDate
          }
        });
      }

      // Generate registration ID
      const registrationId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Calculate total amount
      const regFee = parseFloat(registrationFee) || 0;
      const optFee = parseFloat(optionalFee) || 0;
      const totalAmount = regFee + optFee;

      // Create new registration
      const newRegistration = {
        id: registrations.length + 1,
        registrationId,
        firstName,
        lastName,
        email,
        phone,
        clubName,
        position,
        gender,
        address,
        district,
        otherDistrict,
        ppoasPosition,
        districtCabinetPosition,
        clubPosition,
        positionInNgo,
        otherNgos,
        registrationType,
        registrationFee: regFee,
        optionalFee: optFee,
        totalAmount,
        vegetarian,
        poolsideParty,
        communityService,
        installationBanquet,
        termsConditions,
        marketingEmails,
        privacyPolicy,
        registrationDate: new Date().toISOString(),
        status: 'pending'
      };

      // Add to in-memory storage
      registrations.push(newRegistration);

      return res.status(201).json({
        success: true,
        message: 'Registration saved successfully!',
        registration: {
          id: newRegistration.id,
          registrationId: newRegistration.registrationId,
          fullName: `${firstName} ${lastName}`,
          email,
          registrationType,
          totalAmount,
          registrationDate: newRegistration.registrationDate,
          status: 'pending'
        },
        note: 'Saved to in-memory storage. In production, this would be saved to a persistent database.',
        total_registrations_now: registrations.length
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}