/**
 * Netlify Function: Registration Handler (Neon Version)
 * 
 * This is the updated version of register.js that works with Neon database
 * instead of Supabase. It handles user registration with file upload to
 * Cloudinary and data storage in Neon PostgreSQL.
 * 
 * Key Changes from Supabase version:
 * - Uses @neondatabase/serverless instead of @supabase/supabase-js
 * - Uses Cloudinary for file storage instead of Supabase Storage
 * - Uses raw SQL queries instead of Supabase query builder
 * - Updated error handling and response formats
 */

const { neon } = require('@neondatabase/serverless');
const cloudinary = require('cloudinary').v2;
const multipart = require('lambda-multipart-parser');

// Initialize Neon SQL client
const sql = neon(process.env.NEON_DATABASE_URL);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

/**
 * Generate unique registration ID
 */
function generateRegistrationId() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `REG-${timestamp}-${random}`.toUpperCase();
}

/**
 * Upload file to local storage (Netlify static files)
 * This is a fallback solution when Cloudinary is not configured
 */
async function uploadToLocalStorage(fileBuffer, fileName, registrationId) {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'payment-slips');
    
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
    } catch (mkdirError) {
      // Directory might already exist, continue
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(fileName) || '.jpg';
    const uniqueFileName = `payment-slip-${registrationId}-${timestamp}${fileExtension}`;
    const filePath = path.join(uploadsDir, uniqueFileName);
    
    // Save file
    await fs.writeFile(filePath, fileBuffer);
    
    // Return public URL
    return `/uploads/payment-slips/${uniqueFileName}`;
  } catch (error) {
    console.error('Local storage upload error:', error);
    throw new Error('Failed to upload file to local storage');
  }
}

/**
 * Upload file to Cloudinary (if configured) or local storage as fallback
 */
async function uploadFile(fileBuffer, fileName, registrationId) {
  // Check if Cloudinary is properly configured
  const isCloudinaryConfigured = 
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
    process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
    process.env.CLOUDINARY_API_SECRET !== 'your_api_secret';
  
  if (isCloudinaryConfigured) {
    try {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            public_id: `payment-slips/${Date.now()}-${fileName}`,
            folder: 'aplls-2026/payment-slips'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(fileBuffer);
      });
      
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error, falling back to local storage:', error);
      return await uploadToLocalStorage(fileBuffer, fileName, registrationId);
    }
  } else {
    console.log('Cloudinary not configured, using local storage');
    return await uploadToLocalStorage(fileBuffer, fileName, registrationId);
  }
}

/**
 * Check if email already exists
 */
async function findRegistrationByEmail(email) {
  try {
    const result = await sql`
      SELECT registration_id, email, status 
      FROM registrations 
      WHERE email = ${email} 
      LIMIT 1
    `;
    
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Failed to check existing registration');
  }
}

/**
 * Add new registration to database
 */
async function addRegistration(registrationData) {
  try {
    const result = await sql`
      INSERT INTO registrations (
        registration_id, first_name, last_name, email, phone,
        residence_country, passport_nric, gender, address, club_name,
        district, other_district, ppoas_position, district_cabinet_position,
        club_position, position, position_in_ngo, other_ngos,
        registration_type, vegetarian, poolside_party, community_service,
        installation_banquet, terms_conditions, marketing_emails,
        privacy_policy, total_amount, payment_slip_url, status, created_at
      ) VALUES (
        ${registrationData.registration_id}, ${registrationData.first_name},
        ${registrationData.last_name}, ${registrationData.email}, ${registrationData.phone},
        ${registrationData.residence_country}, ${registrationData.passport_nric},
        ${registrationData.gender}, ${registrationData.address}, ${registrationData.club_name},
        ${registrationData.district}, ${registrationData.other_district},
        ${registrationData.ppoas_position}, ${registrationData.district_cabinet_position},
        ${registrationData.club_position}, ${registrationData.position},
        ${registrationData.position_in_ngo}, ${registrationData.other_ngos},
        ${registrationData.registration_type}, ${registrationData.vegetarian},
        ${registrationData.poolside_party}, ${registrationData.community_service},
        ${registrationData.installation_banquet}, ${registrationData.terms_conditions},
        ${registrationData.marketing_emails}, ${registrationData.privacy_policy},
        ${registrationData.total_amount}, ${registrationData.payment_slip_url},
        ${registrationData.status}, ${registrationData.created_at}
      )
      RETURNING registration_id, email, status, created_at
    `;
    
    return result[0];
  } catch (error) {
    console.error('Database insert error:', error);
    throw new Error('Failed to save registration to database');
  }
}

/**
 * Get registration statistics
 */
async function getRegistrationStats() {
  try {
    const totalResult = await sql`
      SELECT COUNT(*) as count 
      FROM registrations 
      WHERE status != 'cancelled'
    `;
    
    const earlyBirdResult = await sql`
      SELECT COUNT(*) as count 
      FROM registrations 
      WHERE registration_type = 'early_bird' 
      AND status != 'cancelled'
    `;
    
    const total = parseInt(totalResult[0].count);
    const earlyBird = parseInt(earlyBirdResult[0].count);
    const earlyBirdRemaining = Math.max(0, 100 - earlyBird); // Assuming 100 early bird slots
    
    return {
      total,
      early_bird: earlyBird,
      early_bird_remaining: earlyBirdRemaining
    };
  } catch (error) {
    console.error('Database stats query error:', error);
    throw new Error('Failed to get registration statistics');
  }
}

