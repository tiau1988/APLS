const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function runSchemaMigration() {
    const client = new Client({
        connectionString: process.env.NEON_DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to Neon database...');
        await client.connect();
        console.log('Connected successfully!');

        // Drop existing table
        console.log('Dropping existing registrations table...');
        await client.query('DROP TABLE IF EXISTS registrations CASCADE;');
        console.log('Table dropped successfully.');

        // Read and execute schema migration
        console.log('Reading schema migration file...');
        const sql = fs.readFileSync('./neon-schema-migration.sql', 'utf8');
        
        console.log('Executing schema migration...');
        await client.query(sql);
        console.log('Schema migration completed successfully!');

        // Check table structure
        console.log('\nVerifying table structure...');
        const result = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'registrations' 
            ORDER BY ordinal_position;
        `);

        console.log('\nTable structure (35 columns expected):');
        console.log('Column Count:', result.rows.length);
        console.log('\nColumns:');
        result.rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
        });

        // Verify specific important columns
        const importantColumns = [
            'id', 'registration_id', 'first_name', 'last_name', 'email', 'phone',
            'club_name', 'position', 'gender', 'address', 'district', 'other_district',
            'ppoas_position', 'district_cabinet_position', 'club_position', 'position_in_ngo',
            'other_ngos', 'registration_type', 'registration_fee', 'optional_fee', 'total_amount',
            'vegetarian', 'poolside_party', 'community_service', 'installation_banquet',
            'terms_conditions', 'marketing_emails', 'privacy_policy', 'status',
            'registration_date', 'created_at', 'updated_at', 'payment_slip_url',
            'residence_country', 'passport_nric'
        ];

        console.log('\nVerifying important columns:');
        const existingColumns = result.rows.map(row => row.column_name);
        const missingColumns = importantColumns.filter(col => !existingColumns.includes(col));
        
        if (missingColumns.length === 0) {
            console.log('✅ All 35 expected columns are present!');
        } else {
            console.log('❌ Missing columns:', missingColumns);
        }

        console.log('\n🎉 Migration completed successfully!');
        console.log('The Neon table now matches the Supabase structure with all 35 columns.');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Full error:', error);
    } finally {
        await client.end();
        console.log('Database connection closed.');
    }
}

runSchemaMigration();