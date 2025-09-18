/**
 * Cloudinary Setup Script
 * This script helps users configure Cloudinary credentials and test the setup
 */

import { createInterface } from 'readline';
import { writeFileSync, readFileSync } from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🚀 Cloudinary Setup for APLLS 2026 Registration System');
  console.log('==================================================');
  console.log('');
  console.log('This script will help you configure Cloudinary for payment slip uploads.');
  console.log('If you don\'t have a Cloudinary account yet, please:');
  console.log('1. Go to https://cloudinary.com');
  console.log('2. Sign up for a free account');
  console.log('3. Get your credentials from the Dashboard');
  console.log('');
  
  const proceed = await question('Do you have your Cloudinary credentials ready? (y/n): ');
  
  if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
    console.log('');
    console.log('Please get your Cloudinary credentials first and run this script again.');
    console.log('See CLOUDINARY_SETUP.md for detailed instructions.');
    rl.close();
    return;
  }
  
  console.log('');
  console.log('Please enter your Cloudinary credentials:');
  console.log('');
  
  const cloudName = await question('Cloud Name: ');
  const apiKey = await question('API Key: ');
  const apiSecret = await question('API Secret: ');
  
  console.log('');
  console.log('🧪 Testing credentials...');
  
  // Configure Cloudinary with provided credentials
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
  
  try {
    // Test API connectivity
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary API connection successful!');
    
    // Test upload with a simple base64 image
    console.log('🚀 Testing image upload...');
    
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const uploadResult = await cloudinary.uploader.upload(testImageBase64, {
      resource_type: 'auto',
      public_id: `setup-test-${Date.now()}`,
      folder: 'aplls-2026/test'
    });
    
    console.log('✅ Upload test successful!');
    console.log('🔗 Test image URL:', uploadResult.secure_url);
    
    // Update .env file
    console.log('');
    console.log('💾 Updating .env file...');
    
    let envContent = readFileSync('.env', 'utf8');
    
    envContent = envContent.replace(
      /CLOUDINARY_CLOUD_NAME=.*/,
      `CLOUDINARY_CLOUD_NAME=${cloudName}`
    );
    envContent = envContent.replace(
      /CLOUDINARY_API_KEY=.*/,
      `CLOUDINARY_API_KEY=${apiKey}`
    );
    envContent = envContent.replace(
      /CLOUDINARY_API_SECRET=.*/,
      `CLOUDINARY_API_SECRET=${apiSecret}`
    );
    
    writeFileSync('.env', envContent);
    
    console.log('✅ .env file updated successfully!');
    console.log('');
    console.log('🎉 Cloudinary setup complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Restart your development server (netlify dev)');
    console.log('2. Test the complete upload flow: node test-cloudinary-upload.js');
    console.log('3. Check that payment slip URLs now use Cloudinary');
    console.log('');
    
  } catch (error) {
    console.error('❌ Setup failed:');
    console.error('Error:', error.message);
    
    if (error.http_code) {
      console.error('HTTP Code:', error.http_code);
    }
    
    if (error.error && error.error.message) {
      console.error('API Error:', error.error.message);
    }
    
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('1. Double-check your credentials are correct');
    console.log('2. Make sure your Cloudinary account is active');
    console.log('3. Verify you have internet connectivity');
    console.log('4. Try creating a new Cloudinary account if issues persist');
    console.log('');
  }
  
  rl.close();
}

main().catch(console.error);