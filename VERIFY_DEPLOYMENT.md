# Deployment Verification Guide

After deploying your APLLS 2026 website to Vercel, follow this guide to verify that everything is working correctly.

## 1. Basic Website Functionality

- [ ] **Homepage Loads**: Visit your Vercel URL (e.g., `https://aplls-2026-website.vercel.app`)
- [ ] **Navigation Works**: Test all navigation links
- [ ] **Countdown Timer**: Verify the countdown timer is working
- [ ] **Images Load**: Check that all images are displaying correctly
- [ ] **Mobile Responsiveness**: Test on mobile devices or using browser dev tools

## 2. Registration Form Testing

- [ ] **Form Loads**: Navigate to the registration section
- [ ] **Required Fields**: Try submitting without filling required fields to verify validation
- [ ] **Fee Calculation**: Test different registration types and optional items to verify fee calculation
- [ ] **File Upload**: Test uploading a payment slip (both image and PDF)
- [ ] **Form Submission**: Complete and submit a test registration

## 3. Database Verification

- [ ] **Supabase Dashboard**: Log in to your Supabase dashboard
- [ ] **Table Data**: Go to Table Editor → registrations → verify your test registration appears
- [ ] **Storage**: Go to Storage → payment-slips → verify your uploaded file appears

## 4. Admin Panel Testing

- [ ] **Admin Access**: Visit `/admin.html` on your deployed site
- [ ] **Registration Data**: Verify that registrations are displayed
- [ ] **Statistics**: Check that the statistics at the top are accurate
- [ ] **Payment Slip Links**: Test clicking on a payment slip link to verify it opens
- [ ] **Export Function**: Test the CSV export functionality

## 5. API Endpoint Testing

- [ ] **Registration API**: Test `/api/register` with a GET request (should return status info)
- [ ] **Admin API**: Test `/api/admin/registrations` (should return registration data)
- [ ] **Health Check**: Test `/api/health` (should return status info)

## 6. Error Handling

- [ ] **Duplicate Email**: Try submitting a registration with an email that already exists
- [ ] **Invalid File Type**: Try uploading an unsupported file type
- [ ] **Large File**: Try uploading a file larger than 5MB

## 7. Performance Check

- [ ] **Load Time**: Verify the website loads quickly
- [ ] **Lighthouse Score**: Run a Lighthouse test in Chrome DevTools
- [ ] **Mobile Performance**: Check performance on mobile devices

## Common Issues and Solutions

### Database Connection Issues
- Verify environment variables are set correctly in Vercel
- Check Supabase project is active
- Review Vercel function logs for specific errors

### File Upload Problems
- Verify storage bucket permissions in Supabase
- Check CORS settings in Vercel.json
- Ensure file size limits are respected

### Form Submission Errors
- Check browser console for JavaScript errors
- Verify API routes are correctly configured
- Test with different browsers

## Next Steps After Verification

1. **Share the URL** with stakeholders for additional testing
2. **Set up monitoring** to track website performance
3. **Configure analytics** to track visitor behavior
4. **Create documentation** for future maintenance
5. **Set up a backup strategy** for your database

---

If you encounter any issues during verification, check the Vercel deployment logs and Supabase logs for specific error messages.