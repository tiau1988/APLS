-- Update RLS policies for payment-slips bucket to allow anonymous access
-- This fixes the "new row violates row-level security policy" error

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to upload payment slips" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update payment slips" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete payment slips" ON storage.objects;

-- Create new policies that allow anonymous access
CREATE POLICY "Allow anonymous users to upload payment slips" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'payment-slips'
);

CREATE POLICY "Allow anonymous users to update payment slips" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'payment-slips'
);

CREATE POLICY "Allow anonymous users to delete payment slips" ON storage.objects
FOR DELETE USING (
  bucket_id = 'payment-slips'
);

-- Drop and recreate public read access policy
DROP POLICY IF EXISTS "Allow public read access to payment slips" ON storage.objects;

CREATE POLICY "Allow public read access to payment slips" ON storage.objects
FOR SELECT USING (
  bucket_id = 'payment-slips'
);