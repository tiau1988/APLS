// Test script to verify admin authentication system
// Tests both unauthorized and authorized access to admin endpoints

// Using built-in fetch API (Node.js 18+)

const ADMIN_API_URL = 'http://localhost:8888/.netlify/functions/admin-registrations';
const ADMIN_PASSWORD = 'APLLS2026';

async function testUnauthorizedAccess() {
    console.log('\n=== Testing Unauthorized Access ===');
    try {
        const response = await fetch(ADMIN_API_URL);
        const data = await response.json();
        
        console.log('Status:', response.status);
        console.log('Response:', data);
        
        if (response.status === 401) {
            console.log('✅ Unauthorized access properly blocked');
        } else {
            console.log('❌ Security issue: Unauthorized access allowed');
        }
    } catch (error) {
        console.error('Error testing unauthorized access:', error.message);
    }
}

async function testAuthorizedAccess() {
    console.log('\n=== Testing Authorized Access ===');
    try {
        const response = await fetch(ADMIN_API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Token': ADMIN_PASSWORD
            }
        });
        
        const data = await response.json();
        
        console.log('Status:', response.status);
        console.log('Success:', data.success);
        
        if (response.status === 200 && data.success) {
            console.log('✅ Authorized access working correctly');
            console.log('Total registrations:', data.registrations?.length || 0);
        } else {
            console.log('❌ Issue with authorized access');
        }
    } catch (error) {
        console.error('Error testing authorized access:', error.message);
    }
}

async function runTests() {
    console.log('🔐 Testing Admin Authentication System');
    console.log('=====================================');
    
    await testUnauthorizedAccess();
    await testAuthorizedAccess();
    
    console.log('\n🎉 Authentication tests completed!');
}

runTests().catch(console.error);