-- Add user profile and preferences fields to users table
-- This migration moves localStorage data to the database for persistence

BEGIN;

-- Add profile fields
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS university text,
  ADD COLUMN IF NOT EXISTS graduation_year text,
  ADD COLUMN IF NOT EXISTS deans_list_gpa numeric(3,2) DEFAULT 3.5;

-- Add preferences fields
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS notifications jsonb DEFAULT '{"assignment_due": true, "grade_updates": true, "wellness_reminders": true}'::jsonb,
  ADD COLUMN IF NOT EXISTS theme text DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
  ADD COLUMN IF NOT EXISTS pomodoro_custom_times jsonb DEFAULT '{"work": 25, "shortBreak": 5, "longBreak": 15}'::jsonb;

-- Create table for course platform links (Moodle, Blackboard, etc.)
CREATE TABLE IF NOT EXISTS public.course_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  platform text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on course_links
ALTER TABLE public.course_links ENABLE ROW LEVEL SECURITY;

-- RLS Policy for course_links
CREATE POLICY "Users can manage their own course links"
  ON public.course_links
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create table for quick notes (from Pomodoro timer)
CREATE TABLE IF NOT EXISTS public.quick_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on quick_notes
ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policy for quick_notes
CREATE POLICY "Users can manage their own quick notes"
  ON public.quick_notes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_links_user_id ON public.course_links(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_notes_user_id ON public.quick_notes(user_id);

-- Add updated_at triggers
CREATE TRIGGER update_course_links_updated_at 
  BEFORE UPDATE ON public.course_links 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quick_notes_updated_at 
  BEFORE UPDATE ON public.quick_notes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Update the users RLS policy to allow updates
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

COMMIT;
