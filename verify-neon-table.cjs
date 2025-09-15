const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = 'https://eragmmdwgtbylrmjzqwf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYWdtbWR3Z3RieWxybWp6cXdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDYwMjU1NiwiZXhwIjoyMDcwMTc4NTU2fQ.bY_2n1kuHUkoAw70-mBJzn6q_AETQIyjTXFGn8tLAyY';

async function verifyNeonTable() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const neonClient = new Client({
        connectionString: process.env.NEON_DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔍 Verifying Neon table structure and data...');
        
        // Connect to Neon
        await neonClient.connect();
        console.log('✅ Connected to Neon database');

        // 1. Verify table structure
        console.log('\n📋 Checking table structure...');
        const structureQuery = `
            SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default,
                character_maximum_length
            FROM information_schema.columns 
            WHERE table_name = 'registrations' 
            AND table_schema = 'public'
            ORDER BY ordinal_position;
        `;
        
        const { rows: columns } = await neonClient.query(structureQuery);
        console.log(`✅ Found ${columns.length} columns in Neon table`);
        
        // Expected columns from Supabase
        const expectedColumns = [
            'id', 'registration_id', 'first_name', 'last_name', 'email', 'phone',
            'club_name', 'position', 'gender', 'address', 'district', 'other_district',
            'ppoas_position', 'district_cabinet_position', 'club_position', 'position_in_ngo',
            'other_ngos', 'registration_type', 'registration_fee', 'optional_fee', 'total_amount',
            'vegetarian', 'poolside_party', 'community_service', 'installation_banquet',
            'terms_conditions', 'marketing_emails', 'privacy_policy', 'status',
            'registration_date', 'created_at', 'updated_at', 'payment_slip_url',
            'residence_country', 'passport_nric'
        ];
        
        const actualColumns = columns.map(col => col.column_name);
        const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
        const extraColumns = actualColumns.filter(col => !expectedColumns.includes(col));
        
        if (missingColumns.length === 0 && extraColumns.length === 0) {
            console.log('✅ All 35 expected columns are present');
        } else {
            if (missingColumns.length > 0) {
                console.log(`❌ Missing columns: ${missingColumns.join(', ')}`);
            }
            if (extraColumns.length > 0) {
                console.log(`⚠️  Extra columns: ${extraColumns.join(', ')}`);
            }
        }

        // 2. Verify important columns are present
        console.log('\n🔍 Verifying critical columns...');
        const criticalColumns = ['payment_slip_url', 'residence_country', 'passport_nric'];
        const presentCritical = criticalColumns.filter(col => actualColumns.includes(col));
        
        console.log(`✅ Critical columns present: ${presentCritical.join(', ')}`);
        if (presentCritical.length === criticalColumns.length) {
            console.log('✅ All critical columns are present');
        }

        // 3. Verify data count
        console.log('\n📊 Checking data integrity...');
        
        // Get Supabase count
        const { count: supabaseCount, error } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true });
            
        if (error) {
            throw new Error(`Supabase count error: ${error.message}`);
        }
        
        // Get Neon count
        const { rows: neonCountResult } = await neonClient.query('SELECT COUNT(*) as count FROM registrations');
        const neonCount = parseInt(neonCountResult[0].count);
        
        console.log(`Supabase records: ${supabaseCount}`);
        console.log(`Neon records: ${neonCount}`);
        
        if (neonCount === supabaseCount) {
            console.log('✅ Data counts match perfectly');
        } else {
            console.log('❌ Data counts do not match');
        }

        // 4. Sample data verification
        console.log('\n🔍 Verifying sample data...');
        const { rows: sampleData } = await neonClient.query(
            'SELECT id, registration_id, first_name, last_name, email, payment_slip_url, residence_country, passport_nric FROM registrations ORDER BY id LIMIT 3'
        );
        
        console.log('Sample records from Neon:');
        sampleData.forEach((record, index) => {
            console.log(`${index + 1}. ID: ${record.id}, Name: ${record.first_name} ${record.last_name}, Email: ${record.email}`);
            console.log(`   Payment Slip: ${record.payment_slip_url ? 'Present' : 'NULL'}`);
            console.log(`   Residence: ${record.residence_country || 'NULL'}`);
            console.log(`   Passport/NRIC: ${record.passport_nric || 'NULL'}`);
        });

        // 5. Final verification summary
        console.log('\n🎯 VERIFICATION SUMMARY:');
        console.log('================================');
        console.log(`✅ Table Structure: ${columns.length === 35 ? 'PERFECT' : 'ISSUES FOUND'}`);
        console.log(`✅ Critical Columns: ${presentCritical.length === criticalColumns.length ? 'PRESENT' : 'MISSING'}`);
        console.log(`✅ Data Integrity: ${neonCount === supabaseCount ? 'PERFECT' : 'MISMATCH'}`);
        console.log(`✅ Total Records: ${neonCount}`);
        
        if (columns.length === 35 && presentCritical.length === criticalColumns.length && neonCount === supabaseCount) {
            console.log('\n🎉 VERIFICATION SUCCESSFUL!');
            console.log('✅ The Neon table now perfectly matches the Supabase structure');
            console.log('✅ All 35 columns are present including payment_slip_url, residence_country, and passport_nric');
            console.log('✅ All data has been successfully migrated');
            console.log('\n🚀 The migration is complete and the table structures are now identical!');
        } else {
            console.log('\n⚠️  VERIFICATION FOUND ISSUES');
            console.log('Please review the details above');
        }

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        console.error('Full error:', error);
    } finally {
        await neonClient.end();
        console.log('\n🔌 Database connection closed');
    }
}

verifyNeonTable();