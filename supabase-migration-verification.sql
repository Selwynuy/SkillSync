-- ============================================================================
-- Email Verification Migration
-- ============================================================================
-- This migration adds email verification token support to the users table
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================================

-- Add verification token columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS verification_token TEXT,
ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE;

-- Create index on verification_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON public.users(verification_token);

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
-- The users table now supports email verification tokens
-- Next steps:
-- 1. Verify the columns were added in Supabase Dashboard > Table Editor
-- 2. Test the email verification flow
-- ============================================================================
