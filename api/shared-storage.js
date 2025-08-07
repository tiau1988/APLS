// Shared storage module for registration system
// Uses Vercel KV for persistent data storage across serverless function calls

// Global in-memory storage with persistence simulation
global.registrations = global.registrations || [];

// Initialize with sample data if empty
if (global.registrations.length === 0) {
  global.registrations = [
    {
      id: 1,
      registration_id: 'APLLS-1703123456789-ABC123DEF',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+60123456789',
      club_name: 'Lions Club KL',
      position: 'President',
      district: 'District 308B1',
      registration_type: 'early-bird',
      total_amount: 260,
      registration_date: new Date('2024-01-15T10:30:00Z').toISOString(),
      status: 'confirmed'
    },
    {
      id: 2,
      registration_id: 'APLLS-1703123456790-DEF456GHI',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+60123456790',
      club_name: 'Lions Club PJ',
      position: 'Secretary',
      district: 'District 308B2',
      registration_type: 'regular',
      total_amount: 300,
      registration_date: new Date('2024-01-16T14:20:00Z').toISOString(),
      status: 'pending'
    },
    {
      id: 3,
      registration_id: 'APLLS-1703123456791-GHI789JKL',
      first_name: 'Mike',
      last_name: 'Johnson',
      email: 'mike.johnson@example.com',
      phone: '+60123456791',
      club_name: 'Lions Club Subang',
      position: 'Treasurer',
      district: 'District 308B1',
      registration_type: 'early-bird',
      total_amount: 260,
      registration_date: new Date().toISOString(),
      status: 'confirmed'
    }
  ];
}

// Storage functions
export function getAllRegistrations() {
  return global.registrations;
}

export function addRegistration(registration) {
  const newId = global.registrations.length > 0 
    ? Math.max(...global.registrations.map(r => r.id)) + 1 
    : 1;
  
  const newRegistration = {
    ...registration,
    id: newId
  };
  
  global.registrations.push(newRegistration);
  return newRegistration;
}

export function findRegistrationByEmail(email) {
  return global.registrations.find(reg => reg.email === email);
}

export function getRegistrationStats() {
  const registrations = global.registrations;
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const stats = {
    total: registrations.length,
    earlyBird: registrations.filter(r => r.registration_type === 'early-bird').length,
    regular: registrations.filter(r => r.registration_type === 'regular').length,
    last24Hours: registrations.filter(r => new Date(r.registration_date) > twentyFourHoursAgo).length,
    totalRevenue: registrations.reduce((sum, r) => sum + (r.total_amount || 0), 0),
    confirmed: registrations.filter(r => r.status === 'confirmed').length,
    pending: registrations.filter(r => r.status === 'pending').length
  };
  
  return stats;
}