/**
 * Main handler function
 */
export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }
  
  // Handle GET request for statistics
  if (event.httpMethod === 'GET') {
    try {
      const stats = await getRegistrationStats();
      
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          data: stats
        })
      };
    } catch (error) {
      console.error('GET request error:', error);
      
      return {
        statusCode: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: 'Failed to get registration statistics'
        })
      };
    }
  }
  
  // Handle POST request for registration
  if (event.httpMethod === 'POST') {
    try {
      let fields = {};
      let files = [];
      
      // Check content type and parse accordingly
      const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
      
      if (contentType.includes('application/json')) {
        // Parse JSON data
        const jsonData = JSON.parse(event.body);
        fields = jsonData;
      } else if (contentType.includes('multipart/form-data')) {
        // Parse multipart form data
        const result = await multipart.parse(event);
        fields = result.fields;
        files = result.files;
      } else {
        // Try to parse as JSON by default
        try {
          const jsonData = JSON.parse(event.body);
          fields = jsonData;
        } catch (parseError) {
          return {
            statusCode: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              success: false,
              error: 'Invalid request format. Expected JSON or multipart form data.'
            })
          };
        }
      }
      
      // Validate required fields
      const requiredFields = ['fullName', 'email', 'registrationType'];
      for (const field of requiredFields) {
        if (!fields[field]) {
          return {
            statusCode: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              success: false,
              message: `Missing required field: ${field}`
            })
          };
        }
      }
      
      // Check for existing registration
      const existingRegistration = await findRegistrationByEmail(fields.email);
      if (existingRegistration) {
        return {
          statusCode: 409,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            error: 'Email already registered',
            registration_id: existingRegistration.registration_id
          })
        };
      }
      
      // Generate registration ID
      const registrationId = generateRegistrationId();
      
      // Handle file upload if present
      let paymentSlipUrl = null;
      
      // Check for file in multipart form data
      if (files && files.length > 0) {
        const paymentSlipFile = files.find(file => file.fieldname === 'paymentSlip');
        if (paymentSlipFile) {
          paymentSlipUrl = await uploadFile(
            paymentSlipFile.content,
            paymentSlipFile.filename,
            registrationId
          );
        }
      }
      // Check for file in JSON data (base64 format)
      else if (fields.paymentSlip && fields.paymentSlip.fileData) {
        try {
          // Convert base64 data URL to buffer
          const base64Data = fields.paymentSlip.fileData.split(',')[1]; // Remove data:image/jpeg;base64, prefix
          const fileBuffer = Buffer.from(base64Data, 'base64');
          
          paymentSlipUrl = await uploadFile(
            fileBuffer,
            fields.paymentSlip.fileName || 'payment-slip',
            registrationId
          );
        } catch (uploadError) {
          console.error('Error uploading payment slip:', uploadError);
          // Continue with registration even if file upload fails
        }
      }
      
      // Prepare registration data
      // Split fullName into first and last name
      const fullName = fields.fullName || '';
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const registrationData = {
        registration_id: registrationId,
        first_name: firstName,
        last_name: lastName,
        email: fields.email,
        phone: fields.phone || '',
        residence_country: fields.residenceCountry || fields.country || '',
        passport_nric: fields.passportNric || '',
        gender: fields.gender || '',
        address: fields.address || '',
        club_name: fields.clubName || '',
        district: fields.district || '',
        other_district: fields.otherDistrict || '',
        ppoas_position: fields.ppoasPosition || '',
        district_cabinet_position: fields.districtCabinetPosition || '',
        club_position: fields.clubPosition || '',
        position: fields.position || '',
        position_in_ngo: fields.positionInNgo || '',
        other_ngos: fields.otherNgos || '',
        registration_type: fields.registrationType,
        vegetarian: fields.vegetarian === 'true' || fields.vegetarian === true,
        poolside_party: fields.poolsideParty === 'true' || fields.poolsideParty === true,
        community_service: fields.communityService === 'true' || fields.communityService === true,
        installation_banquet: fields.installationBanquet === 'true' || fields.installationBanquet === true,
        terms_conditions: fields.termsConditions === 'true' || fields.termsConditions === true,
        marketing_emails: fields.marketingEmails === 'true' || fields.marketingEmails === true,
        privacy_policy: fields.privacyPolicy === 'true' || fields.privacyPolicy === true,
        total_amount: parseFloat(fields.totalAmount) || 0,
        payment_slip_url: paymentSlipUrl,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      // Save registration to database
      const savedRegistration = await addRegistration(registrationData);
      
      // Get updated statistics
      const stats = await getRegistrationStats();
      
      return {
        statusCode: 201,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          message: 'Registration successful',
          data: {
            registration_id: savedRegistration.registration_id,
            email: savedRegistration.email,
            status: savedRegistration.status,
            created_at: savedRegistration.created_at,
            payment_slip_uploaded: !!paymentSlipUrl,
            payment_slip_url: paymentSlipUrl
          },
          stats
        })
      };
      
    } catch (error) {
      console.error('POST request error:', error);
      
      return {
        statusCode: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: 'Registration failed. Please try again.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
      };
    }
  }
  
  // Method not allowed
  return {
    statusCode: 405,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: false,
      error: 'Method not allowed'
    })
  };
};

// Database Information:
// - Database: Neon PostgreSQL
// - Connection: @neondatabase/serverless
// - File Storage: Cloudinary
// - Environment: Production ready
// - Node.js Version: 18.x
// - Neon PostgreSQL Storage: Managed cloud database