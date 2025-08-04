# 🗄️ Database Setup Guide for APLLS 2026

## Overview
Your registration system is now configured to use **Vercel Postgres** - a serverless database that integrates seamlessly with your Vercel deployment.

## 🚀 Quick Setup Steps

### 1. Enable Vercel Postgres
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `aplls-2026-website` project
3. Go to the **Storage** tab
4. Click **Create Database** → **Postgres**
5. Choose a database name (e.g., `aplls-2026-db`)
6. Select your preferred region (closest to Malaysia for best performance)

### 2. Initialize Database
After creating the database:
1. Visit: `https://your-domain.vercel.app/api/init-db` (POST request)
2. Or use this curl command:
```bash
curl -X POST https://your-domain.vercel.app/api/init-db
```

### 3. View Registrations
- **Admin Dashboard**: `https://your-domain.vercel.app/admin.html`
- **API Endpoint**: `https://your-domain.vercel.app/api/admin/registrations`

## 📊 Available Endpoints

### Registration Endpoints
- `POST /api/register` - Submit new registration
- `GET /api/registration-count` - Get live registration counts
- `GET /api/admin/registrations` - View all registrations (admin)
- `POST /api/init-db` - Initialize database tables

### Admin Dashboard Features
- 📈 Real-time statistics
- 📋 Complete registration list
- 📊 Export to CSV
- 🔄 Auto-refresh every 30 seconds

## 🔒 Security Notes

### Environment Variables (Auto-configured by Vercel)
When you create a Vercel Postgres database, these are automatically set:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

### Admin Access
The admin dashboard (`/admin.html`) is currently open. For production, consider:
1. Adding password protection
2. Restricting access by IP
3. Using Vercel's authentication features

## 📱 Database Schema

### Registrations Table
```sql
CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,
  registration_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  club_name VARCHAR(255),
  district VARCHAR(100),
  position VARCHAR(100),
  registration_type VARCHAR(50) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  optional_programs JSONB,
  payment_slip TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 Next Steps

1. **Deploy to Vercel** - Push your changes to GitHub
2. **Create Database** - Follow step 1 above
3. **Initialize Tables** - Run the init-db endpoint
4. **Test Registration** - Try submitting a test registration
5. **Access Admin Panel** - View your registrations at `/admin.html`

## 💡 Alternative Database Options

If you prefer other solutions:

### Option 2: Airtable (No-code)
- Easy to set up and manage
- Great for non-technical users
- Built-in forms and views

### Option 3: Google Sheets
- Free and familiar
- Easy sharing and collaboration
- Good for simple tracking

### Option 4: Supabase
- Open-source alternative
- Real-time features
- Built-in authentication

## 🆘 Troubleshooting

### Common Issues:
1. **"Database not found"** - Make sure you've created the Vercel Postgres database
2. **"Table doesn't exist"** - Run the `/api/init-db` endpoint
3. **CORS errors** - The API endpoints include CORS headers
4. **Empty admin dashboard** - Check browser console for API errors

### Support:
- Check Vercel logs in your dashboard
- Test API endpoints directly
- Verify database connection in Vercel settings

---

🎉 **Your registration system is now ready to collect and manage real registrations!**