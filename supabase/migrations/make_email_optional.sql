-- Make email column optional in registrations table
-- This allows users to register without providing an email address

ALTER TABLE registrations 
ALTER COLUMN email DROP NOT NULL;

-- Add a comment to document this change
COMMENT ON COLUMN registrations.email IS 'Email address (optional) - users can register without email';

-- Update any existing constraints or indexes if needed
-- Note: We keep the unique constraint on email but it will only apply to non-null values
-- PostgreSQL automatically handles this correctly for partial unique indexes