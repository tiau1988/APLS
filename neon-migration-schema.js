// Neon Database Schema Migration
// This script creates the complete registrations table structure based on Supabase migrations

import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();

async function createSchema() {
  try {
    console.log('🚀 Starting Neon database schema migration...');
    
    const sql = neon(process.env.NEON_DATABASE_URL);
    
    // Create the registrations table with complete structure
    console.log('📋 Creating registrations table...');
    await sql`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL,
        registration_id TEXT PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        
        -- Personal Information
        first_name TEXT NOT NULL,
        last_name TEXT,
        email TEXT,
        phone TEXT,
        
        -- Address Information
        residence_country TEXT,
        passport_nric TEXT,
        
        -- Registration Details
        registration_type TEXT,
        payment_status TEXT DEFAULT 'pending',
        payment_slip_url TEXT,
        
        -- Additional fields that might exist
        notes TEXT,
        status TEXT DEFAULT 'active'
      )
    `;
    
    // Add table and column comments
    console.log('📝 Adding table documentation...');
    await sql`COMMENT ON TABLE registrations IS 'Registration table with registration_id as primary key and email allowing duplicates'`;
    await sql`COMMENT ON COLUMN registrations.email IS 'Email address - duplicates allowed for multiple registrations'`;
    await sql`COMMENT ON COLUMN registrations.registration_id IS 'Primary key - unique registration identifier'`;
    await sql`COMMENT ON COLUMN registrations.residence_country IS 'Country/region of residence for the registrant'`;
    await sql`COMMENT ON COLUMN registrations.passport_nric IS 'Passport number or NRIC number of the registrant'`;
    await sql`COMMENT ON COLUMN registrations.payment_slip_url IS 'URL or path to the uploaded payment slip file'`;
    
    // Create indexes for better performance
    console.log('🔍 Creating database indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status)`;
    
    // Create updated_at trigger function
    console.log('⚡ Setting up automatic timestamp updates...');
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;
    
    // Create trigger for updated_at
    await sql`
      DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations
    `;
    await sql`
      CREATE TRIGGER update_registrations_updated_at
          BEFORE UPDATE ON registrations
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column()
    `;
    
    console.log('✅ Schema migration completed successfully!');
    console.log('\n📊 Table structure created:');
    
    // Show table structure
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'registrations' 
      ORDER BY ordinal_position
    `;
    
    console.table(tableInfo);
    
  } catch (error) {
    console.error('❌ Schema migration failed:', error.message);
    process.exit(1);
  }
}

createSchema();