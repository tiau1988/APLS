-- APLLS 2026 Registration Database Schema
-- Copy and paste this into your Neon SQL Console

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  organization VARCHAR(255),
  position VARCHAR(255),
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  gender VARCHAR(20),
  address TEXT,
  district VARCHAR(100),
  other_district VARCHAR(100),
  ppoas_position VARCHAR(100),
  district_cabinet_position VARCHAR(100),
  club_position VARCHAR(100),
  position_in_ngo VARCHAR(100),
  other_ngos TEXT,
  registration_type VARCHAR(50),
  registration_fee INTEGER DEFAULT 0,
  optional_fee INTEGER DEFAULT 0,
  total_amount INTEGER DEFAULT 0,
  vegetarian VARCHAR(20),
  poolside_party VARCHAR(50),
  community_service VARCHAR(50),
  installation_banquet VARCHAR(50),
  terms_conditions BOOLEAN DEFAULT FALSE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  privacy_policy BOOLEAN DEFAULT FALSE,
  registration_id VARCHAR(50) UNIQUE,
  payment_slip_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_date ON registrations(registration_date);
CREATE INDEX IF NOT EXISTS idx_registrations_type ON registrations(registration_type);

-- Insert a test record to verify everything works
INSERT INTO registrations (
  first_name, last_name, email, phone, organization, 
  registration_type, registration_fee, total_amount, registration_id
) VALUES (
  'Test', 'User', 'test@example.com', '+60123456789', 'Test Lions Club',
  'early-bird', 260, 260, 'REG-TEST-001'
);

-- Verify the table was created and data inserted
SELECT COUNT(*) as total_registrations FROM registrations;
SELECT * FROM registrations LIMIT 5;