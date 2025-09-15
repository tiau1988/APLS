/**
 * Test script to debug admin login issue
 * This will test both frontend logic and backend API
 */

const https = require('https');
const http = require('http');

// Test 1: Check if frontend login logic works
function testFrontendLogin() {
    console.log('\n=== Testing Frontend Login Logic ===');
    const ADMIN_PASSWORD = 'APLLS2026';
    const inputPassword = 'APLLS2026';
    
    console.log('Expected password:', ADMIN_PASSWORD);
    console.log('Input password:', inputPassword);
    console.log('Passwords match:', inputPassword === ADMIN_PASSWORD);
    
    if (inputPassword === ADMIN_PASSWORD) {
        console.log('✅ Frontend login logic should work');
        return true;
    } else {
        console.log('❌ Frontend login logic failed');
        return false;
    }
}

// Test 2: Check backend API with X-Admin-Token
function testBackendAPI() {
    return new Promise((resolve, reject) => {
        console.log('\n=== Testing Backend API ===');
        
        const options = {
            hostname: 'localhost',
            port: 8888,
            path: '/.netlify/functions/admin-registrations-neon',
            method: 'GET',
            headers: {
                'X-Admin-Token': 'APLLS2026',
                'Content-Type': 'application/json'
            }
        };
        
        const req = http.request(options, (res) => {
            console.log('Response status:', res.statusCode);
            console.log('Response headers:', res.headers);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log('Response success:', jsonData.success);
                    console.log('Registrations count:', jsonData.registrations ? jsonData.registrations.length : 0);
                    
                    if (jsonData.success) {
                        console.log('✅ Backend API authentication works');
                        resolve(true);
                    } else {
                        console.log('❌ Backend API returned error:', jsonData.error);
                        resolve(false);
                    }
                } catch (error) {
                    console.log('❌ Failed to parse response:', error.message);
                    console.log('Raw response:', data);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Request failed:', error.message);
            resolve(false);
        });
        
        req.end();
    });
}

// Test 3: Check environment variables
function testEnvironmentVariables() {
    console.log('\n=== Testing Environment Variables ===');
    
    // Read .env file
    const fs = require('fs');
    const path = require('path');
    
    try {
        const envPath = path.join(__dirname, '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        console.log('Environment file content:');
        console.log(envContent);
        
        // Check if ADMIN_PASSWORD is set
        const adminPasswordMatch = envContent.match(/ADMIN_PASSWORD\s*=\s*(.+)/);
        if (adminPasswordMatch) {
            const envPassword = adminPasswordMatch[1].trim();
            console.log('Environment ADMIN_PASSWORD:', envPassword);
            console.log('Matches expected:', envPassword === 'APLLS2026');
            return envPassword === 'APLLS2026';
        } else {
            console.log('❌ ADMIN_PASSWORD not found in .env file');
            return false;
        }
    } catch (error) {
        console.log('❌ Failed to read .env file:', error.message);
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('🔍 Debugging Admin Login Issue');
    console.log('=====================================');
    
    const frontendTest = testFrontendLogin();
    const envTest = testEnvironmentVariables();
    const backendTest = await testBackendAPI();
    
    console.log('\n=== Test Results Summary ===');
    console.log('Frontend Logic:', frontendTest ? '✅ PASS' : '❌ FAIL');
    console.log('Environment Variables:', envTest ? '✅ PASS' : '❌ FAIL');
    console.log('Backend API:', backendTest ? '✅ PASS' : '❌ FAIL');
    
    if (frontendTest && envTest && backendTest) {
        console.log('\n🎉 All tests passed! The login should work.');
        console.log('\n💡 Possible issues:');
        console.log('1. Browser cache - try hard refresh (Ctrl+F5)');
        console.log('2. JavaScript errors in browser console');
        console.log('3. Network issues between frontend and backend');
    } else {
        console.log('\n❌ Some tests failed. Check the issues above.');
    }
}

// Run the tests
runTests().catch(console.error);