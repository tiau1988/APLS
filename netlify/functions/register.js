// Registration API for Netlify Functions
// Uses Neon database for permanent storage and Cloudinary for file uploads

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Helper functions for Supabase

// Payment slip processing is now handled inline with Supabase Storage

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    try {
      const { data: allRegistrations, error } = await supabase
        .from('registrations')
        .select('registration_type, created_at');
      
      if (error) throw error;
      
      const total = allRegistrations?.length || 0;
      const earlyBird = allRegistrations?.filter(r => r.registration_type === 'early-bird').length || 0;
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const last24Hours = allRegistrations?.filter(r => new Date(r.created_at) > yesterday).length || 0;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'ready_supabase',
          message: 'Registration system ready - using Supabase!',
          total_registrations: total,
          early_bird_count: earlyBird,
          recent_24h_count: last24Hours,
          database_connected: true,
          database_info: {
            provider: 'Supabase',
            client: '@supabase/supabase-js',
            connection_method: 'REST API',
            status: 'Production Ready - Serverless PostgreSQL'
          }
        })
      };

    } catch (error) {
      return {
        statusCode: 500,
        headers,
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

  if (event.httpMethod === 'POST') {
    try {
      const requestData = JSON.parse(event.body);
      const {
        firstName,
        lastName,
        email,
        phone,
        residenceCountry,
        passportNric,
        gender,
        address,
        clubName,
        district,
        otherDistrict,
        ppoasPosition,
        districtCabinetPosition,
        clubPosition,
        positionInNgo,
        otherNgos,
        registrationType,
        vegetarian,
        poolsideParty,
        communityService,
        installationBanquet,
        termsConditions,
        marketingEmails,
        privacyPolicy,
        totalAmount,
        paymentSlip
      } = requestData;

      // Validate required fields (email is required, Lions Club fields are optional)
      if (!firstName || !lastName || !email || !phone || !residenceCountry || !passportNric || !registrationType) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'All required fields must be provided'
          })
        };
      }

      // Check for duplicate email
      const { data: existingRegistration, error: checkError } = await supabase
        .from('registrations')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingRegistration) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Email already registered. Please use a different email address.'
          })
        };
      }

      // Generate registration ID
      const registrationId = `APLLS-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Process payment slip if provided (using Supabase Storage)
      let paymentSlipUrl = null;
      let uploadError = null;
      if (paymentSlip) {
        try {
          const base64Data = paymentSlip.fileData.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          
          const fileExtension = paymentSlip.fileName.split('.').pop().toLowerCase();
          const fileName = `payment-slip-${registrationId}.${fileExtension}`;
          
          const { data, error } = await supabase.storage
            .from('payment-slips')
            .upload(fileName, buffer, {
              contentType: paymentSlip.fileType,
              upsert: true
            });
          
          if (error) {
            uploadError = error.message;
            console.error('Payment slip upload failed:', error);
          } else {
            const { data: publicUrlData } = supabase.storage
              .from('payment-slips')
              .getPublicUrl(fileName);
            
            paymentSlipUrl = publicUrlData.publicUrl;
          }
        } catch (error) {
          uploadError = error.message;
          console.error('Payment slip upload failed:', error);
        }
      }

      // Helper function to convert string to boolean
      const toBool = (value) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          return value.toLowerCase() === 'yes' || value.toLowerCase() === 'true';
        }
        return false;
      };

      // Create registration object
      const registration = {
        registration_id: registrationId,
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        phone,
        residence_country: residenceCountry,
        passport_nric: passportNric,
        gender: gender || null,
        address: address || null,
        club_name: clubName,
        district: district === 'other' ? otherDistrict : district,
        other_district: district === 'other' ? otherDistrict : null,
        ppoas_position: ppoasPosition || null,
        district_cabinet_position: districtCabinetPosition || null,
        club_position: clubPosition || null,
        position: clubPosition || ppoasPosition || districtCabinetPosition || 'Member',
        position_in_ngo: positionInNgo || null,
        other_ngos: otherNgos || null,
        registration_type: registrationType,
        vegetarian: toBool(vegetarian),
        poolside_party: toBool(poolsideParty),
        community_service: toBool(communityService),
        installation_banquet: toBool(installationBanquet),
        terms_conditions: toBool(termsConditions),
        marketing_emails: toBool(marketingEmails),
        privacy_policy: toBool(privacyPolicy),
        total_amount: parseFloat(totalAmount) || 0,
        payment_slip_url: paymentSlipUrl,
        status: 'pending'
      };

      // Save to Supabase database
      const { data: savedRegistration, error: saveError } = await supabase
        .from('registrations')
        .insert([registration])
        .select()
        .single();
      
      if (saveError) {
        console.error('Database save error:', saveError);
        
        // If upload succeeded but database failed, try to clean up Supabase Storage
        if (paymentSlipUrl) {
          try {
            const fileName = `payment-slip-${registrationId}.${paymentSlip.fileName.split('.').pop().toLowerCase()}`;
            await supabase.storage
              .from('payment-slips')
              .remove([fileName]);
            console.log('Cleaned up uploaded file after database error');
          } catch (cleanupError) {
            console.error('Failed to cleanup uploaded file:', cleanupError);
          }
        }
        
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Registration failed due to database error. Please try again.',
            error: 'DATABASE_ERROR',
            details: process.env.NODE_ENV === 'development' ? saveError.message : undefined
          })
        };
      }

      // Prepare response message
      let responseMessage = 'Registration submitted successfully!';
      const warnings = [];
      
      if (uploadError) {
        warnings.push(`Payment slip upload failed: ${uploadError}`);
        responseMessage += ' Note: Payment slip could not be uploaded - please contact support.';
      }

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: responseMessage,
          registration_id: registrationId,
          warnings: warnings.length > 0 ? warnings : undefined,
          data: {
            id: savedRegistration.id,
            registration_id: registrationId,
            name: `${firstName} ${lastName}`,
            email: email.toLowerCase(),
            club_name: clubName,
            registration_type: registrationType,
            total_amount: parseFloat(totalAmount) || 0,
            status: 'pending',
            payment_slip_uploaded: !!paymentSlipUrl
          }
        })
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        statusCode: 500,
        headers,
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
    headers,
    body: JSON.stringify({
      success: false,
      message: 'Method not allowed. Use GET or POST.'
    })
  };
}