#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🔧 QUICK FIX: Apply RLS Policy to Supabase                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "This script will show you the exact SQL to fix the 403 error."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 COPY THIS SQL AND RUN IT IN SUPABASE:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat << 'EOF'

-- Fix RLS policies to allow task creation
DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;
CREATE POLICY "Users can manage their own tasks"
  ON tasks FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own courses" ON courses;
CREATE POLICY "Users can manage their own courses"
  ON courses FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own assignments" ON assignments;
CREATE POLICY "Users can manage their own assignments"
  ON assignments FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own wellness entries" ON wellness_entries;
CREATE POLICY "Users can manage their own wellness entries"
  ON wellness_entries FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own pomodoro sessions" ON pomodoro_sessions;
CREATE POLICY "Users can manage their own pomodoro sessions"
  ON pomodoro_sessions FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

EOF
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 STEPS TO FIX:"
echo ""
echo "1. Open: https://supabase.com/dashboard/project/msfwykwgukbazmhsmjso/sql"
echo ""
echo "2. Click '+ New query'"
echo ""
echo "3. Copy the SQL above (scroll up)"
echo ""
echo "4. Paste it in Supabase SQL Editor"
echo ""
echo "5. Click 'Run' or press Cmd+Enter"
echo ""
echo "6. Refresh your app and try creating a task again"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
