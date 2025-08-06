// Shared in-memory storage for registrations
// This simulates a database and allows data sharing between endpoints

// Global storage (persists during the serverless function lifecycle)
global.registrations = global.registrations || [
  {
    id: 1,
    registrationId: 'REG-1703123456789-abc123def',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+60123456789',
    clubName: 'Lions Club KL',
    position: 'President',
    district: 'District 308B1',
    registrationType: 'early-bird',
    totalAmount: 260,
    registrationDate: new Date('2024-01-15T10:30:00Z').toISOString(),
    status: 'confirmed'
  },
  {
    id: 2,
    registrationId: 'REG-1703123456790-def456ghi',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+60123456790',
    clubName: 'Lions Club PJ',
    position: 'Secretary',
    district: 'District 308B2',
    registrationType: 'regular',
    totalAmount: 300,
    registrationDate: new Date('2024-01-16T14:20:00Z').toISOString(),
    status: 'pending'
  },
  {
    id: 3,
    registrationId: 'REG-1703123456791-ghi789jkl',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@example.com',
    phone: '+60123456791',
    clubName: 'Lions Club Subang',
    position: 'Treasurer',
    district: 'District 308B1',
    registrationType: 'early-bird',
    totalAmount: 260,
    registrationDate: new Date().toISOString(),
    status: 'confirmed'
  }
];

// Storage functions
export function getAllRegistrations() {
  return global.registrations;
}

export function addRegistration(registration) {
  const newId = Math.max(...global.registrations.map(r => r.id), 0) + 1;
  const newRegistration = {
    ...registration,
    id: newId,
    registrationDate: new Date().toISOString()
  };
  global.registrations.push(newRegistration);
  return newRegistration;
}

export function findRegistrationByEmail(email) {
  return global.registrations.find(r => r.email.toLowerCase() === email.toLowerCase());
}

export function getRegistrationStats() {
  const registrations = global.registrations;
  const totalRegistrations = registrations.length;
  const earlyBirdCount = registrations.filter(r => r.registrationType === 'early-bird').length;
  
  // Recent 24h count
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const recent24hCount = registrations.filter(r => new Date(r.registrationDate) > yesterday).length;
  
  const confirmedCount = registrations.filter(r => r.status === 'confirmed').length;
  const pendingCount = registrations.filter(r => r.status === 'pending').length;
  const totalRevenue = registrations.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const standardCount = registrations.filter(r => r.registrationType === 'regular').length;

  return {
    total_registrations: totalRegistrations,
    early_bird_count: earlyBirdCount,
    recent_24h_count: recent24hCount,
    confirmed_count: confirmedCount,
    pending_count: pendingCount,
    total_revenue: totalRevenue,
    standard_count: standardCount,
    late_count: 0
  };
}