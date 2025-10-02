/*
  # Create CORE App Database Schema

  1. New Tables
    - `tasks` - User tasks and assignments
    - `courses` - User courses for grade tracking
    - `assignments` - Course assignments and grades
    - `wellness_entries` - Daily wellness check-ins
    - `pomodoro_sessions` - Pomodoro timer sessions
    - `study_groups` - Study group information
    - `study_group_members` - Study group membership

  2. Security
    - Enable RLS on all tables
    - Add policies for users to access only their own data
    - Add policies for study groups to allow member access

  3. Relationships
    - Foreign keys to link data to users
    - Proper indexing for performance
*/

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL CHECK (category IN ('class', 'work', 'extracurricular', 'personal')),
  priority text NOT NULL CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  due_date timestamptz,
  completed boolean DEFAULT false,
  course_code text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  code text NOT NULL,
  credits integer DEFAULT 3,
  current_grade numeric(5,2) DEFAULT 0,
  target_grade numeric(5,2) DEFAULT 90,
  color text DEFAULT 'bg-blue-500',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('exam', 'homework', 'project', 'quiz', 'participation')),
  score numeric(5,2) DEFAULT 0,
  max_score numeric(5,2) DEFAULT 100,
  weight numeric(5,2) DEFAULT 0,
  due_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Wellness entries table
CREATE TABLE IF NOT EXISTS wellness_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  mood text NOT NULL CHECK (mood IN ('great', 'good', 'okay', 'stressed', 'overwhelmed')),
  stress_level integer CHECK (stress_level >= 1 AND stress_level <= 10) DEFAULT 5,
  notes text DEFAULT '',
  entry_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Pomodoro sessions table
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  session_type text NOT NULL CHECK (session_type IN ('work', 'shortBreak', 'longBreak')),
  duration_minutes integer NOT NULL,
  completed boolean DEFAULT false,
  task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Study groups table
CREATE TABLE IF NOT EXISTS study_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  description text DEFAULT '',
  max_members integer DEFAULT 10,
  location text DEFAULT '',
  is_online boolean DEFAULT false,
  next_session timestamptz,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Study group members table
CREATE TABLE IF NOT EXISTS study_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "Users can manage their own tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE id = auth.uid() LIMIT 1))
  WITH CHECK (user_id = (SELECT id FROM users WHERE id = auth.uid() LIMIT 1));

-- RLS Policies for courses
CREATE POLICY "Users can manage their own courses"
  ON courses
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE id = auth.uid() LIMIT 1))
  WITH CHECK (user_id = (SELECT id FROM users WHERE id = auth.uid() LIMIT 1));

-- RLS Policies for assignments
CREATE POLICY "Users can manage their own assignments"
  ON assignments
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE id = auth.uid() LIMIT 1))
  WITH CHECK (user_id = (SELECT id FROM users WHERE id = auth.uid() LIMIT 1));

-- RLS Policies for wellness entries
CREATE POLICY "Users can manage their own wellness entries"
  ON wellness_entries
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE id = auth.uid() LIMIT 1))
  WITH CHECK (user_id = (SELECT id FROM users WHERE id = auth.uid() LIMIT 1));

-- RLS Policies for pomodoro sessions
CREATE POLICY "Users can manage their own pomodoro sessions"
  ON pomodoro_sessions
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE id = auth.uid() LIMIT 1))
  WITH CHECK (user_id = (SELECT id FROM users WHERE id = auth.uid() LIMIT 1));

-- RLS Policies for study groups
CREATE POLICY "Anyone can view study groups"
  ON study_groups
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create study groups"
  ON study_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = (SELECT id FROM users WHERE id = auth.uid() LIMIT 1));

CREATE POLICY "Creators can update their study groups"
  ON study_groups
  FOR UPDATE
  TO authenticated
  USING (creator_id = (SELECT id FROM users WHERE id = auth.uid() LIMIT 1))
  WITH CHECK (creator_id = (SELECT id FROM users WHERE id = auth.uid() LIMIT 1));

CREATE POLICY "Creators can delete their study groups"
  ON study_groups
  FOR DELETE
  TO authenticated
  USING (creator_id = (SELECT id FROM users WHERE id = auth.uid() LIMIT 1));

-- RLS Policies for study group members
CREATE POLICY "Anyone can view study group members"
  ON study_group_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join study groups"
  ON study_group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT id FROM users WHERE id = auth.uid() LIMIT 1));

CREATE POLICY "Users can leave study groups"
  ON study_group_members
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE id = auth.uid() LIMIT 1));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_entries_user_id ON wellness_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_entries_date ON wellness_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_group_id ON study_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user_id ON study_group_members(user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON study_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();