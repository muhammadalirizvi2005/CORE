-- Fix RLS policy for tasks table
-- The issue: policies were checking against a users table lookup which might not exist
-- The fix: directly use auth.uid() which is the authenticated user's ID

-- Drop the old policy
DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;

-- Create new simplified policy that directly checks auth.uid()
CREATE POLICY "Users can manage their own tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Also fix other tables for consistency
DROP POLICY IF EXISTS "Users can manage their own courses" ON courses;
CREATE POLICY "Users can manage their own courses"
  ON courses
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own assignments" ON assignments;
CREATE POLICY "Users can manage their own assignments"
  ON assignments
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own wellness entries" ON wellness_entries;
CREATE POLICY "Users can manage their own wellness entries"
  ON wellness_entries
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own pomodoro sessions" ON pomodoro_sessions;
CREATE POLICY "Users can manage their own pomodoro sessions"
  ON pomodoro_sessions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create study groups" ON study_groups;
CREATE POLICY "Users can create study groups"
  ON study_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

DROP POLICY IF EXISTS "Creators can update their study groups" ON study_groups;
CREATE POLICY "Creators can update their study groups"
  ON study_groups
  FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

DROP POLICY IF EXISTS "Creators can delete their study groups" ON study_groups;
CREATE POLICY "Creators can delete their study groups"
  ON study_groups
  FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

DROP POLICY IF EXISTS "Users can join study groups" ON study_group_members;
CREATE POLICY "Users can join study groups"
  ON study_group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
