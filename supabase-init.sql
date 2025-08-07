-- Supabase table creation script for APLLS 2026 registrations
-- Run this in your Supabase SQL editor to create the registrations table

CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  registration_id VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  club_name VARCHAR(255),
  position VARCHAR(255),
  gender VARCHAR(50),
  address TEXT,
  district VARCHAR(255),
  other_district VARCHAR(255),
  ppoas_position VARCHAR(255),
  district_cabinet_position VARCHAR(255),
  club_position VARCHAR(255),
  position_in_ngo VARCHAR(255),
  other_ngos TEXT,
  registration_type VARCHAR(50) NOT NULL,
  registration_fee DECIMAL(10,2),
  optional_fee DECIMAL(10,2),
  total_amount DECIMAL(10,2) NOT NULL,
  vegetarian BOOLEAN DEFAULT FALSE,
  poolside_party BOOLEAN DEFAULT FALSE,
  community_service BOOLEAN DEFAULT FALSE,
  installation_banquet BOOLEAN DEFAULT FALSE,
  terms_conditions BOOLEAN DEFAULT FALSE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  privacy_policy BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'confirmed',
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_registration_id ON registrations(registration_id);
CREATE INDEX IF NOT EXISTS idx_registrations_date ON registrations(registration_date);
CREATE INDEX IF NOT EXISTS idx_registrations_type ON registrations(registration_type);

-- Insert sample data (optional - remove if you don't want sample data)
INSERT INTO registrations (
  registration_id, first_name, last_name, email, phone, club_name, position, 
  district, registration_type, total_amount, status, registration_date
) VALUES 
(
  'APLLS-1703123456789-ABC123DEF', 'John', 'Doe', 'john.doe@example.com', 
  '+60123456789', 'Lions Club KL', 'President', 'District 308B1', 
  'early-bird', 260, 'confirmed', '2024-01-15T10:30:00Z'
),
(
  'APLLS-1703123456790-DEF456GHI', 'Jane', 'Smith', 'jane.smith@example.com', 
  '+60123456790', 'Lions Club PJ', 'Secretary', 'District 308B2', 
  'regular', 300, 'pending', '2024-01-16T14:20:00Z'
),
(
  'APLLS-1703123456791-GHI789JKL', 'Mike', 'Johnson', 'mike.johnson@example.com', 
  '+60123456791', 'Lions Club Subang', 'Treasurer', 'District 308B1', 
  'early-bird', 260, 'confirmed', NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security (RLS) for better security
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access" ON registrations FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON registrations FOR INSERT WITH CHECK (true);