-- Neon Database Schema Migration
-- This script creates the registrations table structure for the APLLS 2026 website
-- Run this script in your Neon database console or using a PostgreSQL client

-- Drop table if exists (use with caution in production)
-- DROP TABLE IF EXISTS registrations;

-- Create registrations table with complete Supabase-compatible structure
CREATE TABLE IF NOT EXISTS registrations (
    -- Primary key and identification (matching Supabase exactly)
    id SERIAL PRIMARY KEY,
    registration_id VARCHAR(255) NOT NULL,
    
    -- Personal information
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    
    -- Club and organization information
    club_name VARCHAR(255),
    position VARCHAR(255),
    gender VARCHAR(255),
    address TEXT,
    district VARCHAR(255),
    other_district VARCHAR(255),
    ppoas_position VARCHAR(255),
    district_cabinet_position VARCHAR(255),
    club_position VARCHAR(255),
    position_in_ngo VARCHAR(255),
    other_ngos TEXT,
    
    -- Registration details
    registration_type VARCHAR(255) NOT NULL,
    registration_fee NUMERIC,
    optional_fee NUMERIC,
    total_amount NUMERIC NOT NULL,
    
    -- Event preferences (boolean fields)
    vegetarian BOOLEAN DEFAULT FALSE,
    poolside_party BOOLEAN DEFAULT FALSE,
    community_service BOOLEAN DEFAULT FALSE,
    installation_banquet BOOLEAN DEFAULT FALSE,
    
    -- Agreement fields
    terms_conditions BOOLEAN DEFAULT FALSE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    privacy_policy BOOLEAN DEFAULT FALSE,
    
    -- Status and timestamps
    status VARCHAR(255) DEFAULT 'confirmed',
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional fields from Supabase
    payment_slip_url TEXT,
    residence_country TEXT,
    passport_nric TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_registration_id ON registrations(registration_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_registration_type ON registrations(registration_type);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at);
CREATE INDEX IF NOT EXISTS idx_registrations_district ON registrations(district);
CREATE INDEX IF NOT EXISTS idx_registrations_registration_date ON registrations(registration_date);

-- Create a composite index for common queries
CREATE INDEX IF NOT EXISTS idx_registrations_type_status ON registrations(registration_type, status);

-- Add constraints (more flexible to match Supabase)
ALTER TABLE registrations 
ADD CONSTRAINT chk_total_amount 
CHECK (total_amount >= 0);

ALTER TABLE registrations 
ADD CONSTRAINT chk_registration_fee 
CHECK (registration_fee IS NULL OR registration_fee >= 0);

ALTER TABLE registrations 
ADD CONSTRAINT chk_optional_fee 
CHECK (optional_fee IS NULL OR optional_fee >= 0);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
CREATE TRIGGER update_registrations_updated_at
    BEFORE UPDATE ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments to the table and important columns (matching Supabase structure)
COMMENT ON TABLE registrations IS 'Registration table with id as primary key and email allowing duplicates';
COMMENT ON COLUMN registrations.registration_id IS 'Unique registration identifier (not primary key)';
COMMENT ON COLUMN registrations.email IS 'Email address - duplicates allowed for multiple registrations';
COMMENT ON COLUMN registrations.last_name IS 'Last name field - cleared on user request';
COMMENT ON COLUMN registrations.payment_slip_url IS 'URL or path to the uploaded payment slip file';
COMMENT ON COLUMN registrations.residence_country IS 'Country/region of residence for the registrant';
COMMENT ON COLUMN registrations.passport_nric IS 'Passport number or NRIC number of the registrant';

-- Create a view for public registration data (privacy-filtered)
CREATE OR REPLACE VIEW public_registrations AS
SELECT 
    registration_id,
    first_name,
    CASE 
        WHEN last_name IS NOT NULL AND last_name != '' 
        THEN LEFT(last_name, 1) || '.'
        ELSE ''
    END as last_name_initial,
    club_name,
    district,
    registration_type,
    status,
    created_at::date as registration_date
FROM registrations
WHERE status IN ('confirmed', 'pending')
ORDER BY created_at DESC;

-- Create a view for registration statistics
CREATE OR REPLACE VIEW registration_stats AS
SELECT 
    COUNT(*) FILTER (WHERE status != 'cancelled') as total_registrations,
    COUNT(*) FILTER (WHERE registration_type = 'early_bird' AND status != 'cancelled') as early_bird_count,
    COUNT(*) FILTER (WHERE registration_type = 'regular' AND status != 'cancelled') as regular_count,
    COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE payment_slip_url IS NOT NULL AND payment_slip_url != '') as with_payment_count,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as week_count
FROM registrations;

-- Insert sample data (optional - remove in production)
-- INSERT INTO registrations (
--     registration_id, first_name, last_name, email, phone,
--     club_name, district, registration_type, total_amount, status
-- ) VALUES 
-- ('REG-SAMPLE-001', 'John', 'Doe', 'john.doe@example.com', '+1234567890',
--  'Sample Lions Club', 'District 1', 'early_bird', 150.00, 'confirmed'),
-- ('REG-SAMPLE-002', 'Jane', 'Smith', 'jane.smith@example.com', '+1234567891',
--  'Another Lions Club', 'District 2', 'regular', 200.00, 'pending');

-- Grant permissions (adjust as needed for your Neon setup)
-- GRANT SELECT, INSERT, UPDATE ON registrations TO your_app_user;
-- GRANT USAGE ON SEQUENCE registrations_id_seq TO your_app_user;
-- GRANT SELECT ON public_registrations TO your_app_user;
-- GRANT SELECT ON registration_stats TO your_app_user;

-- Display table information
SELECT 
    'Table created successfully' as status,
    COUNT(*) as initial_record_count
FROM registrations;

-- Display indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'registrations'
ORDER BY indexname;

-- Display constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'registrations'::regclass
ORDER BY conname;

/*
MIGRATION NOTES:

1. This schema is compatible with the existing Supabase structure
2. All indexes are created for optimal query performance
3. Constraints ensure data integrity
4. Views provide convenient access to filtered data
5. Triggers automatically maintain updated_at timestamps

TO RUN THIS MIGRATION:
1. Connect to your Neon database
2. Execute this entire script
3. Verify the table and indexes were created
4. Test with sample data if needed

POST-MIGRATION STEPS:
1. Update your Netlify functions to use the new Neon connection
2. Update environment variables
3. Run data migration script to transfer existing data
4. Test all functionality
5. Update frontend if needed

ROLLBACK (if needed):
DROP VIEW IF EXISTS registration_stats;
DROP VIEW IF EXISTS public_registrations;
DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS registrations;
*/