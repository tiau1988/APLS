const { sql } = require('@vercel/postgres');

async function initializeDatabase() {
  try {
    console.log('🗄️ Initializing database...');
    
    // Create registrations table
    await sql`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        organization VARCHAR(255),
        position VARCHAR(255),
        dietary_requirements TEXT,
        accessibility_needs TEXT,
        emergency_contact_name VARCHAR(255),
        emergency_contact_phone VARCHAR(20),
        status VARCHAR(20) DEFAULT 'pending',
        total_amount DECIMAL(10,2) DEFAULT 0.00,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_registrations_date ON registrations(registration_date)`;
    
    console.log('✅ Database tables created successfully!');
    
    // Check if we have any data
    const count = await sql`SELECT COUNT(*) as total FROM registrations`;
    console.log(`📊 Current registrations: ${count.rows[0].total}`);
    
    return {
      success: true,
      message: 'Database initialized successfully',
      registrationCount: count.rows[0].total
    };
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
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