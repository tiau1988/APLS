# 🚀 Deploy APLLS 2026 Website to Vercel with Supabase

Your project is already configured for Supabase! Follow these steps to deploy:

## Step 1: Create Supabase Project (5 minutes)

1. **Go to Supabase**: Visit [supabase.com](https://supabase.com/) and sign up/login
2. **Create New Project**:
   - Click "New Project"
   - Name: `aplls-2026`
   - Create a strong database password (save this!)
   - Select region closest to Malaysia (Singapore recommended)
   - Click "Create new project"

3. **Set up Database**:
   - Wait for project to finish setting up (2-3 minutes)
   - Go to "SQL Editor" in sidebar
   - Click "New Query"
   - Copy and paste the entire contents from `supabase-init.sql` file
   - Click "Run" to create tables and sample data

4. **Create Storage Bucket**:
   - Go to "Storage" in sidebar
   - Click "Create new bucket"
   - Name: `payment-slips`
   - Set to "Public" bucket
   - Click "Create bucket"

5. **Get API Keys**:
   - Go to "Project Settings" → "API"
   - Copy the "URL" and "anon/public" key
   - Save these for Step 3

## Step 2: Deploy to Vercel (3 minutes)

1. **Go to Vercel**: Visit [vercel.com](https://vercel.com/) and sign up/login
2. **Import Project**:
   - Click "Add New..." → "Project"
   - Connect to GitHub if needed
   - Select your `aplls-2026-website` repository
   - Click "Import"

3. **Configure Project**:
   - Framework Preset: Other
   - Root Directory: `./` (default)
   - Build Command: Leave empty
   - Output Directory: Leave empty
   - Install Command: `npm install`

## Step 3: Add Environment Variables

In Vercel project settings, add these environment variables:

- **Name**: `SUPABASE_URL`
- **Value**: Your Supabase URL from Step 1
- **Environment**: All (Production, Preview, Development)

- **Name**: `SUPABASE_KEY`  
- **Value**: Your Supabase anon key from Step 1
- **Environment**: All (Production, Preview, Development)

## Step 4: Deploy

1. Click "Deploy" in Vercel
2. Wait for deployment (1-2 minutes)
3. Your site will be live at: `https://your-project-name.vercel.app`

## Step 5: Test Your Deployment

1. **Visit your site** and test the registration form
2. **Upload a test payment slip**
3. **Check Supabase dashboard** to see the registration data
4. **Visit `/admin.html`** to see the admin panel

## 🎉 You're Done!

Your APLLS 2026 website is now live with:
- ✅ Global CDN distribution
- ✅ Automatic HTTPS
- ✅ Serverless API endpoints
- ✅ Persistent Supabase database
- ✅ File upload with Supabase Storage
- ✅ Real-time admin panel

## Next Steps

- Set up custom domain in Vercel
- Configure email notifications
- Add authentication to admin panel
- Monitor usage and performance

---

Need help? Check the logs in Vercel dashboard or Supabase dashboard for any errors.