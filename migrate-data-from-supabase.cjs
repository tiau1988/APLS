const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = 'https://eragmmdwgtbylrmjzqwf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYWdtbWR3Z3RieWxybWp6cXdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDYwMjU1NiwiZXhwIjoyMDcwMTc4NTU2fQ.bY_2n1kuHUkoAw70-mBJzn6q_AETQIyjTXFGn8tLAyY';

async function migrateDataFromSupabase() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const neonClient = new Client({
        connectionString: process.env.NEON_DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🚀 Starting data migration from Supabase to Neon...');
        
        // Connect to Neon
        await neonClient.connect();
        console.log('✅ Connected to Neon database');

        // Fetch all data from Supabase
        console.log('📥 Fetching data from Supabase...');
        const { data: supabaseData, error } = await supabase
            .from('registrations')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            throw new Error(`Supabase fetch error: ${error.message}`);
        }

        console.log(`📊 Found ${supabaseData.length} records in Supabase`);

        if (supabaseData.length === 0) {
            console.log('ℹ️  No data to migrate');
            return;
        }

        // Clear existing data in Neon (if any)
        console.log('🧹 Clearing existing data in Neon...');
        await neonClient.query('DELETE FROM registrations');
        await neonClient.query('ALTER SEQUENCE registrations_id_seq RESTART WITH 1');

        // Prepare insert statement with all 35 columns
        const insertQuery = `
            INSERT INTO registrations (
                id, registration_id, first_name, last_name, email, phone,
                club_name, position, gender, address, district, other_district,
                ppoas_position, district_cabinet_position, club_position, position_in_ngo,
                other_ngos, registration_type, registration_fee, optional_fee, total_amount,
                vegetarian, poolside_party, community_service, installation_banquet,
                terms_conditions, marketing_emails, privacy_policy, status,
                registration_date, created_at, updated_at, payment_slip_url,
                residence_country, passport_nric
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
                $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
                $31, $32, $33, $34, $35
            )
        `;

        // Migrate each record
        console.log('📤 Migrating records to Neon...');
        let successCount = 0;
        let errorCount = 0;

        for (const record of supabaseData) {
            try {
                const values = [
                    record.id,
                    record.registration_id,
                    record.first_name,
                    record.last_name,
                    record.email,
                    record.phone,
                    record.club_name,
                    record.position,
                    record.gender,
                    record.address,
                    record.district,
                    record.other_district,
                    record.ppoas_position,
                    record.district_cabinet_position,
                    record.club_position,
                    record.position_in_ngo,
                    record.other_ngos,
                    record.registration_type,
                    record.registration_fee,
                    record.optional_fee,
                    record.total_amount,
                    record.vegetarian,
                    record.poolside_party,
                    record.community_service,
                    record.installation_banquet,
                    record.terms_conditions,
                    record.marketing_emails,
                    record.privacy_policy,
                    record.status,
                    record.registration_date,
                    record.created_at,
                    record.updated_at,
                    record.payment_slip_url,
                    record.residence_country,
                    record.passport_nric
                ];

                await neonClient.query(insertQuery, values);
                successCount++;
                
                if (successCount % 5 === 0) {
                    console.log(`✅ Migrated ${successCount}/${supabaseData.length} records`);
                }
            } catch (insertError) {
                console.error(`❌ Error migrating record ${record.id}:`, insertError.message);
                errorCount++;
            }
        }

        // Update sequence to continue from the highest ID
        const maxId = Math.max(...supabaseData.map(r => r.id));
        await neonClient.query(`ALTER SEQUENCE registrations_id_seq RESTART WITH ${maxId + 1}`);

        // Verify migration
        const { rows } = await neonClient.query('SELECT COUNT(*) as count FROM registrations');
        const neonCount = parseInt(rows[0].count);

        console.log('\n📊 Migration Summary:');
        console.log(`   Supabase records: ${supabaseData.length}`);
        console.log(`   Successfully migrated: ${successCount}`);
        console.log(`   Errors: ${errorCount}`);
        console.log(`   Neon records: ${neonCount}`);

        if (neonCount === supabaseData.length && errorCount === 0) {
            console.log('\n🎉 Data migration completed successfully!');
            console.log('✅ All records have been migrated from Supabase to Neon');
            console.log('✅ The Neon database now contains all 35 columns with complete data');
        } else {
            console.log('\n⚠️  Migration completed with issues');
            console.log('Please review the errors above');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Full error:', error);
    } finally {
        await neonClient.end();
        console.log('\n🔌 Database connection closed');
    }
}

migrateDataFromSupabase();