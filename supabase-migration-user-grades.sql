-- ============================================================================
-- User Grades Migration
-- ============================================================================
-- This migration adds a table to store user academic grades
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================================

-- Create user_grades table
CREATE TABLE IF NOT EXISTS public.user_grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Academic grades (optional, can be NULL if not provided)
  grade_7_math DECIMAL(5,2),
  grade_7_english DECIMAL(5,2),
  grade_7_science DECIMAL(5,2),
  grade_7_gpa DECIMAL(5,2),

  grade_8_math DECIMAL(5,2),
  grade_8_english DECIMAL(5,2),
  grade_8_science DECIMAL(5,2),
  grade_8_gpa DECIMAL(5,2),

  grade_9_math DECIMAL(5,2),
  grade_9_english DECIMAL(5,2),
  grade_9_science DECIMAL(5,2),
  grade_9_gpa DECIMAL(5,2),

  grade_10_math DECIMAL(5,2),
  grade_10_english DECIMAL(5,2),
  grade_10_science DECIMAL(5,2),
  grade_10_gpa DECIMAL(5,2),

  -- Additional information
  additional_notes TEXT,

  -- Consent
  consent_to_use BOOLEAN NOT NULL DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one grades record per user
  UNIQUE(user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_grades_user_id ON public.user_grades(user_id);

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_user_grades_updated_at
  BEFORE UPDATE ON public.user_grades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.user_grades ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_grades
CREATE POLICY "Users can view own grades"
  ON public.user_grades FOR SELECT
  USING (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can insert own grades"
  ON public.user_grades FOR INSERT
  WITH CHECK (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can update own grades"
  ON public.user_grades FOR UPDATE
  USING (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can delete own grades"
  ON public.user_grades FOR DELETE
  USING (auth.uid()::TEXT = user_id::TEXT);

-- Grant permissions
GRANT ALL ON public.user_grades TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
-- The user_grades table is now ready to store student academic performance
-- ============================================================================
