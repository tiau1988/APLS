// Neon Migration Implementation Guide
// This file contains practical code examples for migrating from Supabase to Neon

// ============================================================================
// 1. NEON DATABASE CONNECTION SETUP
// ============================================================================

// Option A: Using @neondatabase/serverless (Recommended for serverless)
const { neon } = require('@neondatabase/serverless');

// Initialize Neon client
const sql = neon(process.env.NEON_DATABASE_URL);

// Option B: Using standard pg client
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// ============================================================================
// 2. MIGRATION EXAMPLES - BEFORE & AFTER
// ============================================================================

// BEFORE: Supabase getAllRegistrations
async function getAllRegistrations_Supabase() {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// AFTER: Neon getAllRegistrations
async function getAllRegistrations_Neon() {
  try {
    const result = await sql`
      SELECT * FROM registrations 
      ORDER BY created_at DESC
    `;
    return result;
  } catch (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
}

// BEFORE: Supabase addRegistration
async function addRegistration_Supabase(registration) {
  const { data, error } = await supabase
    .from('registrations')
    .insert([registration])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// AFTER: Neon addRegistration
async function addRegistration_Neon(registration) {
  try {
    const result = await sql`
      INSERT INTO registrations (
        registration_id, first_name, last_name, email, phone,
        residence_country, passport_nric, gender, address, club_name,
        district, other_district, ppoas_position, district_cabinet_position,
        club_position, position, position_in_ngo, other_ngos,
        registration_type, vegetarian, poolside_party, community_service,
        installation_banquet, terms_conditions, marketing_emails,
        privacy_policy, total_amount, payment_slip_url, status
      ) VALUES (
        ${registration.registration_id}, ${registration.first_name},
        ${registration.last_name}, ${registration.email}, ${registration.phone},
        ${registration.residence_country}, ${registration.passport_nric},
        ${registration.gender}, ${registration.address}, ${registration.club_name},
        ${registration.district}, ${registration.other_district},
        ${registration.ppoas_position}, ${registration.district_cabinet_position},
        ${registration.club_position}, ${registration.position},
        ${registration.position_in_ngo}, ${registration.other_ngos},
        ${registration.registration_type}, ${registration.vegetarian},
        ${registration.poolside_party}, ${registration.community_service},
        ${registration.installation_banquet}, ${registration.terms_conditions},
        ${registration.marketing_emails}, ${registration.privacy_policy},
        ${registration.total_amount}, ${registration.payment_slip_url},
        ${registration.status}
      )
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    throw new Error(`Failed to insert registration: ${error.message}`);
  }
}

// BEFORE: Supabase findRegistrationByEmail
async function findRegistrationByEmail_Supabase(email) {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// AFTER: Neon findRegistrationByEmail
async function findRegistrationByEmail_Neon(email) {
  try {
    const result = await sql`
      SELECT * FROM registrations 
      WHERE email = ${email.toLowerCase()}
      LIMIT 1
    `;
    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to find registration: ${error.message}`);
  }
}

// BEFORE: Supabase getRegistrationStats
async function getRegistrationStats_Supabase() {
  const { data: allRegistrations, error: allError } = await supabase
    .from('registrations')
    .select('registration_type, created_at');
  
  if (allError) throw allError;
  
  const total = allRegistrations?.length || 0;
  const earlyBird = allRegistrations?.filter(r => r.registration_type === 'early-bird').length || 0;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const last24Hours = allRegistrations?.filter(r => new Date(r.created_at) > yesterday).length || 0;
  
  return { total, earlyBird, last24Hours };
}

// AFTER: Neon getRegistrationStats (More efficient with SQL)
async function getRegistrationStats_Neon() {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE registration_type = 'early-bird') as early_bird,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24_hours
      FROM registrations
    `;
    
    return {
      total: parseInt(result[0].total),
      earlyBird: parseInt(result[0].early_bird),
      last24Hours: parseInt(result[0].last_24_hours)
    };
  } catch (error) {
    throw new Error(`Failed to get statistics: ${error.message}`);
  }
}

// ============================================================================
// 3. FILE STORAGE MIGRATION - CLOUDINARY EXAMPLE
// ============================================================================

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// BEFORE: Supabase Storage upload
async function processPaymentSlip_Supabase(paymentSlipData, registrationId) {
  const base64Data = paymentSlipData.fileData.split(',')[1];
  const buffer = Buffer.from(base64Data, 'base64');
  
  const fileExtension = paymentSlipData.fileName.split('.').pop().toLowerCase();
  const fileName = `payment-slip-${registrationId}.${fileExtension}`;
  
  const { data, error } = await supabase.storage
    .from('payment-slips')
    .upload(fileName, buffer, {
      contentType: paymentSlipData.fileType,
      upsert: true
    });
  
  if (error) return null;
  
  const { data: publicUrlData } = supabase.storage
    .from('payment-slips')
    .getPublicUrl(fileName);
  
  return publicUrlData.publicUrl;
}

// AFTER: Cloudinary upload
async function processPaymentSlip_Cloudinary(paymentSlipData, registrationId) {
  try {
    const result = await cloudinary.uploader.upload(paymentSlipData.fileData, {
      folder: 'aplls-2026/payment-slips',
      public_id: `payment-slip-${registrationId}`,
      resource_type: 'auto',
      overwrite: true
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
}

// ============================================================================
// 4. COMPLETE NETLIFY FUNCTION EXAMPLE - REGISTER.JS MIGRATION
// ============================================================================

// Updated register.js for Neon
const { neon } = require('@neondatabase/serverless');
const cloudinary = require('cloudinary').v2;

const sql = neon(process.env.NEON_DATABASE_URL);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
      const stats = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE registration_type = 'early-bird') as early_bird,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24_hours
        FROM registrations
      `;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'ready_neon',
          message: 'Registration system ready - using Neon database!',
          total_registrations: parseInt(stats[0].total),
          early_bird_count: parseInt(stats[0].early_bird),
          recent_24h_count: parseInt(stats[0].last_24_hours),
          database_connected: true,
          database_info: {
            provider: 'Neon',
            client: '@neondatabase/serverless',
            connection_method: 'Direct SQL',
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
          error: error.message
        })
      };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const registration = JSON.parse(event.body);
      
      // Validate required fields
      if (!registration.firstName || !registration.email) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Required fields missing'
          })
        };
      }

      // Check for duplicate email
      const existing = await sql`
        SELECT id FROM registrations 
        WHERE email = ${registration.email.toLowerCase()}
        LIMIT 1
      `;
      
      if (existing.length > 0) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Email already registered'
          })
        };
      }

      // Generate registration ID
      const registrationId = `APLLS-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Process payment slip if provided
      let paymentSlipUrl = null;
      if (registration.paymentSlip) {
        paymentSlipUrl = await processPaymentSlip_Cloudinary(registration.paymentSlip, registrationId);
      }

      // Insert registration
      const result = await sql`
        INSERT INTO registrations (
          registration_id, first_name, last_name, email, phone,
          registration_type, total_amount, payment_slip_url, status
        ) VALUES (
          ${registrationId}, ${registration.firstName}, ${registration.lastName},
          ${registration.email.toLowerCase()}, ${registration.phone},
          ${registration.registrationType}, ${registration.totalAmount},
          ${paymentSlipUrl}, 'pending'
        )
        RETURNING *
      `;

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Registration submitted successfully!',
          registration_id: registrationId,
          data: result[0]
        })
      };

    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Registration failed',
          error: error.message
        })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};

// ============================================================================
// 5. ENVIRONMENT VARIABLES SETUP
// ============================================================================

/*
Required Environment Variables for Neon Migration:

# Neon Database
NEON_DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require

# Cloudinary (for file storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Remove these Supabase variables after migration:
# SUPABASE_URL=
# SUPABASE_ANON_KEY=
# SUPABASE_KEY=
*/

// ============================================================================
// 6. PACKAGE.JSON DEPENDENCIES UPDATE
// ============================================================================

/*
Update package.json dependencies:

{
  "dependencies": {
    "@neondatabase/serverless": "^0.6.0",
    "cloudinary": "^1.41.0"
  }
}

Remove:
- @supabase/supabase-js
*/

// ============================================================================
// 7. DATABASE SCHEMA MIGRATION SCRIPT
// ============================================================================

// Run this script to create the registrations table in Neon
const createTableScript = `
CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  registration_id VARCHAR(255) UNIQUE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(255),
  residence_country VARCHAR(255),
  passport_nric VARCHAR(255),
  gender VARCHAR(50),
  address TEXT,
  club_name VARCHAR(255),
  district VARCHAR(255),
  other_district VARCHAR(255),
  ppoas_position VARCHAR(255),
  district_cabinet_position VARCHAR(255),
  club_position VARCHAR(255),
  position VARCHAR(255),
  position_in_ngo VARCHAR(255),
  other_ngos TEXT,
  registration_type VARCHAR(50),
  vegetarian BOOLEAN DEFAULT FALSE,
  poolside_party BOOLEAN DEFAULT FALSE,
  community_service BOOLEAN DEFAULT FALSE,
  installation_banquet BOOLEAN DEFAULT FALSE,
  terms_conditions BOOLEAN DEFAULT FALSE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  privacy_policy BOOLEAN DEFAULT FALSE,
  total_amount DECIMAL(10,2),
  payment_slip_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_type ON registrations(registration_type);
CREATE INDEX IF NOT EXISTS idx_registrations_created ON registrations(created_at);
`;

// Function to run the migration
async function runMigration() {
  try {
    await sql`${createTableScript}`;
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Export for use
module.exports = {
  getAllRegistrations_Neon,
  addRegistration_Neon,
  findRegistrationByEmail_Neon,
  getRegistrationStats_Neon,
  processPaymentSlip_Cloudinary,
  runMigration
};