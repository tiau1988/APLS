-- Add payment_slip_url column to registrations table
-- This column will store the URL or path to uploaded payment slip files

ALTER TABLE registrations 
ADD COLUMN payment_slip_url TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN registrations.payment_slip_url IS 'URL or path to the uploaded payment slip file';

-- Grant permissions to anon and authenticated roles for the new column
GRANT SELECT ON registrations TO anon;
GRANT ALL PRIVILEGES ON registrations TO authenticated;