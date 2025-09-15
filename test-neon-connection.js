// Test Neon Database Connection
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();

async function testConnection() {
  try {
    console.log('Testing Neon database connection...');
    
    const sql = neon(process.env.NEON_DATABASE_URL);
    
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time, version() as postgres_version`;
    
    console.log('✅ Connection successful!');
    console.log('Current time:', result[0].current_time);
    console.log('PostgreSQL version:', result[0].postgres_version);
    
    // Test if we can create a simple table (will be used for migration)
    await sql`CREATE TABLE IF NOT EXISTS connection_test (id SERIAL PRIMARY KEY, test_message TEXT)`;
    await sql`INSERT INTO connection_test (test_message) VALUES ('Connection test successful')`;
    
    const testResult = await sql`SELECT * FROM connection_test LIMIT 1`;
    console.log('✅ Database operations working:', testResult[0]);
    
    // Clean up test table
    await sql`DROP TABLE connection_test`;
    
    console.log('\n🎉 Neon database is ready for migration!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nPlease check:');
    console.error('1. Your .env file contains the correct NEON_DATABASE_URL');
    console.error('2. Your Neon database is active and accessible');
    console.error('3. The connection string is properly formatted');
    process.exit(1);
  }
}

testConnection();