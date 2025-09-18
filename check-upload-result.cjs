require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function checkUploadResult() {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL);
    
    const result = await sql`
      SELECT registration_id, email, payment_slip_url, created_at
      FROM registrations 
      WHERE email = 'test-upload-1757914035779@example.com'
    `;
    
    console.log('Database result:', JSON.stringify(result, null, 2));
    
    if (result.length > 0) {
      const registration = result[0];
      if (registration.payment_slip_url) {
        console.log('✅ SUCCESS: Payment slip URL found in database!');
        console.log('URL:', registration.payment_slip_url);
      } else {
        console.log('❌ ISSUE: Payment slip URL is null in database');
      }
    } else {
      console.log('❌ No registration found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUploadResult();