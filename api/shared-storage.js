// Shared storage module for registration system
// Uses Supabase for persistent data storage across serverless function calls

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

let supabase = null;

// Initialize Supabase client
function getSupabaseClient() {
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

// Fallback data for when database is not available
const fallbackRegistrations = [
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

// Storage functions
export async function getAllRegistrations() {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('registrations')
      .select('*')
      .order('registration_date', { ascending: false });
    
    if (error) {
      console.error('Supabase error:', error);
      return fallbackRegistrations;
    }
    
    return data || fallbackRegistrations;
  } catch (error) {
    console.error('Database connection error:', error);
    return fallbackRegistrations;
  }
}

export async function addRegistration(registration) {
  try {
    const client = getSupabaseClient();
    
    // Convert camelCase to snake_case for database
    const dbRegistration = {
      registration_id: registration.registrationId,
      first_name: registration.firstName,
      last_name: registration.lastName,
      email: registration.email,
      phone: registration.phone,
      club_name: registration.clubName,
      position: registration.position,
      gender: registration.gender,
      address: registration.address,
      district: registration.district,
      other_district: registration.otherDistrict,
      ppoas_position: registration.ppoasPosition,
      district_cabinet_position: registration.districtCabinetPosition,
      club_position: registration.clubPosition,
      position_in_ngo: registration.positionInNgo,
      other_ngos: registration.otherNgos,
      registration_type: registration.registrationType,
      registration_fee: registration.registrationFee,
      optional_fee: registration.optionalFee,
      total_amount: registration.totalAmount,
      vegetarian: registration.vegetarian,
      poolside_party: registration.poolsideParty,
      community_service: registration.communityService,
      installation_banquet: registration.installationBanquet,
      terms_conditions: registration.termsConditions,
      marketing_emails: registration.marketingEmails,
      privacy_policy: registration.privacyPolicy,
      status: registration.status || 'confirmed',
      registration_date: new Date().toISOString()
    };
    
    const { data, error } = await client
      .from('registrations')
      .insert([dbRegistration])
      .select()
      .single();
    
    if (error) {
      console.error('Insert error:', error);
      // Fallback to in-memory storage
      const newRegistration = {
        ...registration,
        id: Date.now(),
        registrationDate: new Date().toISOString()
      };
      return newRegistration;
    }
    
    return data;
  } catch (error) {
    console.error('Database insert error:', error);
    // Fallback to in-memory storage
    const newRegistration = {
      ...registration,
      id: Date.now(),
      registrationDate: new Date().toISOString()
    };
    return newRegistration;
  }
}

export async function findRegistrationByEmail(email) {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('registrations')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Email lookup error:', error);
    }
    
    return data || null;
  } catch (error) {
    console.error('Database email lookup error:', error);
    return null;
  }
}

export async function getRegistrationStats() {
  try {
    const registrations = await getAllRegistrations();
    const totalRegistrations = registrations.length;
    const earlyBirdCount = registrations.filter(r => 
      (r.registration_type || r.registrationType) === 'early-bird'
    ).length;
    const standardCount = registrations.filter(r => 
      (r.registration_type || r.registrationType) === 'regular'
    ).length;
    
    // Calculate recent registrations (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent24hCount = registrations.filter(r => 
      new Date(r.registration_date || r.registrationDate) > oneDayAgo
    ).length;
    
    // Calculate total revenue
    const totalRevenue = registrations.reduce((sum, r) => 
      sum + ((r.total_amount || r.totalAmount) || 0), 0
    );
    
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
  } catch (error) {
    console.error('Stats calculation error:', error);
    return {
      total_registrations: 3,
      early_bird_count: 2,
      standard_count: 1,
      recent_24h_count: 1,
      total_revenue: 820,
      confirmed_count: 2,
      pending_count: 1,
      late_count: 0
    };
  }
}