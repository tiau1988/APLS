# Quick Vercel Deployment Guide

This guide provides the fastest way to deploy your APLLS 2026 website to Vercel with Supabase integration.

## Prerequisites
- GitHub account
- Vercel account (can sign up with GitHub)
- Supabase account

## Step 1: Set Up Supabase (5 minutes)

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com/) and sign up/login
   - Click "New Project"
   - Name: `aplls-2026`
   - Create a strong database password
   - Select region closest to Malaysia
   - Click "Create new project"

2. **Run Database Setup Script**:
   - In Supabase dashboard, go to "SQL Editor"
   - Click "New Query"
   - Copy and paste the entire contents of `supabase-init.sql` from your project
   - Click "Run" to create the database table and indexes

3. **Create Storage Bucket**:
   - Go to "Storage" in the Supabase dashboard
   - Click "Create new bucket"
   - Name: `payment-slips`
   - Set to "Public" bucket
   - Click "Create bucket"

4. **Get API Keys**:
   - Go to "Project Settings" → "API"
   - Copy the "URL" and "anon/public" key
   - Save these for Step 3

## Step 2: Push to GitHub (2 minutes)

1. **Create Repository**:
   - Go to [github.com](https://github.com) and sign up/login
   - Click "New repository"
   - Name: `aplls-2026-website`
   - Description: `Asia Pacific Lions Leaders Summit 2026 Website`
   - Set to "Public"
   - Click "Create repository"

2. **Push Your Code**:
   ```bash
   # In your project directory
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/aplls-2026-website.git
   git push -u origin main
   ```

## Step 3: Deploy to Vercel (3 minutes)

1. **Import Project**:
   - Go to [vercel.com](https://vercel.com) and sign up/login
   - Click "Add New..." → "Project"
   - Connect to GitHub if prompted
   - Select your `aplls-2026-website` repository
   - Click "Import"

2. **Configure Project**:
   - Framework Preset: Other
   - Root Directory: `./` (default)
   - Build Command: Leave empty
   - Output Directory: Leave empty
   - Install Command: `npm install`

3. **Add Environment Variables**:
   - Click "Environment Variables" section
   - Add the following:
     - Name: `SUPABASE_URL` | Value: (your Supabase URL from Step 1)
     - Name: `SUPABASE_KEY` | Value: (your Supabase anon key from Step 1)
   - Click "Add" for each variable

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete (usually 1-2 minutes)

## Step 4: Verify Deployment

1. **Test Website**:
   - Click on the deployment URL provided by Vercel
   - Test the registration form and file upload
   - Verify data is being saved to Supabase

2. **Check Admin Panel**:
   - Go to `/admin.html` on your deployed site
   - Verify you can see registrations

## Congratulations!

Your APLLS 2026 website is now live and fully functional with:
- Global CDN distribution
- Automatic HTTPS
- Serverless API endpoints
- Persistent database storage
- File upload capabilities

## Next Steps

- Set up a custom domain in Vercel dashboard
- Configure analytics
- Set up monitoring
- Plan for regular updates

---

Need help? Refer to the full documentation in `DEPLOYMENT.md` and `SUPABASE_SETUP.md`