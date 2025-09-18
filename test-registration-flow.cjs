const fs = require('fs');
const path = require('path');
// Use built-in fetch in Node.js 18+
const fetch = globalThis.fetch || require('node-fetch');

// Test registration with file upload
async function testRegistrationWithFile() {
  try {
    console.log('Testing registration with file upload...');
    
    // Create a small test image as base64
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const testData = {
      fullName: 'Test User Upload',
      email: `test-upload-${Date.now()}@example.com`,
      phone: '+1234567890',
      residenceCountry: 'Malaysia',
      passportNric: 'A1234567',
      gender: 'male',
      address: '123 Test Street',
      clubName: 'Test Club',
      district: 'District 1',
      registrationType: 'delegate',
      vegetarian: false,
      poolsideParty: true,
      communityService: true,
      installationBanquet: true,
      termsConditions: true,
      marketingEmails: true,
      privacyPolicy: true,
      totalAmount: 150,
      paymentSlip: {
        fileName: 'test-payment-slip.png',
        fileType: 'image/png',
        fileSize: 95,
        fileData: testImageBase64
      }
    };
    
    console.log('Sending registration request...');
    const response = await fetch('http://localhost:8888/.netlify/functions/register-neon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(result, null, 2));
    
    if (result.success && result.data.payment_slip_uploaded) {
      console.log('✅ SUCCESS: Registration with file upload completed!');
      console.log('Registration ID:', result.data.registration_id);
      console.log('Payment slip uploaded:', result.data.payment_slip_uploaded);
      
      // Now check if the URL was saved to database
      console.log('\nChecking database for the uploaded file URL...');
      await checkDatabaseForUpload(result.data.registration_id);
    } else {
      console.log('❌ FAILED: Registration or file upload failed');
      console.log('Error:', result.error || result.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Check database for the uploaded file
async function checkDatabaseForUpload(registrationId) {
  try {
    const { neon } = require('@neondatabase/serverless');
    require('dotenv').config();
    
    const sql = neon(process.env.NEON_DATABASE_URL);
    
    const result = await sql`
      SELECT registration_id, email, payment_slip_url, created_at
      FROM registrations 
      WHERE registration_id = ${registrationId}
    `;
    
    if (result.length > 0) {
      const registration = result[0];
      console.log('✅ Found registration in database:');
      console.log('- Registration ID:', registration.registration_id);
      console.log('- Email:', registration.email);
      console.log('- Payment Slip URL:', registration.payment_slip_url);
      console.log('- Created At:', registration.created_at);
      
      if (registration.payment_slip_url) {
        console.log('✅ SUCCESS: Payment slip URL was saved to database!');
        console.log('Cloudinary URL:', registration.payment_slip_url);
      } else {
        console.log('❌ ISSUE: Payment slip URL is null in database');
      }
    } else {
      console.log('❌ ISSUE: Registration not found in database');
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testRegistrationWithFile();
}

module.exports = { testRegistrationWithFile };