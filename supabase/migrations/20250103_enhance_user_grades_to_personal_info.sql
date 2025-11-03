-- ============================================================================
-- Enhance User Grades to Personal Information Migration
-- ============================================================================
-- This migration enhances the user_grades table to include:
-- - Custom subjects (JSON)
-- - Grade 11 and 12 support
-- - Filipino subject
-- - Total average (replaces GPA for high school)
-- - Achievements/Awards
-- - Hobbies/Interests
-- - Extracurricular activities
-- - Skills and languages
-- ============================================================================

-- Add Filipino subject columns for all grades
ALTER TABLE public.user_grades
  ADD COLUMN IF NOT EXISTS grade_7_filipino DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS grade_8_filipino DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS grade_9_filipino DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS grade_10_filipino DECIMAL(5,2);

-- Add total_average columns (replaces GPA for high school context)
ALTER TABLE public.user_grades
  ADD COLUMN IF NOT EXISTS grade_7_total_average DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS grade_8_total_average DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS grade_9_total_average DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS grade_10_total_average DECIMAL(5,2);

-- Add custom subjects as JSONB (array of {id, name, grade})
ALTER TABLE public.user_grades
  ADD COLUMN IF NOT EXISTS grade_7_custom_subjects JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS grade_8_custom_subjects JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS grade_9_custom_subjects JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS grade_10_custom_subjects JSONB DEFAULT '[]'::jsonb;

-- Add Grade 11 columns
ALTER TABLE public.user_grades
  ADD COLUMN IF NOT EXISTS grade_11_math DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS grade_11_english DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS grade_11_science DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS grade_11_filipino DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS grade_11_total_average DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS grade_11_custom_subjects JSONB DEFAULT '[]'::jsonb;

-- Add Grade 12 columns
ALTER TABLE public.user_grades
  ADD COLUMN IF NOT EXISTS grade_12_math DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS grade_12_english DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS grade_12_science DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS grade_12_filipino DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS grade_12_total_average DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS grade_12_custom_subjects JSONB DEFAULT '[]'::jsonb;

-- Add achievements/awards (JSONB array of {id, title, description, dateReceived, category})
ALTER TABLE public.user_grades
  ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb;

-- Add hobbies/interests (JSONB array of {id, name, description, skillLevel})
ALTER TABLE public.user_grades
  ADD COLUMN IF NOT EXISTS hobbies JSONB DEFAULT '[]'::jsonb;

-- Add extracurricular activities (JSONB array of {id, name, role, description, yearsActive})
ALTER TABLE public.user_grades
  ADD COLUMN IF NOT EXISTS extracurriculars JSONB DEFAULT '[]'::jsonb;

-- Add skills (JSONB array of strings)
ALTER TABLE public.user_grades
  ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb;

-- Add languages (JSONB array of strings)
ALTER TABLE public.user_grades
  ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb;

-- Create indexes for JSONB columns for faster queries
CREATE INDEX IF NOT EXISTS idx_user_grades_achievements ON public.user_grades USING GIN (achievements);
CREATE INDEX IF NOT EXISTS idx_user_grades_hobbies ON public.user_grades USING GIN (hobbies);
CREATE INDEX IF NOT EXISTS idx_user_grades_extracurriculars ON public.user_grades USING GIN (extracurriculars);
CREATE INDEX IF NOT EXISTS idx_user_grades_skills ON public.user_grades USING GIN (skills);

-- Add comment to reflect new purpose
COMMENT ON TABLE public.user_grades IS 'Stores comprehensive personal information including academic grades, achievements, hobbies, and skills';

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
-- The user_grades table now supports:
-- - Customizable subjects per grade level
-- - Filipino subject and total average for all grades
-- - Grade 11 and 12 support
-- - Academic achievements and awards
-- - Hobbies and interests
-- - Extracurricular activities
-- - Skills and languages
-- ============================================================================
