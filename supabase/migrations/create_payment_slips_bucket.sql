-- Create storage bucket for payment slips
-- This bucket will store uploaded payment slip files

-- Create the payment-slips bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-slips', 'payment-slips', true);

-- Set up RLS policies for the payment-slips bucket
-- Allow anonymous users to upload files (for Netlify functions using anon key)
CREATE POLICY "Allow anonymous users to upload payment slips" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'payment-slips'
);

-- Allow public read access to payment slips
CREATE POLICY "Allow public read access to payment slips" ON storage.objects
FOR SELECT USING (
  bucket_id = 'payment-slips'
);

-- Allow anonymous users to update files (for Netlify functions using anon key)
CREATE POLICY "Allow anonymous users to update payment slips" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'payment-slips'
);

-- Allow anonymous users to delete files (for Netlify functions using anon key)
CREATE POLICY "Allow anonymous users to delete payment slips" ON storage.objects
FOR DELETE USING (
  bucket_id = 'payment-slips'
);