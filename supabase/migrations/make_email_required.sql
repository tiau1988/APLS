-- Make email column required in registrations table
-- This reverts the previous change that made email optional

-- First, update any existing NULL email values to prevent constraint violation
-- (This is a safety measure in case there are any NULL emails)
UPDATE registrations 
SET email = 'placeholder@example.com' 
WHERE email IS NULL;

-- Now make the email column NOT NULL
ALTER TABLE registrations 
ALTER COLUMN email SET NOT NULL;

-- Update the comment to reflect the change
COMMENT ON COLUMN registrations.email IS 'Email address (required) - users must provide a valid email address';

-- Ensure email uniqueness constraint exists
ALTER TABLE registrations 
ADD CONSTRAINT unique_email UNIQUE (email);