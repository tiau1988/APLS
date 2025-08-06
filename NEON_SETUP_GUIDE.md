# 🚀 Neon Database Setup Guide

## Step 1: Create Neon Database

1. **Go to Neon Console**: Visit [https://console.neon.tech](https://console.neon.tech)
2. **Sign up/Login**: Create account or login with GitHub
3. **Create New Project**: 
   - Project name: `aplls-2026-database`
   - Region: Choose closest to your users (e.g., `US East` for global access)
   - PostgreSQL version: Latest (15+)

## Step 2: Get Connection String

1. **In Neon Dashboard**: Go to your project
2. **Navigate to "Connection Details"**
3. **Copy the connection string**: It looks like:
   ```
   postgresql://username:password@ep-cool-cloud-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

## Step 3: Configure Vercel Environment Variables

1. **Go to Vercel Dashboard**: [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. **Select your project**: `aplls-2026-website`
3. **Go to Settings → Environment Variables**
4. **Add new variable**:
   - **Name**: `POSTGRES_URL`
   - **Value**: Your Neon connection string (from Step 2)
   - **Environment**: All (Production, Preview, Development)

## Step 4: Initialize Database Tables

After setting up the environment variable:

1. **Deploy the updated code** (push to GitHub)
2. **Wait for deployment to complete**
3. **Initialize the database** by visiting:
   ```
   https://aplls-2026-website.vercel.app/api/init-db
   ```
   Or use curl:
   ```bash
   curl -X POST https://aplls-2026-website.vercel.app/api/init-db
   ```

## Step 5: Test the Connection

Test the API to ensure it's working:

```bash
# Test GET (should show live data now)
curl https://aplls-2026-website.vercel.app/api/register-simple

# Test POST (submit a test registration)
curl -X POST https://aplls-2026-website.vercel.app/api/register-simple \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "registrationType": "early-bird",
    "registrationFee": 260
  }'
```

## 🎯 Expected Results

### Before Database Setup:
```json
{
  "status": "ready_no_db",
  "message": "Database not configured - using fallback data",
  "database_connected": false
}
```

### After Successful Setup:
```json
{
  "status": "ready_live",
  "message": "Connected to Neon database - live data",
  "total_registrations": 0,
  "early_bird_count": 0,
  "recent_24h_count": 0,
  "database_connected": true,
  "reason": "Live data from Neon PostgreSQL"
}
```

## 🗄️ Database Schema

The following table will be created automatically:

```sql
CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  organization VARCHAR(255),
  position VARCHAR(255),
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  gender VARCHAR(20),
  address TEXT,
  district VARCHAR(100),
  other_district VARCHAR(100),
  ppoas_position VARCHAR(100),
  district_cabinet_position VARCHAR(100),
  club_position VARCHAR(100),
  position_in_ngo VARCHAR(100),
  other_ngos TEXT,
  registration_type VARCHAR(50),
  registration_fee INTEGER DEFAULT 0,
  optional_fee INTEGER DEFAULT 0,
  total_amount INTEGER DEFAULT 0,
  vegetarian VARCHAR(20),
  poolside_party VARCHAR(50),
  community_service VARCHAR(50),
  installation_banquet VARCHAR(50),
  terms_conditions BOOLEAN DEFAULT FALSE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  privacy_policy BOOLEAN DEFAULT FALSE,
  registration_id VARCHAR(50) UNIQUE,
  payment_slip_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Troubleshooting

### Common Issues:

1. **"Database not configured"**
   - Check if `POSTGRES_URL` is set in Vercel environment variables
   - Ensure the connection string is correct

2. **"Connection failed"**
   - Verify the Neon database is running
   - Check if the connection string includes `?sslmode=require`
   - Ensure your Neon project is not paused (free tier auto-pauses)

3. **"Table doesn't exist"**
   - Run the database initialization: `/api/init-db`
   - Check Neon console for any error logs

4. **"Duplicate email" errors**
   - This is expected behavior - each email can only register once
   - Use different email addresses for testing

### Neon-Specific Notes:

- **Free Tier Limitations**: 
  - 1 project, 10 branches
  - 3 GB storage
  - Auto-pauses after 5 minutes of inactivity
  
- **Connection Pooling**: 
  - Neon handles connection pooling automatically
  - No need for additional connection pool configuration

- **SSL Required**: 
  - All connections must use SSL
  - Connection string must include `?sslmode=require`

## 🎉 Success Indicators

✅ **Database initialization successful**  
✅ **Registration form saves to database**  
✅ **Statistics show live data**  
✅ **Duplicate email protection working**  
✅ **Error handling functional**

## 📊 Monitoring

- **Neon Console**: Monitor database usage, connections, and performance
- **Vercel Functions**: Check function logs for any database errors
- **API Testing**: Regular testing of endpoints to ensure connectivity

---

**🎯 Once completed, your registration system will be fully functional with persistent data storage in Neon PostgreSQL!**