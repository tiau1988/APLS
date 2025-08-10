# 🚨 URGENT FIX: Add Supabase to Vercel

## Problem Identified ✅
Your website is deployed but **missing Supabase environment variables**. This causes:
- Registrations to use mock/memory storage instead of Supabase
- No data persistence 
- Admin panel shows no real registrations
- Payment slips not stored

## Quick Fix (5 minutes)

### Step 1: Get Your Supabase Credentials
1. Go to [supabase.com](https://supabase.com) and login
2. Open your APLLS project (or create one if needed)
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon/public key** (starts with `eyJ`)

### Step 2: Add Environment Variables to Vercel
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Open your `aplls-2026-website` project
3. Go to **Settings** → **Environment Variables**
4. Add these two variables:

**Variable 1:**
- Name: `SUPABASE_URL`
- Value: `https://your-project-id.supabase.co`
- Environment: All (Production, Preview, Development)

**Variable 2:**
- Name: `SUPABASE_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your anon key)
- Environment: All (Production, Preview, Development)

### Step 3: Redeploy
1. In Vercel dashboard, go to **Deployments**
2. Click **"Redeploy"** on the latest deployment
3. Wait 1-2 minutes for redeployment

### Step 4: Set Up Supabase Database
Run this SQL in your Supabase SQL Editor:

```sql
-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    lions_club TEXT,
    district TEXT,
    multiple_district TEXT,
    position TEXT,
    registration_type TEXT DEFAULT 'regular',
    dietary_requirements TEXT,
    special_needs TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    payment_method TEXT,
    payment_slip_url TEXT,
    status TEXT DEFAULT 'pending',
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'MYR'
);

-- Enable Row Level Security
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (adjust as needed)
CREATE POLICY "Allow public read access" ON registrations
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON registrations
    FOR INSERT WITH CHECK (true);
```

### Step 5: Create Storage Bucket
1. In Supabase dashboard, go to **Storage**
2. Create a new bucket named `payment-slips`
3. Make it **public** for file access

## ✅ Test After Fix
1. Visit your website: https://aplls-2026-website.vercel.app/
2. Submit a test registration
3. Check admin panel: https://aplls-2026-website.vercel.app/admin.html
4. Verify data appears in Supabase dashboard

## 🔍 Verify Environment Variables
Run this command to confirm variables are set:
```bash
vercel env ls
```

You should see `SUPABASE_URL` and `SUPABASE_KEY` in the list.