# Fix 403 Error - Step by Step Guide

## The Problem
You're getting a 403 error because the Row Level Security (RLS) policies in your Supabase database are incorrectly configured. They're trying to lookup users in a table that doesn't match auth.uid().

## The Solution - Apply Migration to Supabase

### Step 1: Copy the SQL Migration
Copy this entire SQL script:

```sql
-- Fix RLS policy for tasks table
DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;

CREATE POLICY "Users can manage their own tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Fix courses table
DROP POLICY IF EXISTS "Users can manage their own courses" ON courses;
CREATE POLICY "Users can manage their own courses"
  ON courses
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Fix assignments table
DROP POLICY IF EXISTS "Users can manage their own assignments" ON assignments;
CREATE POLICY "Users can manage their own assignments"
  ON assignments
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Fix wellness_entries table
DROP POLICY IF EXISTS "Users can manage their own wellness entries" ON wellness_entries;
CREATE POLICY "Users can manage their own wellness entries"
  ON wellness_entries
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Fix pomodoro_sessions table
DROP POLICY IF EXISTS "Users can manage their own pomodoro sessions" ON pomodoro_sessions;
CREATE POLICY "Users can manage their own pomodoro sessions"
  ON pomodoro_sessions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Fix study_groups table
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

-- Fix study_group_members table
DROP POLICY IF EXISTS "Users can join study groups" ON study_group_members;
CREATE POLICY "Users can join study groups"
  ON study_group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
```

### Step 2: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/msfwykwgukbazmhsmjso/sql
2. Or navigate to your Supabase Dashboard → Your Project → SQL Editor

### Step 3: Run the Migration
1. Click "+ New query"
2. Paste the SQL from Step 1
3. Click "Run" (or press Cmd+Enter on Mac / Ctrl+Enter on Windows)
4. You should see "Success. No rows returned"

### Step 4: Test Your App
1. Go to http://localhost:5174
2. Login to your account
3. Try creating a task
4. The 403 error should be GONE! ✅

## Why This is Required
- The migration file exists locally but hasn't been executed on your Supabase server
- Local files don't automatically sync to Supabase
- You must manually run the SQL in Supabase Dashboard or use Supabase CLI
- Without this, the old (broken) RLS policies remain active

## What Changed
**Before (Broken):**
```sql
USING (user_id = (SELECT id FROM users WHERE id = auth.uid() LIMIT 1))
```

**After (Fixed):**
```sql
USING (user_id = auth.uid())
```

The old policy was trying to lookup in a `users` table which might return null, causing the 403 error. The new policy directly compares with `auth.uid()` which is the authenticated user's ID.

---

**After running this in Supabase, your app will work!**
