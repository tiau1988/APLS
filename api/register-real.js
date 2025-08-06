// Real Registration API using Airtable for persistent storage
// This allows real registrations that persist and can be viewed by admin

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Airtable configuration (you'll need to set these environment variables)
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = 'Registrations';

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return res.status(200).json({
      status: 'setup_required',
      message: 'Airtable not configured - setup required',
      setup_instructions: {
        step1: 'Go to https://airtable.com and create a free account',
        step2: 'Create a new base called "APLLS 2026 Registrations"',
        step3: 'Create a table called "Registrations" with these fields:',
        fields: [
          'firstName (Single line text)',
          'lastName (Single line text)', 
          'email (Email)',
          'phone (Phone number)',
          'clubName (Single line text)',
          'registrationType (Single select: early-bird, regular)',
          'totalAmount (Number)',
          'registrationDate (Date)',
          'status (Single select: pending, confirmed, cancelled)'
        ],
        step4: 'Get your API key from https://airtable.com/account',
        step5: 'Get your Base ID from the API documentation',
        step6: 'Add AIRTABLE_API_KEY and AIRTABLE_BASE_ID to Vercel environment variables'
      },
      total_registrations: 0,
      database_connected: false
    });
  }

  if (req.method === 'GET') {
    try {
      // Fetch all registrations from Airtable
      const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
      
      const response = await fetch(airtableUrl, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const data = await response.json();
      const registrations = data.records || [];

      // Calculate statistics
      const totalRegistrations = registrations.length;
      const earlyBirdCount = registrations.filter(r => 
        r.fields.registrationType === 'early-bird'
      ).length;

      // Recent 24h count
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const recent24hCount = registrations.filter(r => {
        const regDate = new Date(r.fields.registrationDate);
        return regDate > yesterday;
      }).length;

      return res.status(200).json({
        status: 'ready_live_airtable',
        message: 'Connected to Airtable - live registration data',
        total_registrations: totalRegistrations,
        early_bird_count: earlyBirdCount,
        recent_24h_count: recent24hCount,
        database_connected: true,
        storage_method: 'airtable',
        registrations: registrations.map(r => ({
          id: r.id,
          firstName: r.fields.firstName,
          lastName: r.fields.lastName,
          email: r.fields.email,
          registrationType: r.fields.registrationType,
          totalAmount: r.fields.totalAmount,
          registrationDate: r.fields.registrationDate,
          status: r.fields.status
        })),
        environment: {
          node_version: process.version,
          airtable_configured: true
        }
      });

    } catch (error) {
      return res.status(200).json({
        status: 'airtable_error',
        message: 'Failed to connect to Airtable',
        error: error.message,
        total_registrations: 0,
        database_connected: false
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
      if (!firstName || !lastName || !email) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: firstName, lastName, email'
        });
      }

      // Check for duplicate email in Airtable
      const checkUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula={email}="${email}"`;
      
      const checkResponse = await fetch(checkUrl, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.records && checkData.records.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'Email already registered',
            existing_registration: {
              firstName: checkData.records[0].fields.firstName,
              lastName: checkData.records[0].fields.lastName,
              registrationDate: checkData.records[0].fields.registrationDate
            }
          });
        }
      }

      // Calculate total amount
      const regFee = parseFloat(registrationFee) || 0;
      const optFee = parseFloat(optionalFee) || 0;
      const totalAmount = regFee + optFee;

      // Generate registration ID
      const registrationId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Save to Airtable
      const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
      
      const airtableData = {
        fields: {
          firstName,
          lastName,
          email,
          phone: phone || '',
          clubName: clubName || '',
          position: position || '',
          gender: gender || '',
          address: address || '',
          district: district || '',
          registrationType: registrationType || 'regular',
          registrationFee: regFee,
          optionalFee: optFee,
          totalAmount,
          registrationDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
          status: 'pending',
          registrationId,
          vegetarian: vegetarian || '',
          poolsideParty: poolsideParty || '',
          communityService: communityService || '',
          installationBanquet: installationBanquet || '',
          termsConditions: termsConditions || false,
          marketingEmails: marketingEmails || false,
          privacyPolicy: privacyPolicy || false
        }
      };

      const saveResponse = await fetch(airtableUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(airtableData)
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(`Airtable save failed: ${errorData.error?.message || saveResponse.status}`);
      }

      const savedData = await saveResponse.json();

      return res.status(201).json({
        success: true,
        message: 'Registration saved successfully to Airtable!',
        registration: {
          id: savedData.id,
          registrationId,
          fullName: `${firstName} ${lastName}`,
          email,
          registrationType,
          totalAmount,
          registrationDate: airtableData.fields.registrationDate,
          status: 'pending'
        },
        note: 'Registration saved to persistent Airtable database - you can view all registrations!'
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