-- Add verification token columns to users table
-- These are used for email verification with custom tokens

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS verification_token TEXT,
ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMPTZ;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token
ON public.users(verification_token)
WHERE verification_token IS NOT NULL;

-- Add comment to document the columns
COMMENT ON COLUMN public.users.verification_token IS 'Token used for email verification';
COMMENT ON COLUMN public.users.verification_token_expires IS 'Expiration timestamp for verification token';
