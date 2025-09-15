#!/usr/bin/env node

/**
 * Data Migration Script: Supabase to Neon
 * 
 * This script helps migrate existing registration data from Supabase to Neon database.
 * 
 * Usage:
 * 1. Set up environment variables for both Supabase and Neon
 * 2. Run: node data-migration-script.js
 * 
 * Prerequisites:
 * - Both databases should be accessible
 * - Neon database should have the registrations table created
 * - Environment variables should be set for both databases
 */

const { createClient } = require('@supabase/supabase-js');
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  // Supabase configuration (source)
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY
  },
  // Neon configuration (destination)
  neon: {
    databaseUrl: process.env.NEON_DATABASE_URL
  },
  // Migration options
  options: {
    batchSize: 100,
    backupData: true,
    validateData: true,
    dryRun: false // Set to true to test without actually inserting data
  }
};

// Initialize clients
let supabase, neonSql;

try {
  if (!config.supabase.url || !config.supabase.key) {
    throw new Error('Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_KEY environment variables.');
  }
  
  if (!config.neon.databaseUrl) {
    throw new Error('Neon configuration missing. Please set NEON_DATABASE_URL environment variable.');
  }

  supabase = createClient(config.supabase.url, config.supabase.key);
  neonSql = neon(config.neon.databaseUrl);
  
  console.log('✅ Database clients initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize database clients:', error.message);
  process.exit(1);
}

/**
 * Fetch all registrations from Supabase
 */
async function fetchSupabaseData() {
  console.log('📥 Fetching data from Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }
    
    console.log(`✅ Fetched ${data.length} registrations from Supabase`);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch data from Supabase:', error.message);
    throw error;
  }
}

/**
 * Create backup of the data
 */
async function createBackup(data) {
  if (!config.options.backupData) {
    return;
  }
  
  console.log('💾 Creating data backup...');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, 'migration-backups');
    const backupFile = path.join(backupDir, `supabase-backup-${timestamp}.json`);
    
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Write backup file
    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
    
    console.log(`✅ Backup created: ${backupFile}`);
  } catch (error) {
    console.error('❌ Failed to create backup:', error.message);
    throw error;
  }
}

/**
 * Validate data before migration
 */
function validateData(data) {
  if (!config.options.validateData) {
    return { valid: true, errors: [] };
  }
  
  console.log('🔍 Validating data...');
  
  const errors = [];
  const requiredFields = ['registration_id', 'first_name', 'email'];
  
  data.forEach((record, index) => {
    // Check required fields
    requiredFields.forEach(field => {
      if (!record[field]) {
        errors.push(`Record ${index + 1}: Missing required field '${field}'`);
      }
    });
    
    // Check email format
    if (record.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) {
      errors.push(`Record ${index + 1}: Invalid email format '${record.email}'`);
    }
    
    // Check registration_id uniqueness
    const duplicates = data.filter(r => r.registration_id === record.registration_id);
    if (duplicates.length > 1) {
      errors.push(`Record ${index + 1}: Duplicate registration_id '${record.registration_id}'`);
    }
  });
  
  if (errors.length > 0) {
    console.log(`⚠️  Found ${errors.length} validation errors`);
    errors.slice(0, 10).forEach(error => console.log(`   - ${error}`));
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more errors`);
    }
  } else {
    console.log('✅ Data validation passed');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Check if Neon database is ready
 */
async function checkNeonDatabase() {
  console.log('🔍 Checking Neon database...');
  
  try {
    // Check if registrations table exists
    const tableCheck = await neonSql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'registrations'
      )
    `;
    
    if (!tableCheck[0].exists) {
      throw new Error('Registrations table does not exist in Neon database. Please run the schema migration first.');
    }
    
    // Check current record count
    const countResult = await neonSql`SELECT COUNT(*) as count FROM registrations`;
    const currentCount = parseInt(countResult[0].count);
    
    console.log(`✅ Neon database ready. Current records: ${currentCount}`);
    
    if (currentCount > 0) {
      console.log('⚠️  Warning: Neon database already contains data. Migration will add to existing records.');
    }
    
    return currentCount;
  } catch (error) {
    console.error('❌ Neon database check failed:', error.message);
    throw error;
  }
}

