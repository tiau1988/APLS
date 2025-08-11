// Test script to verify payment slip upload to Supabase Storage
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://eragmmdwgtbylrmjzqwf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYWdtbWR3Z3RieWxybWp6cXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDI1NTYsImV4cCI6MjA3MDE3ODU1Nn0.JBV2bvq7LRep6eAI78wBZn-3bpls0L2vtSWQNVaAfrI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test function to upload a sample file
async function testPaymentSlipUpload() {
  try {
    console.log('Testing payment slip upload to Supabase Storage...');
    
    // Create a simple test image as base64
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const paymentSlipData = {
      fileName: 'test-payment-slip.png',
      fileType: 'image/png',
      fileData: testImageBase64
    };
    
    const registrationId = 'TEST-' + Date.now();
    
    // Convert base64 data URL to buffer
    const base64Data = paymentSlipData.fileData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    const fileExtension = paymentSlipData.fileName.split('.').pop().toLowerCase();
    const fileName = `payment-slip-${registrationId}.${fileExtension}`;
    
    console.log('Uploading file:', fileName);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('payment-slips')
      .upload(fileName, buffer, {
        contentType: paymentSlipData.fileType,
        upsert: true
      });
    
    if (error) {
      console.error('Supabase Storage upload error:', error);
      return null;
    }
    
    console.log('Upload successful:', data);
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('payment-slips')
      .getPublicUrl(fileName);
    
    console.log('Public URL:', publicUrlData.publicUrl);
    
    return publicUrlData.publicUrl;
    
  } catch (error) {
    console.error('Error testing payment slip upload:', error);
    return null;
  }
}

// Run the test
testPaymentSlipUpload().then(result => {
  if (result) {
    console.log('✅ Payment slip upload test successful!');
    console.log('File URL:', result);
  } else {
    console.log('❌ Payment slip upload test failed!');
  }
  process.exit(0);
});