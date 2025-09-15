// Complete Neon Migration Script
// Final steps to complete the migration from Supabase to Neon

import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function completeMigration() {
  try {
    console.log('🎯 Completing Neon migration...');
    console.log('');
    
    const sql = neon(process.env.NEON_DATABASE_URL);
    
    // 1. Verify database connection and data
    console.log('1️⃣ Verifying database connection and data...');
    const connectionTest = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log(`   ✅ Connected to PostgreSQL: ${connectionTest[0].pg_version.split(' ')[0]} ${connectionTest[0].pg_version.split(' ')[1]}`);
    console.log(`   ⏰ Server time: ${connectionTest[0].current_time}`);
    
    // 2. Check registration data
    const registrationCount = await sql`SELECT COUNT(*) as count FROM registrations`;
    const totalRegistrations = parseInt(registrationCount[0].count);
    console.log(`   📊 Total registrations: ${totalRegistrations}`);
    
    if (totalRegistrations === 0) {
      console.log('   ⚠️  No registration data found. You may need to run the data migration first.');
    }
    
    // 3. Test registration statistics
    console.log('');
    console.log('2️⃣ Testing registration statistics...');
    const stats = await sql`
      SELECT 
        registration_type,
        payment_status,
        COUNT(*) as count
      FROM registrations 
      GROUP BY registration_type, payment_status
      ORDER BY registration_type, payment_status
    `;
    
    if (stats.length > 0) {
      console.log('   📈 Registration statistics:');
      console.table(stats);
    } else {
      console.log('   📈 No registration statistics available yet.');
    }
    
    // 4. Verify table structure
    console.log('');
    console.log('3️⃣ Verifying table structure...');
    const tableInfo = await sql`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'registrations' 
      ORDER BY ordinal_position
    `;
    
    console.log('   🏗️  Table structure verified:');
    console.log(`   📋 Columns: ${tableInfo.length}`);
    
    // 5. Test a sample registration query (similar to what the API would do)
    console.log('');
    console.log('4️⃣ Testing API-like queries...');
    
    // Test email uniqueness check
    const emailCheck = await sql`
      SELECT registration_id, email 
      FROM registrations 
      WHERE email = 'john.doe@example.com'
    `;
    
    if (emailCheck.length > 0) {
      console.log(`   ✅ Email lookup test passed: Found ${emailCheck.length} record(s)`);
    }
    
    // Test registration ID generation pattern
    const latestRegistration = await sql`
      SELECT registration_id, created_at 
      FROM registrations 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    if (latestRegistration.length > 0) {
      console.log(`   ✅ Latest registration: ${latestRegistration[0].registration_id}`);
    }
    
    console.log('');
    console.log('🎉 Migration verification completed successfully!');
    console.log('');
    
    // 6. Show next steps
    showNextSteps();
    
    // 7. Offer to clean up temporary files
    console.log('');
    console.log('🧹 Cleanup Options:');
    console.log('==================');
    console.log('');
    console.log('The following temporary files were created during migration:');
    console.log('- test-neon-connection.js');
    console.log('- neon-migration-schema.js');
    console.log('- neon-data-migration.js');
    console.log('- complete-neon-migration.js (this file)');
    console.log('');
    console.log('You can safely delete these files after migration is complete.');
    console.log('To clean up automatically, run: node complete-neon-migration.js --cleanup');
    
  } catch (error) {
    console.error('❌ Migration verification failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('- Check your NEON_DATABASE_URL in .env file');
    console.log('- Ensure Neon database is accessible');
    console.log('- Verify table schema was created correctly');
    process.exit(1);
  }
}

function showNextSteps() {
  console.log('📋 Next Steps:');
  console.log('==============');
  console.log('');
  console.log('1. 🌐 Update Netlify Environment Variables:');
  console.log('   - Go to your Netlify dashboard');
  console.log('   - Navigate to Site Settings > Environment Variables');
  console.log('   - Add: NEON_DATABASE_URL = your_neon_connection_string');
  console.log('   - Remove old Supabase variables (if no longer needed)');
  console.log('');
  console.log('2. 🚀 Deploy to Netlify:');
  console.log('   - Commit your changes to Git');
  console.log('   - Push to your repository');
  console.log('   - Netlify will automatically deploy');
  console.log('');
  console.log('3. 🧪 Test the Live Site:');
  console.log('   - Test registration form submission');
  console.log('   - Verify admin dashboard functionality');
  console.log('   - Check registration statistics');
  console.log('');
  console.log('4. 📊 Monitor Performance:');
  console.log('   - Check Neon dashboard for query performance');
  console.log('   - Monitor Netlify function logs');
  console.log('   - Verify all API endpoints are working');
  console.log('');
  console.log('5. 🗑️  Clean Up (Optional):');
  console.log('   - Remove old Supabase configuration files');
  console.log('   - Delete migration scripts (after successful deployment)');
  console.log('   - Update documentation with new database info');
}

async function cleanupFiles() {
  console.log('🧹 Cleaning up migration files...');
  
  const filesToClean = [
    'test-neon-connection.js',
    'neon-migration-schema.js',
    'neon-data-migration.js',
    'complete-neon-migration.js'
  ];
  
  for (const file of filesToClean) {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`   ✅ Deleted: ${file}`);
      } else {
        console.log(`   ⏭️  Skipped: ${file} (not found)`);
      }
    } catch (error) {
      console.log(`   ❌ Failed to delete: ${file} - ${error.message}`);
    }
  }
  
  console.log('');
  console.log('🎉 Cleanup completed!');
}

// Handle command line arguments
if (process.argv.includes('--cleanup')) {
  cleanupFiles();
} else if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Complete Neon Migration Script');
  console.log('==============================');
  console.log('');
  console.log('Usage:');
  console.log('  node complete-neon-migration.js          # Run migration verification');
  console.log('  node complete-neon-migration.js --cleanup # Clean up migration files');
  console.log('  node complete-neon-migration.js --help    # Show this help');
  console.log('');
} else {
  completeMigration();
}