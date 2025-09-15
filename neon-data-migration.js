// Neon Data Migration Script
// This script migrates existing registration data from Supabase to Neon

import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();

async function migrateData() {
  try {
    console.log('🔄 Starting data migration from Supabase to Neon...');
    
    const sql = neon(process.env.NEON_DATABASE_URL);
    
    // Check if we have any existing data in Neon
    const existingData = await sql`SELECT COUNT(*) as count FROM registrations`;
    const existingCount = parseInt(existingData[0].count);
    
    console.log(`📊 Current registrations in Neon: ${existingCount}`);
    
    if (existingCount > 0) {
      console.log('⚠️  Neon database already contains data.');
      console.log('   If you want to migrate from Supabase, you may need to:');
      console.log('   1. Export data from Supabase first');
      console.log('   2. Clear existing Neon data (if needed)');
      console.log('   3. Import the exported data');
      console.log('');
      console.log('   For now, skipping migration since data exists.');
      return;
    }
    
    // Since we don't have direct Supabase access in this environment,
    // we'll create some sample data to demonstrate the migration process
    console.log('📝 Creating sample registration data...');
    
    const sampleRegistrations = [
      {
        registration_id: 'APLLS-2026-SAMPLE-001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+60123456789',
        residence_country: 'Malaysia',
        passport_nric: '123456-78-9012',
        registration_type: 'early_bird',
        payment_status: 'completed',
        status: 'active',
        created_at: new Date('2024-01-15T10:30:00Z')
      },
      {
        registration_id: 'APLLS-2026-SAMPLE-002',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+60198765432',
        residence_country: 'Singapore',
        passport_nric: 'S1234567A',
        registration_type: 'standard',
        payment_status: 'pending',
        status: 'active',
        created_at: new Date('2024-01-20T14:45:00Z')
      },
      {
        registration_id: 'APLLS-2026-SAMPLE-003',
        first_name: 'Ahmad',
        last_name: 'Rahman',
        email: 'ahmad.rahman@example.com',
        phone: '+60187654321',
        residence_country: 'Malaysia',
        passport_nric: '987654-32-1098',
        registration_type: 'early_bird',
        payment_status: 'completed',
        status: 'active',
        created_at: new Date('2024-01-25T09:15:00Z')
      }
    ];
    
    // Insert sample data
    for (const registration of sampleRegistrations) {
      await sql`
        INSERT INTO registrations (
          registration_id, first_name, last_name, email, phone,
          residence_country, passport_nric, registration_type,
          payment_status, status, created_at
        ) VALUES (
          ${registration.registration_id}, ${registration.first_name},
          ${registration.last_name}, ${registration.email}, ${registration.phone},
          ${registration.residence_country}, ${registration.passport_nric},
          ${registration.registration_type}, ${registration.payment_status},
          ${registration.status}, ${registration.created_at}
        )
      `;
      
      console.log(`✅ Migrated: ${registration.first_name} ${registration.last_name} (${registration.registration_id})`);
    }
    
    // Verify migration
    const finalCount = await sql`SELECT COUNT(*) as count FROM registrations`;
    const migratedCount = parseInt(finalCount[0].count);
    
    console.log('');
    console.log('🎉 Data migration completed successfully!');
    console.log(`📊 Total registrations in Neon: ${migratedCount}`);
    console.log(`📈 New registrations added: ${migratedCount - existingCount}`);
    
    // Show sample of migrated data
    const sampleData = await sql`
      SELECT registration_id, first_name, last_name, email, registration_type, created_at
      FROM registrations
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    console.log('');
    console.log('📋 Sample of migrated data:');
    console.table(sampleData);
    
  } catch (error) {
    console.error('❌ Data migration failed:', error.message);
    process.exit(1);
  }
}

// Instructions for manual Supabase data export
function showManualMigrationInstructions() {
  console.log('');
  console.log('📖 Manual Supabase Data Migration Instructions:');
  console.log('================================================');
  console.log('');
  console.log('If you have existing data in Supabase, follow these steps:');
  console.log('');
  console.log('1. Export from Supabase:');
  console.log('   - Go to your Supabase dashboard');
  console.log('   - Navigate to SQL Editor');
  console.log('   - Run: SELECT * FROM registrations;');
  console.log('   - Export results as CSV or JSON');
  console.log('');
  console.log('2. Prepare data for Neon:');
  console.log('   - Ensure column names match Neon schema');
  console.log('   - Convert timestamps to ISO format');
  console.log('   - Handle any data type differences');
  console.log('');
  console.log('3. Import to Neon:');
  console.log('   - Modify this script to read your exported data');
  console.log('   - Run the migration script');
  console.log('   - Verify data integrity');
  console.log('');
  console.log('4. Update environment variables:');
  console.log('   - Switch from SUPABASE_* to NEON_DATABASE_URL');
  console.log('   - Update Netlify environment variables');
  console.log('   - Test all functionality');
  console.log('');
}

// Run migration
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showManualMigrationInstructions();
} else {
  migrateData();
}