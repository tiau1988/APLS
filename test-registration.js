// Test script to verify registration functionality
const testRegistration = async () => {
    console.log('Testing registration endpoint...');
    
    // Test data that matches frontend structure
    const testData = {
        registrationId: `APC2026-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase(),
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        email: `test${Date.now()}@example.com`,
        phone: '+1234567890',
        residenceCountry: 'Malaysia',
        passportNric: 'A1234567',
        gender: 'male',
        address: '123 Test Street, Test City',
        clubName: 'Test Lions Club',
        district: '308A1',
        otherDistrict: '',
        ppoasPosition: '',
        districtCabinetPosition: '',
        clubPosition: 'member',
        position: '',
        positionInNgo: '',
        otherNgos: '',
        registrationType: 'package-1',
        vegetarian: 'no',
        poolsideParty: 'yes',
        communityService: 'no',
        installationBanquet: 'yes',
        termsConditions: 'yes',
        marketingEmails: 'no',
        privacyPolicy: 'yes',
        totalAmount: 350,
        paymentSlip: {
            fileName: 'test-payment.jpg',
            fileType: 'image/jpeg',
            fileSize: 12345,
            fileData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A'
        }
    };
    
    try {
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
        console.log('Response data:', result);
        
        if (response.ok && result.success) {
            console.log('✅ Registration test PASSED');
            console.log('Registration ID:', result.data?.registration_id);
            return true;
        } else {
            console.log('❌ Registration test FAILED');
            console.log('Error:', result.message || result.error);
            return false;
        }
        
    } catch (error) {
        console.log('❌ Registration test ERROR');
        console.error('Network error:', error);
        return false;
    }
};

// Test duplicate email scenario
const testDuplicateEmail = async () => {
    console.log('\nTesting duplicate email scenario...');
    
    const testData = {
        registrationId: `APC2026-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase(),
        firstName: 'Jane',
        lastName: 'Doe',
        fullName: 'Jane Doe',
        email: 'test@example.com', // Use existing email
        phone: '+1234567890',
        residenceCountry: 'Malaysia',
        passportNric: 'B1234567',
        gender: 'female',
        address: '456 Test Avenue, Test City',
        clubName: 'Another Lions Club',
        district: '308A2',
        otherDistrict: '',
        ppoasPosition: '',
        districtCabinetPosition: '',
        clubPosition: 'member',
        position: '',
        positionInNgo: '',
        otherNgos: '',
        registrationType: 'package-2',
        vegetarian: 'yes',
        poolsideParty: 'no',
        communityService: 'yes',
        installationBanquet: 'no',
        termsConditions: 'yes',
        marketingEmails: 'yes',
        privacyPolicy: 'yes',
        totalAmount: 400,
        paymentSlip: {
            fileName: 'test-payment2.jpg',
            fileType: 'image/jpeg',
            fileSize: 23456,
            fileData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A'
        }
    };
    
    try {
        const response = await fetch('http://localhost:8888/.netlify/functions/register-neon', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        const result = await response.json();
        
        console.log('Response status:', response.status);
        console.log('Response data:', result);
        
        if (response.status === 409 && !result.success) {
            console.log('✅ Duplicate email test PASSED');
            console.log('Error message:', result.message || result.error);
            return true;
        } else {
            console.log('❌ Duplicate email test FAILED - Expected 409 status');
            return false;
        }
        
    } catch (error) {
        console.log('❌ Duplicate email test ERROR');
        console.error('Network error:', error);
        return false;
    }
};

// Run all tests
const runTests = async () => {
    console.log('=== Registration Endpoint Tests ===\n');
    
    const test1 = await testRegistration();
    const test2 = await testDuplicateEmail();
    
    console.log('\n=== Test Results ===');
    console.log(`New registration: ${test1 ? 'PASS' : 'FAIL'}`);
    console.log(`Duplicate email: ${test2 ? 'PASS' : 'FAIL'}`);
    console.log(`Overall: ${test1 && test2 ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
};

// Export for Node.js or run directly in browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testRegistration, testDuplicateEmail, runTests };
} else {
    // Run tests if in browser
    runTests();
}