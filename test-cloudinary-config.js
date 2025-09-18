/**
 * Test Cloudinary Configuration
 * This script tests if Cloudinary is properly configured and accessible
 */

import { config } from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('🔧 Testing Cloudinary Configuration...');
console.log('==================================================');
console.log('📋 Environment Variables:');
console.log('  CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('  CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('  CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '[SET]' : '[NOT SET]');
console.log('');

// Test Cloudinary configuration
console.log('🧪 Testing Cloudinary API connection...');

try {
  // Test API connectivity by getting account details
  const result = await cloudinary.api.ping();
  console.log('✅ Cloudinary API connection successful!');
  console.log('📊 API Response:', result);
  
  // Test upload with a simple base64 image
  console.log('\n🚀 Testing image upload...');
  
  // Create a simple 1x1 pixel PNG in base64
  const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  
  const uploadResult = await cloudinary.uploader.upload(testImageBase64, {
    resource_type: 'auto',
    public_id: `test-upload-${Date.now()}`,
    folder: 'aplls-2026/test'
  });
  
  console.log('✅ Upload successful!');
  console.log('🔗 Cloudinary URL:', uploadResult.secure_url);
  console.log('📊 Upload details:', {
    public_id: uploadResult.public_id,
    format: uploadResult.format,
    resource_type: uploadResult.resource_type,
    bytes: uploadResult.bytes
  });
  
} catch (error) {
  console.error('❌ Cloudinary test failed:');
  console.error('Error:', error.message);
  
  if (error.http_code) {
    console.error('HTTP Code:', error.http_code);
  }
  
  if (error.error && error.error.message) {
    console.error('API Error:', error.error.message);
  }
  
  console.log('\n💡 Troubleshooting tips:');
  console.log('1. Make sure you have a valid Cloudinary account');
  console.log('2. Check that your API credentials are correct');
  console.log('3. Verify your account is not suspended or has quota issues');
  console.log('4. Try using different credentials or create a new Cloudinary account');
}

console.log('\n==================================================');
console.log('🏁 Cloudinary Configuration Test Complete');