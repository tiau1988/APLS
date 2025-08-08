// Shared storage module for registration system
// Uses Supabase for persistent data storage across serverless function calls

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Fallback to in-memory if Supabase not configured
let useInMemory = !supabaseUrl || !supabaseKey;
let supabase = null;

if (!useInMemory) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    useInMemory = true;
  }
}

// Fallback in-memory storage
global.registrations = global.registrations || [];

// Initialize with sample data if empty and using in-memory
if (useInMemory && global.registrations.length === 0) {
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
export async function getAllRegistrations() {
  if (useInMemory) {
    return global.registrations;
  }
  
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching registrations:', error);
      return global.registrations; // Fallback to in-memory
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch registrations:', error);
    return global.registrations; // Fallback to in-memory
  }
}

export async function addRegistration(registration) {
  if (useInMemory) {
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
  
  try {
    const { data, error } = await supabase
      .from('registrations')
      .insert([registration])
      .select()
      .single();
      
    if (error) {
      console.error('Error adding registration:', error);
      // Fallback to in-memory
      return addRegistration(registration);
    }
    
    return data;
  } catch (error) {
    console.error('Failed to add registration:', error);
    // Fallback to in-memory
    const newReg = {
      ...registration,
      id: global.registrations.length + 1
    };
    global.registrations.push(newReg);
    return newReg;
  }
}

export async function findRegistrationByEmail(email) {
  if (useInMemory) {
    return global.registrations.find(reg => reg.email === email);
  }
  
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('email', email)
      .maybeSingle();
      
    if (error) {
      console.error('Error finding registration by email:', error);
      // Fallback to in-memory
      return global.registrations.find(reg => reg.email === email);
    }
    
    return data;
  } catch (error) {
    console.error('Failed to find registration by email:', error);
    // Fallback to in-memory
    return global.registrations.find(reg => reg.email === email);
  }
}

export async function getRegistrationStats() {
  try {
    let registrations;
    
    if (useInMemory) {
      registrations = global.registrations;
    } else {
      const { data, error } = await supabase
        .from('registrations')
        .select('*');
        
      if (error) {
        console.error('Error fetching registrations for stats:', error);
        registrations = global.registrations; // Fallback to in-memory
      } else {
        registrations = data;
      }
    }
    
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const stats = {
      total: registrations.length,
      earlyBird: registrations.filter(r => r.registration_type === 'early-bird').length,
      regular: registrations.filter(r => r.registration_type === 'regular').length,
      last24Hours: registrations.filter(r => {
        const regDate = new Date(r.registration_date || r.created_at);
        return regDate > twentyFourHoursAgo;
      }).length,
      totalRevenue: registrations.reduce((sum, r) => sum + (r.total_amount || 0), 0),
      confirmed: registrations.filter(r => r.status === 'confirmed').length,
      pending: registrations.filter(r => r.status === 'pending').length
    };
    
    return stats;
  } catch (error) {
    console.error('Failed to get registration stats:', error);
    
    // Fallback stats from in-memory
    const registrations = global.registrations;
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return {
      total: registrations.length,
      earlyBird: registrations.filter(r => r.registration_type === 'early-bird').length,
      regular: registrations.filter(r => r.registration_type === 'regular').length,
      last24Hours: registrations.filter(r => new Date(r.registration_date) > twentyFourHoursAgo).length,
      totalRevenue: registrations.reduce((sum, r) => sum + (r.total_amount || 0), 0),
      confirmed: registrations.filter(r => r.status === 'confirmed').length,
      pending: registrations.filter(r => r.status === 'pending').length
    };
  }
}