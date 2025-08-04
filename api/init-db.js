const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).json({ message: 'CORS preflight handled' });
    return;
  }

  // Only allow POST requests for database initialization
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST to initialize database.' });
  }

  try {
    // Create the registrations table
    await sql`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        organization VARCHAR(255),
        position VARCHAR(255),
        country VARCHAR(100),
        dietary_restrictions TEXT,
        accessibility_needs TEXT,
        emergency_contact_name VARCHAR(255),
        emergency_contact_phone VARCHAR(20),
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending'
      )
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_registrations_date ON registrations(registration_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status)`;

    // Get current count of registrations
    const countResult = await sql`SELECT COUNT(*) as count FROM registrations`;
    const registrationCount = countResult.rows[0].count;

    res.status(200).json({
      message: 'Database initialized successfully!',
      timestamp: new Date().toISOString(),
      registrationCount: parseInt(registrationCount),
      tableCreated: true
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({
      error: 'Failed to initialize database',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};