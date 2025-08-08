# 🚀 Supabase Setup Guide for APLLS 2026

## Overview
Your registration system is now configured to use **Supabase** - a powerful open-source Firebase alternative with PostgreSQL database that will store all your registrations online.

## 🔑 Why Supabase?
- **Persistent Storage**: All registrations are stored in the cloud
- **File Storage**: Supports file uploads (payment slips, etc.)
- **Real-time Updates**: Admin panel can receive real-time updates
- **Free Tier**: Generous free tier for your project

## 🚀 Quick Setup Steps

### 1. Create a Supabase Account
1. Go to [Supabase.com](https://supabase.com/)
2. Sign up for a free account (can use GitHub)
3. Create a new project
   - Name: `aplls-2026`
   - Database Password: Create a strong password
   - Region: Choose closest to Malaysia (e.g., Singapore)

### 2. Create Database Table
1. Go to the **Table Editor** in your Supabase dashboard
2. Click **Create a new table**
3. Name: `registrations`
4. Add the following columns:

| Name | Type | Default | Primary | Extra |
|------|------|---------|---------|-------|
| id | int8 | auto | ✅ | |
| registration_id | text | | | |
| first_name | text | | | |
| last_name | text | | | |
| email | text | | | |
| phone | text | | | |
| club_name | text | | | |
| position | text | | | |
| gender | text | | | |
| address | text | | | |
| district | text | | | |
| other_district | text | | | |
| ppoas_position | text | | | |
| district_cabinet_position | text | | | |
| club_position | text | | | |
| position_in_ngo | text | | | |
| other_ngos | text | | | |
| registration_type | text | | | |
| registration_fee | int4 | 0 | | |
| optional_fee | int4 | 0 | | |
| total_amount | int4 | 0 | | |
| vegetarian | text | | | |
| poolside_party | text | | | |
| community_service | text | | | |
| installation_banquet | text | | | |
| terms_conditions | bool | false | | |
| marketing_emails | bool | false | | |
| privacy_policy | bool | false | | |
| payment_slip_url | text | | | |
| status | text | 'pending' | | |
| created_at | timestamptz | now() | | |
| updated_at | timestamptz | now() | | |

### 3. Set Up Storage for Files
1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket named `payment-slips`
3. Set the bucket to **Public** (or Private if you prefer)

### 4. Get API Keys
1. Go to **Project Settings** → **API**
2. Copy the **URL** and **anon/public** key

### 5. Configure Vercel Environment Variables
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `aplls-2026-website` project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - **Name**: `SUPABASE_URL`
   - **Value**: Your Supabase URL (from step 4)
   - **Environment**: All (Production, Preview, Development)
   - **Name**: `SUPABASE_KEY`
   - **Value**: Your Supabase anon key (from step 4)
   - **Environment**: All (Production, Preview, Development)

### 6. Deploy Your Changes
1. Commit and push your code changes to GitHub
2. Vercel will automatically deploy the updated code

## 📊 Testing Your Setup

After deployment:

1. Visit your website and submit a test registration
2. Check the admin panel to see if the registration appears
3. Verify in Supabase dashboard that the data is stored in the database

## 🔍 Troubleshooting

### Common Issues:

1. **"Error connecting to database"**
   - Check if `SUPABASE_URL` and `SUPABASE_KEY` are set correctly in Vercel
   - Verify the Supabase project is active

2. **"Registration not appearing in admin"**
   - Check Vercel function logs for errors
   - Verify the database table structure matches the expected fields

3. **"File upload not working"**
   - Ensure the storage bucket is properly configured
   - Check permissions on the bucket

## 📱 Viewing Your Data

You can view all registrations in three ways:

1. **Admin Panel**: `https://aplls-2026-website.vercel.app/admin`
2. **Supabase Dashboard**: Log in to Supabase and go to Table Editor
3. **API Endpoint**: `https://aplls-2026-website.vercel.app/api/admin/registrations`

## 🎯 Next Steps

1. **Add Authentication**: Protect your admin panel with a password
2. **Set Up Email Notifications**: Get notified of new registrations
3. **Customize Admin Panel**: Add more features to the dashboard

---

🎉 **Your registration system is now fully online with persistent storage!**