// Shared storage module for registration system
// Uses file-based storage to persist data between serverless function calls
// In production, this would be replaced with a real database connection

import fs from 'fs';
import path from 'path';

// File path for storing registrations
const DATA_FILE = '/tmp/registrations.json';

// Default sample data
const defaultRegistrations = [
  {
    id: 1,
    registrationId: 'APLLS-1703123456789-ABC123DEF',
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
    registrationId: 'APLLS-1703123456790-DEF456GHI',
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
    registrationId: 'APLLS-1703123456791-GHI789JKL',
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

// Load registrations from file
function loadRegistrations() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    } else {
      // Initialize with default data
      saveRegistrations(defaultRegistrations);
      return defaultRegistrations;
    }
  } catch (error) {
    console.error('Error loading registrations:', error);
    return defaultRegistrations;
  }
}

// Save registrations to file
function saveRegistrations(registrations) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(registrations, null, 2));
  } catch (error) {
    console.error('Error saving registrations:', error);
  }
}

// Storage functions
export function getAllRegistrations() {
  return loadRegistrations();
}

export function addRegistration(registration) {
  const registrations = loadRegistrations();
  const newId = Math.max(...registrations.map(r => r.id), 0) + 1;
  const newRegistration = {
    ...registration,
    id: newId,
    registrationDate: new Date().toISOString()
  };
  registrations.push(newRegistration);
  saveRegistrations(registrations);
  return newRegistration;
}

export function findRegistrationByEmail(email) {
  const registrations = loadRegistrations();
  return registrations.find(r => r.email.toLowerCase() === email.toLowerCase());
}

export function getRegistrationStats() {
  const registrations = loadRegistrations();
  const totalRegistrations = registrations.length;
  const earlyBirdCount = registrations.filter(r => r.registrationType === 'early-bird').length;
  const standardCount = registrations.filter(r => r.registrationType === 'regular').length;
  
  // Calculate recent registrations (last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent24hCount = registrations.filter(r => 
    new Date(r.registrationDate) > oneDayAgo
  ).length;
  
  // Calculate total revenue
  const totalRevenue = registrations.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  
  return {
    total_registrations: totalRegistrations,
    early_bird_count: earlyBirdCount,
    standard_count: standardCount,
    recent_24h_count: recent24hCount,
    total_revenue: totalRevenue,
    confirmed_count: registrations.filter(r => r.status === 'confirmed').length,
    pending_count: registrations.filter(r => r.status === 'pending').length,
    late_count: 0
  };
}