/**
 * Transform Supabase data for Neon insertion
 */
function transformData(supabaseRecord) {
  // Map Supabase record to Neon format
  // Handle any field name differences or data type conversions
  
  return {
    registration_id: supabaseRecord.registration_id,
    first_name: supabaseRecord.first_name,
    last_name: supabaseRecord.last_name,
    email: supabaseRecord.email,
    phone: supabaseRecord.phone,
    residence_country: supabaseRecord.residence_country,
    passport_nric: supabaseRecord.passport_nric,
    gender: supabaseRecord.gender,
    address: supabaseRecord.address,
    club_name: supabaseRecord.club_name,
    district: supabaseRecord.district,
    other_district: supabaseRecord.other_district,
    ppoas_position: supabaseRecord.ppoas_position,
    district_cabinet_position: supabaseRecord.district_cabinet_position,
    club_position: supabaseRecord.club_position,
    position: supabaseRecord.position,
    position_in_ngo: supabaseRecord.position_in_ngo,
    other_ngos: supabaseRecord.other_ngos,
    registration_type: supabaseRecord.registration_type,
    vegetarian: supabaseRecord.vegetarian || false,
    poolside_party: supabaseRecord.poolside_party || false,
    community_service: supabaseRecord.community_service || false,
    installation_banquet: supabaseRecord.installation_banquet || false,
    terms_conditions: supabaseRecord.terms_conditions || false,
    marketing_emails: supabaseRecord.marketing_emails || false,
    privacy_policy: supabaseRecord.privacy_policy || false,
    total_amount: supabaseRecord.total_amount,
    payment_slip_url: supabaseRecord.payment_slip_url,
    status: supabaseRecord.status || 'pending',
    created_at: supabaseRecord.created_at
  };
}

/**
 * Insert data into Neon database in batches
 */
async function insertToNeon(data) {
  console.log(`📤 Inserting ${data.length} records to Neon database...`);
  
  if (config.options.dryRun) {
    console.log('🧪 DRY RUN MODE: No data will be actually inserted');
    return { success: data.length, failed: 0, errors: [] };
  }
  
  const results = { success: 0, failed: 0, errors: [] };
  const batchSize = config.options.batchSize;
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    console.log(`   Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(data.length / batchSize)} (${batch.length} records)`);
    
    for (const record of batch) {
      try {
        const transformedRecord = transformData(record);
        
        await neonSql`
          INSERT INTO registrations (
            registration_id, first_name, last_name, email, phone,
            residence_country, passport_nric, gender, address, club_name,
            district, other_district, ppoas_position, district_cabinet_position,
            club_position, position, position_in_ngo, other_ngos,
            registration_type, vegetarian, poolside_party, community_service,
            installation_banquet, terms_conditions, marketing_emails,
            privacy_policy, total_amount, payment_slip_url, status, created_at
          ) VALUES (
            ${transformedRecord.registration_id}, ${transformedRecord.first_name},
            ${transformedRecord.last_name}, ${transformedRecord.email}, ${transformedRecord.phone},
            ${transformedRecord.residence_country}, ${transformedRecord.passport_nric},
            ${transformedRecord.gender}, ${transformedRecord.address}, ${transformedRecord.club_name},
            ${transformedRecord.district}, ${transformedRecord.other_district},
            ${transformedRecord.ppoas_position}, ${transformedRecord.district_cabinet_position},
            ${transformedRecord.club_position}, ${transformedRecord.position},
            ${transformedRecord.position_in_ngo}, ${transformedRecord.other_ngos},
            ${transformedRecord.registration_type}, ${transformedRecord.vegetarian},
            ${transformedRecord.poolside_party}, ${transformedRecord.community_service},
            ${transformedRecord.installation_banquet}, ${transformedRecord.terms_conditions},
            ${transformedRecord.marketing_emails}, ${transformedRecord.privacy_policy},
            ${transformedRecord.total_amount}, ${transformedRecord.payment_slip_url},
            ${transformedRecord.status}, ${transformedRecord.created_at}
          )
        `;
        
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          record: record.registration_id || `Record ${i + results.success + results.failed}`,
          error: error.message
        });
        
        console.error(`   ❌ Failed to insert ${record.registration_id}: ${error.message}`);
      }
    }
  }
  
  return results;
}

