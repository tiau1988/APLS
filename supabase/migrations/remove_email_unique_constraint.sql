-- Remove unique constraint on email field completely
-- This ensures email duplicates are truly allowed

-- Query and drop any unique constraints on email column
DO $$ 
DECLARE
    constraint_name_var text;
BEGIN
    -- Find the actual constraint name for email unique constraint
    SELECT tc.constraint_name INTO constraint_name_var
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'registrations'
    AND tc.constraint_type = 'UNIQUE'
    AND kcu.column_name = 'email';
    
    -- Drop the constraint if it exists
    IF constraint_name_var IS NOT NULL THEN
        EXECUTE 'ALTER TABLE registrations DROP CONSTRAINT ' || constraint_name_var;
    END IF;
END $$;

-- Also drop any unique index on email if it exists
DROP INDEX IF EXISTS registrations_email_key;
DROP INDEX IF EXISTS idx_registrations_email;

-- Update column comment to reflect the change
COMMENT ON COLUMN registrations.email IS 'Email address - duplicates allowed for multiple registrations';