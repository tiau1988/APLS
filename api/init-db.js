// Database initialization script
// Run this once to create the registrations table
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create registrations table
    await sql`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        registration_id VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        club_name VARCHAR(255),
        district VARCHAR(100),
        position VARCHAR(100),
        registration_type VARCHAR(50) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        optional_programs JSONB,
        payment_slip TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create index for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_registrations_type ON registrations(registration_type);
    `;

    res.status(200).json({
      success: true,
      message: 'Database initialized successfully!'
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize database',
      details: error.message
    });
  }
}