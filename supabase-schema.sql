-- ============================================================================
-- SkillSync Database Schema for Supabase
-- ============================================================================
-- This script creates all tables, indexes, and RLS policies for SkillSync
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================================

-- Enable UUID extension (for generating unique IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
-- Stores user account information
-- Note: Supabase has a built-in auth.users table, but we create our own
-- for additional user data that's easier to query
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT, -- For email/password auth
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ============================================================================
-- 2. ASSESSMENT ATTEMPTS TABLE
-- ============================================================================
-- Stores each time a user completes an assessment
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.assessment_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assessment_id TEXT NOT NULL, -- e.g., 'assessment-001'
  trait_vector DOUBLE PRECISION[] NOT NULL, -- Array of trait scores
  trait_summary JSONB NOT NULL, -- JSON object with named traits
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON public.assessment_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_completed_at ON public.assessment_attempts(completed_at DESC);

-- ============================================================================
-- 3. ASSESSMENT RESPONSES TABLE
-- ============================================================================
-- Stores individual question responses for each attempt
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.assessment_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  value JSONB NOT NULL, -- Can be number (likert) or string (mcq)
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on attempt_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_responses_attempt_id ON public.assessment_responses(attempt_id);

-- ============================================================================
-- 4. SAVED JOB PATHS TABLE
-- ============================================================================
-- Stores job paths that users have bookmarked
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.saved_job_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_path_id TEXT NOT NULL, -- e.g., 'jp-001'
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure a user can't save the same job path twice
  UNIQUE(user_id, job_path_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_paths_user_id ON public.saved_job_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_paths_saved_at ON public.saved_job_paths(saved_at DESC);

-- ============================================================================
-- 5. USER MILESTONES TABLE
-- ============================================================================
-- Stores milestones/goals for each user's chosen career path
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_path_id TEXT NOT NULL, -- e.g., 'jp-001'
  milestones JSONB NOT NULL, -- Array of milestone objects
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure a user has only one milestone set per job path
  UNIQUE(user_id, job_path_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_milestones_user_id ON public.user_milestones(user_id);

-- ============================================================================
-- 6. IN-PROGRESS ASSESSMENT ATTEMPTS TABLE
-- ============================================================================
-- Stores incomplete assessment attempts (for auto-save functionality)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.assessment_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assessment_id TEXT NOT NULL,
  responses JSONB NOT NULL DEFAULT '[]', -- Array of response objects
  current_module_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure a user has only one in-progress attempt per assessment
  UNIQUE(user_id, assessment_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.assessment_progress(user_id);

-- ============================================================================
-- 7. FUNCTION: Update updated_at timestamp
-- ============================================================================
-- This function automatically updates the updated_at field on row updates
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update updated_at columns
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON public.user_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON public.assessment_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS to ensure users can only access their own data
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_job_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_progress ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid()::TEXT = id::TEXT);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid()::TEXT = id::TEXT);

-- Assessment attempts policies
CREATE POLICY "Users can view own attempts"
  ON public.assessment_attempts FOR SELECT
  USING (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can insert own attempts"
  ON public.assessment_attempts FOR INSERT
  WITH CHECK (auth.uid()::TEXT = user_id::TEXT);

-- Assessment responses policies
CREATE POLICY "Users can view own responses"
  ON public.assessment_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_attempts
      WHERE assessment_attempts.id = assessment_responses.attempt_id
      AND auth.uid()::TEXT = assessment_attempts.user_id::TEXT
    )
  );

CREATE POLICY "Users can insert own responses"
  ON public.assessment_responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assessment_attempts
      WHERE assessment_attempts.id = attempt_id
      AND auth.uid()::TEXT = assessment_attempts.user_id::TEXT
    )
  );

-- Saved job paths policies
CREATE POLICY "Users can view own saved paths"
  ON public.saved_job_paths FOR SELECT
  USING (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can insert own saved paths"
  ON public.saved_job_paths FOR INSERT
  WITH CHECK (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can delete own saved paths"
  ON public.saved_job_paths FOR DELETE
  USING (auth.uid()::TEXT = user_id::TEXT);

-- User milestones policies
CREATE POLICY "Users can view own milestones"
  ON public.user_milestones FOR SELECT
  USING (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can insert own milestones"
  ON public.user_milestones FOR INSERT
  WITH CHECK (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can update own milestones"
  ON public.user_milestones FOR UPDATE
  USING (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can delete own milestones"
  ON public.user_milestones FOR DELETE
  USING (auth.uid()::TEXT = user_id::TEXT);

-- Assessment progress policies
CREATE POLICY "Users can view own progress"
  ON public.assessment_progress FOR SELECT
  USING (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can insert own progress"
  ON public.assessment_progress FOR INSERT
  WITH CHECK (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can update own progress"
  ON public.assessment_progress FOR UPDATE
  USING (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can delete own progress"
  ON public.assessment_progress FOR DELETE
  USING (auth.uid()::TEXT = user_id::TEXT);

-- ============================================================================
-- 9. GRANT PERMISSIONS
-- ============================================================================
-- Grant appropriate permissions to authenticated and anonymous users
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on all tables
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.assessment_attempts TO authenticated;
GRANT ALL ON public.assessment_responses TO authenticated;
GRANT ALL ON public.saved_job_paths TO authenticated;
GRANT ALL ON public.user_milestones TO authenticated;
GRANT ALL ON public.assessment_progress TO authenticated;

-- Grant select on users table to anon (for signup/signin checks)
GRANT SELECT ON public.users TO anon;

-- ============================================================================
-- SCHEMA CREATION COMPLETE!
-- ============================================================================
-- Next steps:
-- 1. Verify all tables were created in Supabase Dashboard > Table Editor
-- 2. Test authentication and data operations
-- ============================================================================
