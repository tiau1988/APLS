/**
 * Test script for Cloudinary upload functionality
 * Tests the complete registration flow with payment slip upload
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Test configuration
const BASE_URL = 'http://localhost:8888';
const TEST_IMAGE_PATH = path.join(process.cwd(), 'assets', 'APLS Logo.png');

// Helper function to convert file to base64
function fileToBase64(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const base64String = fileBuffer.toString('base64');
    const mimeType = 'image/png';
    return `data:${mimeType};base64,${base64String}`;
  } catch (error) {
    console.error('Error reading test file:', error.message);
    return null;
  }
}

// Test data
const testRegistrationData = {
  fullName: 'Test User',
  email: `test.cloudinary.${Date.now()}@example.com`,
  phone: '+1234567890',
  residenceCountry: 'Malaysia',
  passportNric: 'TEST123456',
  gender: 'male',
  address: '123 Test Street, Test City',
  clubName: 'Test Lions Club',
  district: 'District 308-A1',
  ppoasPosition: 'Member',
  districtCabinetPosition: 'None',
  clubPosition: 'Member',
  positionInNgo: 'None',
  otherNgos: '',
  registrationType: 'early-bird',
  vegetarian: false,
  poolsideParty: true,
  communityService: true,
  installationBanquet: true,
  termsConditions: true,
  marketingEmails: false,
  privacyPolicy: true,
  totalAmount: 450,
  paymentSlip: null // Will be set below
};

async function testCloudinaryUpload() {
  console.log('🧪 Starting Cloudinary Upload Test...');
  console.log('=' .repeat(50));

  try {
    // Step 1: Check if test image exists
    console.log('📁 Checking test image file...');
    if (!fs.existsSync(TEST_IMAGE_PATH)) {
      console.log('⚠️  Test image not found, creating a simple test file...');
      // Create a simple test file if the logo doesn't exist
      const testContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
      fs.writeFileSync(path.join(process.cwd(), 'test-image.png'), testContent);
      testRegistrationData.paymentSlip = {
        fileName: 'test-image.png',
        fileData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      };
    } else {
      console.log('✅ Test image found, converting to base64...');
      const base64Data = fileToBase64(TEST_IMAGE_PATH);
      if (!base64Data) {
        throw new Error('Failed to convert test image to base64');
      }
      testRegistrationData.paymentSlip = {
        fileName: 'test-payment-slip.png',
        fileData: base64Data
      };
    }

    // Step 2: Test the registration endpoint
    console.log('🚀 Testing registration with Cloudinary upload...');
    console.log(`📧 Test email: ${testRegistrationData.email}`);
    
    const response = await fetch(`${BASE_URL}/.netlify/functions/register-neon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRegistrationData)
    });

    const result = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Data:', JSON.stringify(result, null, 2));

    // Step 3: Analyze results
    if (response.ok && result.success) {
      console.log('\n✅ SUCCESS: Registration completed!');
      console.log(`🆔 Registration ID: ${result.registrationId}`);
      
      if (result.warnings && result.warnings.length > 0) {
        console.log('⚠️  Warnings detected:');
        result.warnings.forEach(warning => {
          console.log(`   • ${warning}`);
        });
      }
      
      // Check if Cloudinary URL is present
      if (result.data && result.data.payment_slip_url) {
        console.log(`🖼️  Payment slip URL: ${result.data.payment_slip_url}`);
        
        // Verify it's a Cloudinary URL
        if (result.data.payment_slip_url.includes('cloudinary.com')) {
          console.log('✅ Cloudinary upload successful!');
          
          // Test if the URL is accessible
          try {
            const imageResponse = await fetch(result.data.payment_slip_url);
            if (imageResponse.ok) {
              console.log('✅ Uploaded image is accessible via URL');
            } else {
              console.log('❌ Uploaded image URL is not accessible');
            }
          } catch (urlError) {
            console.log('❌ Error accessing uploaded image URL:', urlError.message);
          }
        } else {
          console.log('❌ Payment slip URL is not from Cloudinary');
        }
      } else {
        console.log('❌ No payment slip URL in response');
      }
      
    } else {
      console.log('\n❌ FAILURE: Registration failed');
      console.log(`💬 Message: ${result.message}`);
      if (result.error) {
        console.log(`🚨 Error: ${result.error}`);
      }
      if (result.details) {
        console.log('📝 Details:', JSON.stringify(result.details, null, 2));
      }
    }

    // Step 4: Test admin panel access
    console.log('\n🔍 Testing admin panel image display...');
    try {
      const adminResponse = await fetch(`${BASE_URL}/.netlify/functions/admin-registrations-neon`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer admin-test-token'
        }
      });
      
      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        console.log('✅ Admin endpoint accessible');
        console.log(`📊 Total registrations in admin: ${adminData.registrations ? adminData.registrations.length : 'N/A'}`);
      } else {
        console.log('⚠️  Admin endpoint test skipped (authentication required)');
      }
    } catch (adminError) {
      console.log('⚠️  Admin endpoint test failed:', adminError.message);
    }

  } catch (error) {
    console.log('\n💥 TEST FAILED WITH ERROR:');
    console.error(error);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🏁 Cloudinary Upload Test Complete');
}

// Run the test
console.log('🔧 Starting test script...');
console.log('📍 Current working directory:', process.cwd());
console.log('📄 Script path:', import.meta.url);

testCloudinaryUpload().catch(error => {
  console.error('💥 Unhandled error in test:', error);
  process.exit(1);
});

export { testCloudinaryUpload };