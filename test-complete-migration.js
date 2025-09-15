#!/usr/bin/env node

/**
 * Complete Migration Testing Script
 * Tests all aspects of the Supabase to Neon migration
 */

const { neon } = require('@neondatabase/serverless');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    // Test server URL (update this when testing locally)
    baseUrl: 'http://localhost:8888', // Netlify dev server
    
    // Test data
    testRegistration: {
        fullName: 'Test User Migration',
        email: `test-migration-${Date.now()}@example.com`,
        phone: '1234567890',
        district: 'Test District',
        registrationType: 'regular',
        totalAmount: 300,
        paymentSlip: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
    }
};

// Test results storage
const testResults = {
    database: {},
    functions: {},
    frontend: {},
    integration: {},
    summary: {
        passed: 0,
        failed: 0,
        total: 0
    }
};

// Utility functions
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
        info: '📋',
        success: '✅',
        error: '❌',
        warning: '⚠️'
    }[type] || '📋';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
}

function recordTest(category, testName, passed, details = '') {
    testResults[category][testName] = { passed, details };
    testResults.summary.total++;
    if (passed) {
        testResults.summary.passed++;
    } else {
        testResults.summary.failed++;
    }
}

// Database connection tests
async function testDatabaseConnection() {
    log('Testing Neon database connection...', 'info');
    
    try {
        // Check environment variables
        const requiredEnvVars = ['NEON_DATABASE_URL'];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            recordTest('database', 'environment_variables', false, `Missing: ${missingVars.join(', ')}`);
            log(`Missing environment variables: ${missingVars.join(', ')}`, 'error');
            return false;
        }
        
        recordTest('database', 'environment_variables', true, 'All required variables present');
        log('Environment variables check passed', 'success');
        
        // Test database connection
        const sql = neon(process.env.NEON_DATABASE_URL);
        const result = await sql`SELECT NOW() as current_time`;
        
        recordTest('database', 'connection', true, `Connected at ${result[0].current_time}`);
        log('Database connection successful', 'success');
        
        // Test registrations table exists
        const tableCheck = await sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'registrations'
            )
        `;
        
        if (tableCheck[0].exists) {
            recordTest('database', 'table_exists', true, 'Registrations table found');
            log('Registrations table exists', 'success');
        } else {
            recordTest('database', 'table_exists', false, 'Registrations table not found');
            log('Registrations table does not exist', 'error');
            return false;
        }
        
        // Test table structure
        const columns = await sql`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'registrations'
            ORDER BY ordinal_position
        `;
        
        const expectedColumns = ['id', 'registration_id', 'full_name', 'email', 'phone', 'district'];
        const actualColumns = columns.map(col => col.column_name);
        const hasAllColumns = expectedColumns.every(col => actualColumns.includes(col));
        
        recordTest('database', 'table_structure', hasAllColumns, 
            `Expected: ${expectedColumns.join(', ')}. Found: ${actualColumns.join(', ')}`);
        
        if (hasAllColumns) {
            log('Table structure is correct', 'success');
        } else {
            log('Table structure is incomplete', 'warning');
        }
        
        return true;
        
    } catch (error) {
        recordTest('database', 'connection', false, error.message);
        log(`Database connection failed: ${error.message}`, 'error');
        return false;
    }
}

// Netlify functions tests
async function testNetlifyFunctions() {
    log('Testing Netlify functions...', 'info');
    
    const functions = [
        'register-neon',
        'registration-stats-neon',
        'admin-registrations-neon',
        'get-registrations-neon'
    ];
    
    for (const functionName of functions) {
        try {
            const url = `${CONFIG.baseUrl}/.netlify/functions/${functionName}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const isSuccess = response.status < 500; // Allow 4xx errors (expected for some endpoints)
            recordTest('functions', functionName, isSuccess, 
                `Status: ${response.status} ${response.statusText}`);
            
            if (isSuccess) {
                log(`Function ${functionName} is accessible`, 'success');
            } else {
                log(`Function ${functionName} returned ${response.status}`, 'error');
            }
            
        } catch (error) {
            recordTest('functions', functionName, false, error.message);
            log(`Function ${functionName} test failed: ${error.message}`, 'error');
        }
    }
}

// Test registration submission
async function testRegistrationSubmission() {
    log('Testing registration submission...', 'info');
    
    try {
        const url = `${CONFIG.baseUrl}/.netlify/functions/register-neon`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(CONFIG.testRegistration)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            recordTest('integration', 'registration_submission', true, 
                `Registration ID: ${result.registrationId}`);
            log(`Registration submitted successfully: ${result.registrationId}`, 'success');
            return result.registrationId;
        } else {
            recordTest('integration', 'registration_submission', false, 
                `Status: ${response.status}, Message: ${result.message || 'Unknown error'}`);
            log(`Registration submission failed: ${result.message || 'Unknown error'}`, 'error');
            return null;
        }
        
    } catch (error) {
        recordTest('integration', 'registration_submission', false, error.message);
        log(`Registration submission test failed: ${error.message}`, 'error');
        return null;
    }
}

// Test registration stats
async function testRegistrationStats() {
    log('Testing registration stats...', 'info');
    
    try {
        const url = `${CONFIG.baseUrl}/.netlify/functions/registration-stats-neon`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (response.ok && typeof result.totalCount === 'number') {
            recordTest('integration', 'registration_stats', true, 
                `Total: ${result.totalCount}, Early Bird: ${result.earlyBirdCount}`);
            log(`Registration stats retrieved: ${result.totalCount} total registrations`, 'success');
            return true;
        } else {
            recordTest('integration', 'registration_stats', false, 
                `Status: ${response.status}, Response: ${JSON.stringify(result)}`);
            log('Registration stats test failed', 'error');
            return false;
        }
        
    } catch (error) {
        recordTest('integration', 'registration_stats', false, error.message);
        log(`Registration stats test failed: ${error.message}`, 'error');
        return false;
    }
}

