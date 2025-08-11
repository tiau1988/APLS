// Registration API for Netlify Functions
// Uses Supabase database for permanent storage

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://eragmmdwgtbylrmjzqwf.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  throw new Error('SUPABASE_KEY or SUPABASE_ANON_KEY environment variable is required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions using Supabase
async function getAllRegistrations() {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

async function addRegistration(registration) {
  const { data, error } = await supabase
    .from('registrations')
    .insert([registration])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function findRegistrationByEmail(email) {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
  return data;
}

// Process payment slip file and return URL
async function processPaymentSlip(paymentSlipData, registrationId) {
  if (!paymentSlipData || !paymentSlipData.fileData) {
    return null;
  }
  
  try {
    // Convert base64 data URL to buffer
    const base64Data = paymentSlipData.fileData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    const fileExtension = paymentSlipData.fileName.split('.').pop().toLowerCase();
    const fileName = `payment-slip-${registrationId}.${fileExtension}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('payment-slips')
      .upload(fileName, buffer, {
        contentType: paymentSlipData.fileType,
        upsert: true
      });
    
    if (error) {
      console.error('Supabase Storage upload error:', error);
      return null;
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('payment-slips')
      .getPublicUrl(fileName);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error processing payment slip:', error);
    return null;
  }
}

async function getRegistrationStats() {
  const { data: allRegistrations, error: allError } = await supabase
    .from('registrations')
    .select('registration_type, created_at');
  
  if (allError) throw allError;
  
  const total = allRegistrations?.length || 0;
  const earlyBird = allRegistrations?.filter(r => r.registration_type === 'early-bird').length || 0;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const last24Hours = allRegistrations?.filter(r => new Date(r.created_at) > yesterday).length || 0;
  
  return {
    total,
    earlyBird,
    last24Hours
  };
}

exports.handler = async (event, context) => {
  const req = {
    method: event.httpMethod,
    body: event.body ? JSON.parse(event.body) : {}
  };
  
  const res = {
    setHeader: () => {},
    status: (code) => ({ json: (data) => ({ statusCode: code, body: JSON.stringify(data) }), end: () => ({ statusCode: code, body: '' }) }),
    json: (data) => ({ statusCode: 200, body: JSON.stringify(data) })
  };
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  if (req.method === 'GET') {
    try {
      // Get registration statistics
      const stats = await getRegistrationStats();

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'ready_supabase',
          message: 'Registration system ready - using Supabase database!',
          total_registrations: stats.total,
          early_bird_count: stats.earlyBird,
          recent_24h_count: stats.last24Hours,
          database_connected: true,
          database_info: {
            provider: 'Supabase',
            client: '@supabase/supabase-js',
            connection_method: 'REST API',
            status: 'Production Ready - Permanent Storage'
          },
          environment: {
            node_version: process.version,
            storage_method: 'supabase_postgresql',
            note: 'Using Supabase PostgreSQL for permanent data storage'
          }
        })
      };

    } catch (error) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'error',
          message: 'Failed to get statistics',
          error: error.message,
          total_registrations: 0,
          database_connected: false
        })
      };
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        clubName,
        position,
        district,
        registrationType,
        totalAmount,
        paymentSlip
      } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !phone || !clubName || !position || !district || !registrationType) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            message: 'All required fields must be provided'
          })
        };
      }

      // Check for duplicate email
      const existingRegistration = await findRegistrationByEmail(email);
      if (existingRegistration) {
        return {
          statusCode: 409,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            message: 'Email already registered. Please use a different email address.'
          })
        };
      }

      // Generate registration ID
      const registrationId = `APLLS-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Process payment slip if provided
      let paymentSlipUrl = null;
      if (paymentSlip) {
        paymentSlipUrl = await processPaymentSlip(paymentSlip, registrationId);
      }

      // Create registration object
      const registration = {
        registration_id: registrationId,
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        phone,
        club_name: clubName,
        position,
        district,
        registration_type: registrationType,
        total_amount: parseFloat(totalAmount) || 0,
        payment_slip_url: paymentSlipUrl,
        status: 'pending'
      };

      // Save to Supabase database
      const savedRegistration = await addRegistration(registration);

      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          message: 'Registration submitted successfully!',
          registration_id: registrationId,
          data: {
            id: savedRegistration.id,
            registration_id: registrationId,
            name: `${firstName} ${lastName}`,
            email: email.toLowerCase(),
            club_name: clubName,
            registration_type: registrationType,
            total_amount: parseFloat(totalAmount) || 0,
            status: 'pending'
          }
        })
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          message: 'Failed to process registration. Please try again.',
          error: error.message
        })
      };
    }
  }

  return {
    statusCode: 405,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: false,
      message: 'Method not allowed. Use GET or POST.'
    })
  };
}