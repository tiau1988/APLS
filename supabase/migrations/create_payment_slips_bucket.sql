-- Create storage bucket for payment slips
-- This bucket will store uploaded payment slip files

-- Create the payment-slips bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-slips', 'payment-slips', true);

-- Set up RLS policies for the payment-slips bucket
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload payment slips" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'payment-slips' AND
  auth.role() = 'authenticated'
);

-- Allow public read access to payment slips
CREATE POLICY "Allow public read access to payment slips" ON storage.objects
FOR SELECT USING (
  bucket_id = 'payment-slips'
);

-- Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated users to update payment slips" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'payment-slips' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated users to delete payment slips" ON storage.objects
FOR DELETE USING (
  bucket_id = 'payment-slips' AND
  auth.role() = 'authenticated'
);