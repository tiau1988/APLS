-- Revert primary key from registration_id back to id field
-- This migration restores the original primary key configuration

BEGIN;

-- Step 1: Drop the current primary key constraint on registration_id
ALTER TABLE registrations DROP CONSTRAINT registrations_pkey;

-- Step 2: Add primary key constraint back to id field
ALTER TABLE registrations ADD CONSTRAINT registrations_pkey PRIMARY KEY (id);

-- Step 3: Remove unique constraint from registration_id (if it exists)
-- This allows registration_id to be non-unique while id remains the primary key
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_registration_id_key;

COMMIT;

-- Verify the changes
-- The id field should now be the primary key
-- The registration_id field should remain as a regular varchar field without unique constraint