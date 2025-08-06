const { Pool } = require('pg');

async function initializeDatabase() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🗄️ Initializing database...');
    
    // Create registrations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        organization VARCHAR(255),
        position VARCHAR(255),
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending',
        gender VARCHAR(20),
        address TEXT,
        district VARCHAR(100),
        other_district VARCHAR(100),
        ppoas_position VARCHAR(100),
        district_cabinet_position VARCHAR(100),
        club_position VARCHAR(100),
        position_in_ngo VARCHAR(100),
        other_ngos TEXT,
        registration_type VARCHAR(50),
        registration_fee INTEGER DEFAULT 0,
        optional_fee INTEGER DEFAULT 0,
        total_amount INTEGER DEFAULT 0,
        vegetarian VARCHAR(20),
        poolside_party VARCHAR(50),
        community_service VARCHAR(50),
        installation_banquet VARCHAR(50),
        terms_conditions BOOLEAN DEFAULT FALSE,
        marketing_emails BOOLEAN DEFAULT FALSE,
        privacy_policy BOOLEAN DEFAULT FALSE,
        registration_id VARCHAR(50) UNIQUE,
        payment_slip_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes for better performance
    await pool.query('CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_registrations_date ON registrations(registration_date)');
    
    console.log('✅ Database tables created successfully!');
    
    // Check if we have any data
    const count = await pool.query('SELECT COUNT(*) as total FROM registrations');
    console.log(`📊 Current registrations: ${count.rows[0].total}`);
    
    return {
      success: true,
      message: 'Database initialized successfully',
      registrationCount: count.rows[0].total
    };
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// If running directly
if (require.main === module) {
  initializeDatabase()
    .then(result => {
      console.log('🎉 Database setup complete:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };