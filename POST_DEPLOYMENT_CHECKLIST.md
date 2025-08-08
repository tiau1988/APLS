# Post-Deployment Checklist

Congratulations on deploying your APLLS 2026 website! Use this checklist to verify everything is working correctly.

## Quick Verification Steps

### 1. Basic Website Check
- [ ] Visit your Vercel URL (e.g., `https://aplls-2026-website.vercel.app`)
- [ ] Confirm the homepage loads with all images and styling
- [ ] Test navigation links to ensure they work

### 2. Registration Form Test
- [ ] Fill out a test registration form
- [ ] Upload a test payment slip
- [ ] Submit the form and verify you get a success message

### 3. Database Check
- [ ] Log in to your Supabase dashboard
- [ ] Go to Table Editor → registrations
- [ ] Verify your test registration appears in the table

### 4. File Storage Check
- [ ] In Supabase dashboard, go to Storage → payment-slips
- [ ] Verify your uploaded payment slip appears

### 5. Admin Panel Check
- [ ] Visit `/admin.html` on your deployed site
- [ ] Verify your test registration appears in the admin panel
- [ ] Check that statistics are displayed correctly

## Common Issues and Quick Fixes

### If the website doesn't load:
- Check your Vercel deployment logs for errors
- Verify that the deployment completed successfully

### If registration form submission fails:
- Check browser console for JavaScript errors
- Verify Supabase environment variables in Vercel

### If file uploads don't work:
- Verify the storage bucket is named exactly `payment-slips`
- Check bucket permissions (should be public)
- Ensure file size is under 5MB

### If admin panel doesn't show data:
- Check browser console for API errors
- Verify Supabase connection in the logs

## Next Steps

After verifying your deployment works:

1. Share the URL with your team for additional testing
2. Consider setting up a custom domain
3. Plan for regular backups of your registration data
4. Consider adding analytics to track visitor behavior

---

If you encounter any issues that you can't resolve, check the Vercel and Supabase logs for specific error messages.