/**
 * Verify migration results
 */
async function verifyMigration(originalCount) {
  console.log('🔍 Verifying migration results...');
  
  try {
    const countResult = await neonSql`SELECT COUNT(*) as count FROM registrations`;
    const finalCount = parseInt(countResult[0].count);
    
    console.log(`✅ Migration verification:`);
    console.log(`   - Original Supabase records: ${originalCount}`);
    console.log(`   - Final Neon records: ${finalCount}`);
    
    return finalCount;
  } catch (error) {
    console.error('❌ Migration verification failed:', error.message);
    throw error;
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('🚀 Starting Supabase to Neon migration...');
  console.log('=' .repeat(50));
  
  try {
    // Step 1: Check Neon database
    const initialNeonCount = await checkNeonDatabase();
    
    // Step 2: Fetch data from Supabase
    const supabaseData = await fetchSupabaseData();
    
    if (supabaseData.length === 0) {
      console.log('ℹ️  No data found in Supabase. Migration complete.');
      return;
    }
    
    // Step 3: Create backup
    await createBackup(supabaseData);
    
    // Step 4: Validate data
    const validation = validateData(supabaseData);
    if (!validation.valid) {
      console.log('❌ Data validation failed. Please fix the errors before proceeding.');
      return;
    }
    
    // Step 5: Insert data to Neon
    const insertResults = await insertToNeon(supabaseData);
    
    // Step 6: Verify migration
    const finalCount = await verifyMigration(supabaseData.length);
    
    // Step 7: Summary
    console.log('=' .repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${insertResults.success} records`);
    console.log(`   ❌ Failed to migrate: ${insertResults.failed} records`);
    console.log(`   📈 Total records in Neon: ${finalCount}`);
    
    if (insertResults.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      insertResults.errors.slice(0, 5).forEach(error => {
        console.log(`   - ${error.record}: ${error.error}`);
      });
      if (insertResults.errors.length > 5) {
        console.log(`   ... and ${insertResults.errors.length - 5} more errors`);
      }
    }
    
    if (insertResults.success === supabaseData.length) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed with some errors. Please review the failed records.');
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  }
}

/**
 * Command line interface
 */
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--dry-run')) {
    config.options.dryRun = true;
    console.log('🧪 Running in DRY RUN mode');
  }
  
  if (args.includes('--no-backup')) {
    config.options.backupData = false;
    console.log('⚠️  Backup disabled');
  }
  
  if (args.includes('--no-validation')) {
    config.options.validateData = false;
    console.log('⚠️  Data validation disabled');
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Supabase to Neon Migration Script

Usage: node data-migration-script.js [options]

Options:
  --dry-run        Test migration without inserting data
  --no-backup      Skip creating data backup
  --no-validation  Skip data validation
  --help, -h       Show this help message

Environment Variables Required:
  SUPABASE_URL           Supabase project URL
  SUPABASE_KEY           Supabase service role key
  NEON_DATABASE_URL      Neon database connection string

Example:
  node data-migration-script.js --dry-run
`);
    process.exit(0);
  }
  
  // Run migration
  runMigration().catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = {
  runMigration,
  fetchSupabaseData,
  insertToNeon,
  validateData,
  transformData
};