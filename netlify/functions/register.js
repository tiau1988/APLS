// Registration API for Netlify Functions
// Uses Neon database for permanent storage and Cloudinary for file uploads

import { Client } from 'pg';
import { uploadToCloudinary } from './config/cloudinary.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Neon database client
const getDatabaseClient = () => {
  return new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
};

// Helper functions using Neon PostgreSQL
async function getAllRegistrations() {
  const client = getDatabaseClient();
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM registrations ORDER BY created_at DESC');
    return result.rows;
  } finally {
    await client.end();
  }
}

async function addRegistration(registration) {
  const client = getDatabaseClient();
  try {
    await client.connect();
    
    // Test connection first
    await client.query('SELECT 1');
    
    const columns = Object.keys(registration).join(', ');
    const values = Object.values(registration);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `INSERT INTO registrations (${columns}) VALUES (${placeholders}) RETURNING *`;
    const result = await client.query(query, values);
    
    if (!result.rows || result.rows.length === 0) {
      throw new Error('Registration was not saved - no data returned from database');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Database error in addRegistration:', error);
    
    // Provide more specific error messages
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('Registration ID or email already exists');
    } else if (error.code === '23502') { // Not null violation
      throw new Error('Required field is missing');
    } else if (error.code === '42P01') { // Table does not exist
      throw new Error('Database table not found - please contact support');
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error('Database connection failed');
    } else {
      throw new Error(`Database error: ${error.message}`);
    }
  } finally {
    try {
      await client.end();
    } catch (closeError) {
      console.error('Error closing database connection:', closeError);
    }
  }
}

async function findRegistrationByEmail(email) {
  const client = getDatabaseClient();
  try {
    await client.connect();
    
    // Test connection first
    await client.query('SELECT 1');
    
    const result = await client.query('SELECT * FROM registrations WHERE email = $1', [email.toLowerCase()]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Database error in findRegistrationByEmail:', error);
    
    if (error.code === '42P01') { // Table does not exist
      throw new Error('Database table not found - please contact support');
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error('Database connection failed');
    } else {
      throw new Error(`Database query error: ${error.message}`);
    }
  } finally {
    try {
      await client.end();
    } catch (closeError) {
      console.error('Error closing database connection:', closeError);
    }
  }
}

// Process payment slip file and return Cloudinary URL
async function processPaymentSlip(paymentSlipData, registrationId) {
  if (!paymentSlipData || !paymentSlipData.fileData) {
    return { success: false, error: 'No payment slip data provided' };
  }
  
  try {
    // Validate file data format
    if (!paymentSlipData.fileData.startsWith('data:')) {
      throw new Error('Invalid file format - must be base64 data URL');
    }
    
    // Validate file size (max 5MB)
    const base64Data = paymentSlipData.fileData.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid base64 data');
    }
    
    const fileSizeInBytes = (base64Data.length * 3) / 4;
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (fileSizeInBytes > maxSizeInBytes) {
      throw new Error('File size exceeds 5MB limit');
    }
    
    // Validate file extension
    const fileName = paymentSlipData.fileName || 'payment-slip';
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'gif'];
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      throw new Error(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`);
    }
    
    // Convert base64 data URL to buffer
    const buffer = Buffer.from(base64Data, 'base64');
    const cloudinaryFileName = `payment-slip-${registrationId}-${Date.now()}`;
    
    // Upload to Cloudinary with retry logic
    let uploadResult;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        uploadResult = await uploadToCloudinary(buffer, cloudinaryFileName, 'aplls-2026/payment-slips');
        break; // Success, exit retry loop
      } catch (uploadError) {
        retryCount++;
        console.warn(`Cloudinary upload attempt ${retryCount} failed:`, uploadError.message);
        
        if (retryCount >= maxRetries) {
          throw new Error(`Upload failed after ${maxRetries} attempts: ${uploadError.message}`);
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }
    
    if (!uploadResult || !uploadResult.secure_url) {
      throw new Error('Cloudinary upload completed but no URL returned');
    }
    
    console.log(`Payment slip uploaded successfully: ${uploadResult.secure_url}`);
    return { success: true, url: uploadResult.secure_url, publicId: uploadResult.public_id };
    
  } catch (error) {
    console.error('Error processing payment slip:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown upload error',
      details: {
        fileName: paymentSlipData.fileName,
        registrationId,
        timestamp: new Date().toISOString()
      }
    };
  }
}

async function getRegistrationStats() {
  const client = getDatabaseClient();
  try {
    await client.connect();
    
    // Get total registrations
    const totalResult = await client.query('SELECT COUNT(*) as count FROM registrations');
    const total = parseInt(totalResult.rows[0].count) || 0;
    
    // Get early bird registrations
    const earlyBirdResult = await client.query('SELECT COUNT(*) as count FROM registrations WHERE registration_type = $1', ['early-bird']);
    const earlyBird = parseInt(earlyBirdResult.rows[0].count) || 0;
    
    // Get registrations in last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const last24HoursResult = await client.query('SELECT COUNT(*) as count FROM registrations WHERE created_at > $1', [yesterday]);
    const last24Hours = parseInt(last24HoursResult.rows[0].count) || 0;
    
    return {
      total,
      earlyBird,
      last24Hours
    };
  } finally {
    await client.end();
  }
}

export const handler = async (event, context) => {
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
            provider: 'Neon',
            client: 'pg',
            connection_method: 'PostgreSQL',
            status: 'Production Ready - Permanent Storage'
          },
          file_storage: {
            provider: 'Cloudinary',
            status: 'Cloud Storage - Free Tier'
          },
          environment: {
            node_version: process.version,
            storage_method: 'neon_postgresql',
            note: 'Using Neon PostgreSQL for data storage and Cloudinary for file uploads'
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
      } = req.body;

      // Validate required fields (email is required, Lions Club fields are optional)
      if (!firstName || !lastName || !email || !phone || !residenceCountry || !passportNric || !registrationType) {
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
      let uploadError = null;
      if (paymentSlip) {
        const uploadResult = await processPaymentSlip(paymentSlip, registrationId);
        if (uploadResult.success) {
          paymentSlipUrl = uploadResult.url;
        } else {
          uploadError = uploadResult.error;
          console.error('Payment slip upload failed:', uploadResult);
          // Continue with registration but note the upload failure
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

      // Save to Neon database with enhanced error handling
      let savedRegistration;
      try {
        savedRegistration = await addRegistration(registration);
      } catch (dbError) {
        console.error('Database save error:', dbError);
        
        // If upload succeeded but database failed, try to clean up Cloudinary
        if (paymentSlipUrl && uploadResult?.publicId) {
          try {
            await deleteFromCloudinary(uploadResult.publicId);
            console.log('Cleaned up uploaded file after database error');
          } catch (cleanupError) {
            console.error('Failed to cleanup uploaded file:', cleanupError);
          }
        }
        
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            message: 'Registration failed due to database error. Please try again.',
            error: 'DATABASE_ERROR',
            details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
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
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
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