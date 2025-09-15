-- Update table comment to reflect current structure

BEGIN;

-- Update the comment on the registrations table
COMMENT ON TABLE registrations IS 'Registration table with id as primary key and email allowing duplicates';

-- Update comment on registration_id column
COMMENT ON COLUMN registrations.registration_id IS 'Unique registration identifier (not primary key)';

COMMIT;