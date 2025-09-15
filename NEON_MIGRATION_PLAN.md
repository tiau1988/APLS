# Migration Plan: Supabase to Neon Database

## Overview
This document outlines the complete migration plan from Supabase to Neon PostgreSQL database for the APLLS 2026 registration website.

## Current Supabase Integration Analysis

### Database Operations Identified:
1. **Registration Management**: Insert, select, and query registrations
2. **File Storage**: Payment slip uploads to Supabase Storage
3. **Statistics**: Count queries for dashboard analytics
4. **Admin Functions**: Full CRUD operations for admin panel

### Current Netlify Functions:
- `register.js` - Main registration endpoint
- `admin-registrations.js` - Admin panel data
- `get-registrations.js` - Public registration list
- `registration-stats.js` - Statistics endpoint

### Database Schema (from migrations):
```sql
CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,
  registration_id VARCHAR UNIQUE,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  residence_country VARCHAR,
  passport_nric VARCHAR,
  gender VARCHAR,
  address TEXT,
  club_name VARCHAR,
  district VARCHAR,
  other_district VARCHAR,
  ppoas_position VARCHAR,
  district_cabinet_position VARCHAR,
  club_position VARCHAR,
  position VARCHAR,
  position_in_ngo VARCHAR,
  other_ngos TEXT,
  registration_type VARCHAR,
  vegetarian BOOLEAN,
  poolside_party BOOLEAN,
  community_service BOOLEAN,
  installation_banquet BOOLEAN,
  terms_conditions BOOLEAN,
  marketing_emails BOOLEAN,
  privacy_policy BOOLEAN,
  total_amount DECIMAL,
  payment_slip_url VARCHAR,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Migration Steps

### Phase 1: Neon Database Setup
1. **Create Neon Account & Project**
   - Sign up at neon.tech
   - Create new project
   - Note connection string format: `postgresql://[user]:[password]@[endpoint]/[dbname]?sslmode=require`

2. **Database Schema Creation**
   - Run all existing migration files on Neon
   - Verify table structure matches current Supabase schema

### Phase 2: Code Changes

#### Environment Variables Update:
```env
# Replace Supabase variables with Neon
NEON_DATABASE_URL=postgresql://[user]:[password]@[endpoint]/[dbname]?sslmode=require
# Remove these Supabase variables:
# SUPABASE_URL=
# SUPABASE_ANON_KEY=
# SUPABASE_KEY=
```

#### Package Dependencies:
```json
{
  "dependencies": {
    "pg": "^8.11.0",
    "@neondatabase/serverless": "^0.6.0"
  }
}
```

#### Database Client Changes:
- Replace `@supabase/supabase-js` with `pg` or `@neondatabase/serverless`
- Update connection initialization in all Netlify functions
- Modify query syntax from Supabase REST API to SQL queries

### Phase 3: File Storage Solution
**Challenge**: Neon doesn't provide file storage like Supabase Storage

**Solutions**:
1. **Cloudinary** (Recommended)
   - Free tier: 25GB storage, 25GB bandwidth
   - Easy integration with existing code
   - Automatic image optimization

2. **AWS S3**
   - More complex setup
   - Pay-as-you-use pricing

3. **Netlify Large Media**
   - Git LFS based
   - Integrated with Netlify

### Phase 4: Function Updates

#### Key Changes Required:
1. **Connection Method**: REST API → Direct SQL queries
2. **Query Syntax**: Supabase methods → SQL statements
3. **Error Handling**: Supabase errors → PostgreSQL errors
4. **File Upload**: Supabase Storage → Alternative storage solution

#### Example Code Changes:

**Before (Supabase)**:
```javascript
const { data, error } = await supabase
  .from('registrations')
  .insert([registration])
  .select()
  .single();
```

**After (Neon with pg)**:
```javascript
const result = await client.query(
  'INSERT INTO registrations (...) VALUES (...) RETURNING *',
  [values]
);
const data = result.rows[0];
```

### Phase 5: Data Migration

#### Export from Supabase:
1. Use Supabase dashboard to export data as CSV/SQL
2. Or create migration script using Supabase API

#### Import to Neon:
1. Use `psql` command line tool
2. Or create import script using pg client

### Phase 6: Testing & Validation

1. **Unit Testing**: Test each function individually
2. **Integration Testing**: Test complete registration flow
3. **Performance Testing**: Compare response times
4. **Data Integrity**: Verify all data migrated correctly

## Benefits of Migration to Neon

1. **No Inactivity Pause**: Unlike Supabase's 9-day pause policy
2. **Scale to Zero**: Automatic scaling with cold start (~200-800ms)
3. **PostgreSQL Compatibility**: Full PostgreSQL features
4. **Branching**: Database branching for development
5. **Cost Effective**: Pay only for compute time used

## Potential Challenges

1. **File Storage**: Need alternative solution for payment slips
2. **Cold Starts**: Initial request latency after inactivity
3. **Query Migration**: Converting REST API calls to SQL
4. **Environment Setup**: New connection strings and credentials

## Rollback Plan

1. Keep Supabase project active during migration
2. Maintain dual environment variables
3. Quick switch mechanism in case of issues
4. Data backup before migration

## Timeline Estimate

- **Phase 1**: 1-2 hours (Neon setup)
- **Phase 2**: 2-3 hours (Code changes)
- **Phase 3**: 1-2 hours (File storage setup)
- **Phase 4**: 3-4 hours (Function updates)
- **Phase 5**: 1-2 hours (Data migration)
- **Phase 6**: 2-3 hours (Testing)

**Total**: 10-16 hours

## Next Steps

1. Create Neon account and project
2. Set up development environment with Neon
3. Update one function as proof of concept
4. Implement file storage solution
5. Complete full migration
6. Thorough testing
7. Deploy to production

---

*This migration plan ensures a smooth transition from Supabase to Neon while maintaining all existing functionality.*