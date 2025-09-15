-- Modify registrations table structure
-- 1. Remove unique constraint on email field to allow duplicate emails
-- 2. Change primary key from 'id' to 'registration_id'

-- First, drop the existing unique constraint on email
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_email_key;

-- Drop the existing unique constraint on registration_id (if it exists)
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_registration_id_key;

-- Drop the existing primary key constraint
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_pkey;

-- Add new primary key constraint on registration_id
ALTER TABLE registrations ADD CONSTRAINT registrations_pkey PRIMARY KEY (registration_id);

-- Add comment to document the changes
COMMENT ON TABLE registrations IS 'Registration table with registration_id as primary key and email allowing duplicates';
COMMENT ON COLUMN registrations.email IS 'Email address - duplicates allowed for multiple registrations';
COMMENT ON COLUMN registrations.registration_id IS 'Primary key - unique registration identifier';