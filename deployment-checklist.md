# APLLS 2026 Website Deployment Checklist

## 1. Supabase Setup

- [ ] Create a Supabase account at [supabase.com](https://supabase.com/)
- [ ] Create a new project:
  - Name: `aplls-2026`
  - Database Password: (create a strong password)
  - Region: Choose closest to Malaysia (e.g., Singapore)
- [ ] Create the `registrations` table:
  - Option 1: Use the SQL Editor and run the `supabase-init.sql` script
  - Option 2: Create manually using the Table Editor following the schema in SUPABASE_SETUP.md
- [ ] Set up Storage:
  - Create a new bucket named `payment-slips`
  - Set the bucket to Public (for easier access)
- [ ] Get API Keys:
  - Go to Project Settings → API
  - Copy the URL and anon/public key for the next steps

## 2. GitHub Repository Setup

- [ ] Create a GitHub account if you don't have one
- [ ] Install Git and GitHub Desktop
- [ ] Create a new repository:
  - Name: `aplls-2026-website`
  - Description: `Asia Pacific Lions Leaders Summit 2026 - Official Event Registration Website`
  - Visibility: Public
- [ ] Push your code to GitHub:
  - Initialize Git in your project folder
  - Commit all files
  - Push to your GitHub repository

## 3. Vercel Deployment

- [ ] Create a Vercel account at [vercel.com](https://vercel.com/) (can sign up with GitHub)
- [ ] Import your GitHub repository:
  - Click "Add New..." → "Project"
  - Select your `aplls-2026-website` repository
- [ ] Configure project:
  - Framework Preset: Other
  - Root Directory: `./` (default)
  - Build Command: Leave empty (or use `npm run build`)
  - Output Directory: Leave empty
- [ ] Add Environment Variables:
  - SUPABASE_URL: (your Supabase URL)
  - SUPABASE_KEY: (your Supabase anon key)
- [ ] Deploy

## 4. Post-Deployment Verification

- [ ] Test the live website:
  - Navigation and UI
  - Registration form
  - File upload functionality
  - Admin panel access
- [ ] Check Supabase for data storage:
  - Verify registrations are being saved
  - Verify files are being uploaded to storage
- [ ] Set up custom domain (optional):
  - Add domain in Vercel settings
  - Configure DNS settings with your domain provider

## 5. Ongoing Maintenance

- [ ] Set up monitoring
- [ ] Configure analytics
- [ ] Plan for regular updates
- [ ] Create backup strategy for database

---

## Important URLs

- Supabase Dashboard: https://app.supabase.com/
- GitHub Repository: https://github.com/YOUR-USERNAME/aplls-2026-website
- Vercel Dashboard: https://vercel.com/dashboard
- Live Website: https://aplls-2026-website.vercel.app (will be provided after deployment)