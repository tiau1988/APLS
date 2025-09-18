# Cloudinary Setup Guide

This guide will help you set up Cloudinary for handling payment slip uploads in the APLLS 2026 registration system.

## Step 1: Create a Free Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Click "Sign Up for Free"
3. Fill in your details and create an account
4. Verify your email address

## Step 2: Get Your API Credentials

1. After logging in, go to your Dashboard
2. You'll see your account details including:
   - **Cloud Name** (e.g., `dxyz123abc`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

## Step 3: Update Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder values with your actual Cloudinary credentials:

```env
# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

## Step 4: Test the Configuration

Run the test script to verify your setup:

```bash
node test-cloudinary-config.js
```

You should see:
- ✅ Cloudinary API connection successful!
- ✅ Upload successful!
- A Cloudinary URL for the test image

## Step 5: Test the Complete Upload Flow

Run the full upload test:

```bash
node test-cloudinary-upload.js
```

You should see:
- ✅ SUCCESS: Registration completed!
- Payment slip URL should be a Cloudinary URL (starts with `https://res.cloudinary.com/`)

## Cloudinary Free Tier Limits

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month
- **API Calls**: 1,000,000/month

These limits are more than sufficient for the APLLS 2026 registration system.

## Folder Structure in Cloudinary

Payment slips will be organized in Cloudinary as:
```
aplls-2026/
└── payment-slips/
    ├── payment-slip-1234567890.jpg
    ├── payment-slip-1234567891.png
    └── ...
```

## Security Notes

- Never commit your actual API credentials to version control
- The `.env` file is already in `.gitignore` to prevent accidental commits
- API Secret should be kept confidential
- Cloud Name and API Key are safe to use in frontend applications

## Troubleshooting

### "unknown api_key" Error
- Double-check your API Key is correct
- Make sure there are no extra spaces in the .env file
- Verify your Cloudinary account is active

### Upload Fails
- Check your internet connection
- Verify API Secret is correct
- Ensure you haven't exceeded free tier limits

### Images Not Displaying
- Check the Cloudinary URL is accessible in browser
- Verify the image was uploaded successfully
- Check browser console for CORS errors

## Support

If you encounter issues:
1. Check the Cloudinary documentation: https://cloudinary.com/documentation
2. Review the error messages in the console
3. Test with the provided test scripts
4. Contact Cloudinary support if needed