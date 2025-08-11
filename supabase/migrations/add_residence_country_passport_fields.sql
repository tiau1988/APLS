-- Add residence_country and passport_nric columns to registrations table
ALTER TABLE registrations 
ADD COLUMN residence_country TEXT,
ADD COLUMN passport_nric TEXT;

-- Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE ON registrations TO anon;
GRANT ALL PRIVILEGES ON registrations TO authenticated;

-- Add comments for documentation
COMMENT ON COLUMN registrations.residence_country IS 'Country/region of residence for the registrant';
COMMENT ON COLUMN registrations.passport_nric IS 'Passport number or NRIC number of the registrant';