// Test public registrations endpoint
async function testPublicRegistrations() {
    log('Testing public registrations endpoint...', 'info');
    
    try {
        const url = `${CONFIG.baseUrl}/.netlify/functions/get-registrations-neon`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (response.ok && Array.isArray(result.registrations)) {
            recordTest('integration', 'public_registrations', true, 
                `Found ${result.registrations.length} public registrations`);
            log(`Public registrations retrieved: ${result.registrations.length} entries`, 'success');
            return true;
        } else {
            recordTest('integration', 'public_registrations', false, 
                `Status: ${response.status}, Response: ${JSON.stringify(result)}`);
            log('Public registrations test failed', 'error');
            return false;
        }
        
    } catch (error) {
        recordTest('integration', 'public_registrations', false, error.message);
        log(`Public registrations test failed: ${error.message}`, 'error');
        return false;
    }
}

// Test frontend file updates
function testFrontendUpdates() {
    log('Testing frontend file updates...', 'info');
    
    const filesToCheck = [
        { file: 'script.js', endpoints: ['register-neon', 'registration-stats-neon', 'admin-registrations-neon'] },
        { file: 'admin.html', endpoints: ['admin-registrations-neon'] },
        { file: 'registrations.html', endpoints: ['get-registrations-neon'] }
    ];
    
    for (const { file, endpoints } of filesToCheck) {
        const filePath = path.join(__dirname, file);
        
        if (!fs.existsSync(filePath)) {
            recordTest('frontend', `${file}_exists`, false, 'File not found');
            log(`File ${file} not found`, 'error');
            continue;
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        
        let allEndpointsFound = true;
        const missingEndpoints = [];
        
        for (const endpoint of endpoints) {
            if (!content.includes(endpoint)) {
                allEndpointsFound = false;
                missingEndpoints.push(endpoint);
            }
        }
        
        recordTest('frontend', `${file}_endpoints`, allEndpointsFound, 
            allEndpointsFound ? 'All endpoints updated' : `Missing: ${missingEndpoints.join(', ')}`);
        
        if (allEndpointsFound) {
            log(`File ${file} has been updated correctly`, 'success');
        } else {
            log(`File ${file} is missing endpoints: ${missingEndpoints.join(', ')}`, 'error');
        }
    }
}

// Generate test report
function generateTestReport() {
    log('\n' + '='.repeat(60), 'info');
    log('MIGRATION TEST REPORT', 'info');
    log('='.repeat(60), 'info');
    
    const categories = ['database', 'functions', 'frontend', 'integration'];
    
    for (const category of categories) {
        log(`\n${category.toUpperCase()} TESTS:`, 'info');
        
        for (const [testName, result] of Object.entries(testResults[category])) {
            const status = result.passed ? '✅ PASS' : '❌ FAIL';
            log(`  ${testName}: ${status} - ${result.details}`);
        }
    }
    
    log('\n' + '='.repeat(60), 'info');
    log(`SUMMARY: ${testResults.summary.passed}/${testResults.summary.total} tests passed`, 
        testResults.summary.failed === 0 ? 'success' : 'warning');
    
    if (testResults.summary.failed > 0) {
        log(`${testResults.summary.failed} tests failed - review the issues above`, 'error');
    } else {
        log('All tests passed! Migration appears to be successful.', 'success');
    }
    
    log('='.repeat(60), 'info');
    
    // Save detailed report to file
    const reportPath = path.join(__dirname, 'migration-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    log(`Detailed report saved to: ${reportPath}`, 'info');
}

// Main test runner
async function runAllTests() {
    log('Starting complete migration test suite...', 'info');
    log(`Base URL: ${CONFIG.baseUrl}`, 'info');
    
    try {
        // Test database connection
        const dbConnected = await testDatabaseConnection();
        
        // Test frontend file updates
        testFrontendUpdates();
        
        // Test Netlify functions (only if database is connected)
        if (dbConnected) {
            await testNetlifyFunctions();
            
            // Test integration scenarios
            await testRegistrationSubmission();
            await testRegistrationStats();
            await testPublicRegistrations();
        } else {
            log('Skipping function tests due to database connection issues', 'warning');
        }
        
        // Generate final report
        generateTestReport();
        
        // Exit with appropriate code
        process.exit(testResults.summary.failed === 0 ? 0 : 1);
        
    } catch (error) {
        log(`Test suite failed with error: ${error.message}`, 'error');
        process.exit(1);
    }
}

// Command line interface
if (require.main === module) {
    // Parse command line arguments
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Usage: node test-complete-migration.js [options]

Options:
  --base-url <url>    Set the base URL for testing (default: ${CONFIG.baseUrl})
  --help, -h          Show this help message

Environment Variables:
  NEON_DATABASE_URL   Required: Neon database connection string
  CLOUDINARY_CLOUD_NAME  Optional: For file upload testing
  CLOUDINARY_API_KEY     Optional: For file upload testing
  CLOUDINARY_API_SECRET  Optional: For file upload testing
`);
        process.exit(0);
    }
    
    // Parse base URL option
    const baseUrlIndex = args.indexOf('--base-url');
    if (baseUrlIndex !== -1 && args[baseUrlIndex + 1]) {
        CONFIG.baseUrl = args[baseUrlIndex + 1];
    }
    
    // Run tests
    runAllTests();
}

module.exports = {
    runAllTests,
    testDatabaseConnection,
    testNetlifyFunctions,
    testRegistrationSubmission,
    testRegistrationStats,
    testPublicRegistrations,
    testFrontendUpdates,
    CONFIG
};