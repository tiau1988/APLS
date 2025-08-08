# Setting Up Supabase Storage Bucket and API Keys

This guide will walk you through the process of setting up a storage bucket for payment slips in Supabase and retrieving your API keys for deployment.

## Setting Up the Storage Bucket

1. **Log in to your Supabase Dashboard**
   - Go to [https://app.supabase.com/](https://app.supabase.com/)
   - Sign in with your account credentials

2. **Navigate to Storage**
   - In the left sidebar, click on **Storage**
   - You'll see the Storage Browser interface

3. **Create a New Bucket**
   - Click the **New Bucket** button
   - Enter the name: `payment-slips` (this exact name is required by the application)
   - Set the bucket visibility:
     - **Public**: Files will be accessible without authentication (easier setup)
     - **Private**: Files will require authentication to access (more secure)
   - For the APLLS website, we recommend setting it to **Public** for simplicity

4. **Configure Bucket Policies**
   - After creating the bucket, click on the **Policies** tab
   - For a public bucket, you should see a policy that allows public access
   - If you chose private, you'll need to set up Row Level Security (RLS) policies

5. **Test the Bucket**
   - Click on the bucket name to enter it
   - Try uploading a test file by clicking **Upload File**
   - If successful, you'll see the file in the bucket

## Getting Your API Keys

1. **Navigate to Project Settings**
   - In the left sidebar, click on the gear icon (⚙️) or **Project Settings**
   - Select **API** from the submenu

2. **Find Your API Keys**
   - You'll see a section titled **Project API Keys**
   - There are two important values here:
     - **Project URL**: This is your `SUPABASE_URL`
     - **anon/public** key: This is your `SUPABASE_KEY`

3. **Copy These Values**
   - Click the **Copy** button next to each value
   - Store these values securely - you'll need them for the next step

## Using Your API Keys with Vercel

1. **Go to Vercel Dashboard**
   - Navigate to [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project

2. **Add Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Add the following variables:
     - Name: `SUPABASE_URL` | Value: Your Project URL
     - Name: `SUPABASE_KEY` | Value: Your anon/public key
   - Make sure to select all environments (Production, Preview, Development)
   - Click **Save**

3. **Redeploy Your Project**
   - After adding the environment variables, you'll need to redeploy
   - Go to the **Deployments** tab
   - Click **Redeploy** on your latest deployment

## Testing File Uploads

After setting up your storage bucket and API keys, you should test the file upload functionality:

1. Go to your deployed website
2. Navigate to the registration form
3. Fill out the form and upload a payment slip
4. Submit the form
5. Check your Supabase Storage bucket to verify the file was uploaded

## Troubleshooting

If file uploads aren't working:

1. **Check Environment Variables**
   - Verify that `SUPABASE_URL` and `SUPABASE_KEY` are set correctly in Vercel

2. **Check Bucket Name**
   - Ensure your bucket is named exactly `payment-slips`

3. **Check Bucket Permissions**
   - Make sure the bucket has the correct access policies

4. **Check File Size**
   - Supabase has a 5MB file size limit on the free tier

5. **Check Console Errors**
   - Open your browser's developer tools to check for any JavaScript errors

## Next Steps

Once your storage bucket is set up and your API keys are configured in Vercel, your APLLS 2026 website will be fully functional with persistent data storage and file uploads.

---

If you need any further assistance, please refer to the [Supabase Documentation](https://supabase.com/docs) or contact your developer for support.