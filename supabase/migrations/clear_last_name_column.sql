-- Clear all last_name values in the registrations table
-- This migration sets all last_name fields to empty string

UPDATE registrations 
SET last_name = '', 
    updated_at = now()
WHERE last_name IS NOT NULL AND last_name != '';

-- Optional: Add a comment about this operation
COMMENT ON COLUMN registrations.last_name IS 'Last name field - cleared on user request';