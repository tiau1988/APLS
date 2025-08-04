# 🚀 Deployment Guide for APLLS 2026 Website

This guide will help you deploy the APLLS 2026 website to Vercel using Git Desktop.

## 📋 Prerequisites

Before you start, make sure you have:
- [Git Desktop](https://desktop.github.com/) installed
- [GitHub account](https://github.com/) created
- [Vercel account](https://vercel.com/) created (you can sign up with GitHub)

## 🔧 Step 1: Prepare Your Local Repository

1. **Open Git Desktop**
2. **Create a new repository:**
   - Click "Create a New Repository on your hard drive"
   - Name: `aplls-2026`
   - Description: `Asia Pacific Lions Leaders Summit 2026 Website`
   - Local Path: Choose your APLLS folder location
   - Initialize with README: ✅ (checked)
   - Git ignore: None (we already have .gitignore)
   - License: MIT

3. **Add your files:**
   - Copy all your APLLS files to the repository folder
   - Git Desktop should automatically detect the changes

## 📤 Step 2: Push to GitHub

1. **In Git Desktop:**
   - Review the changes in the "Changes" tab
   - Add a commit message: "Initial commit: APLLS 2026 website"
   - Click "Commit to main"

2. **Publish to GitHub:**
   - Click "Publish repository"
   - Repository name: `aplls-2026`
   - Description: `Asia Pacific Lions Leaders Summit 2026 - Official Event Registration Website`
   - Keep code private: ❌ (unchecked for public access)
   - Click "Publish Repository"

## 🌐 Step 3: Deploy to Vercel

### Option A: Automatic Deployment (Recommended)

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import Git Repository:**
   - Select your GitHub account
   - Find and select `aplls-2026` repository
   - Click "Import"

4. **Configure Project:**
   - Project Name: `aplls-2026`
   - Framework Preset: Other
   - Root Directory: `./` (default)
   - Build Command: Leave empty
   - Output Directory: Leave empty
   - Install Command: Leave empty

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete (usually 1-2 minutes)

### Option B: Manual Deployment

1. **Install Vercel CLI** (if you prefer command line):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

## ✅ Step 4: Verify Deployment

1. **Check your live website:**
   - Vercel will provide a URL like: `https://aplls-2026.vercel.app`
   - Test all functionality:
     - Navigation links
     - Countdown timer
     - Registration form
     - Schedule tabs
     - Contact form

2. **Test on different devices:**
   - Desktop
   - Tablet
   - Mobile phone

## 🔄 Step 5: Future Updates

### Making Changes:

1. **Edit your local files**
2. **In Git Desktop:**
   - Review changes
   - Add commit message describing changes
   - Click "Commit to main"
   - Click "Push origin"

3. **Automatic Deployment:**
   - Vercel will automatically deploy your changes
   - Usually takes 1-2 minutes

## 🛠️ Troubleshooting

### Common Issues:

1. **Images not loading:**
   - Check file paths in HTML
   - Ensure images are in the `assets/` folder
   - Verify image file names match exactly (case-sensitive)

2. **CSS/JS not loading:**
   - Check file references in `index.html`
   - Ensure `styles.css` and `script.js` are in root directory

3. **Form not working:**
   - Forms will work for display but won't submit data without backend
   - Consider adding form handling service like Formspree or Netlify Forms

### Getting Help:

- **Vercel Documentation:** https://vercel.com/docs
- **GitHub Desktop Help:** https://docs.github.com/en/desktop
- **Contact Support:** aplls2026@gmail.com

## 🎯 Custom Domain (Optional)

To use a custom domain like `aplls2026.com`:

1. **In Vercel Dashboard:**
   - Go to your project
   - Click "Settings" → "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update DNS records** with your domain provider

## 📊 Analytics (Optional)

To track website visitors:

1. **Google Analytics:**
   - Create Google Analytics account
   - Add tracking code to `index.html`

2. **Vercel Analytics:**
   - Enable in Vercel dashboard
   - Built-in analytics for your site

## 🔒 Security Features

Your website includes:
- ✅ Security headers (configured in `vercel.json`)
- ✅ HTTPS encryption (automatic with Vercel)
- ✅ XSS protection
- ✅ Content type validation

## 📈 Performance Optimization

Included optimizations:
- ✅ Image optimization
- ✅ CSS/JS caching
- ✅ Gzip compression
- ✅ CDN distribution

---

## 🎉 Congratulations!

Your APLLS 2026 website is now live and accessible worldwide! 

**Next Steps:**
1. Share the URL with your team
2. Test all functionality thoroughly
3. Set up monitoring and analytics
4. Plan for ongoing updates and maintenance

**Live URL:** `https://your-project-name.vercel.app`

---

*Need help? Contact the development team or refer to the documentation links above.*