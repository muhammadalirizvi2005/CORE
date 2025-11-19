# How to Fix "Failed to Save Wellness Entry" Error

## The Problem
You're getting a "Failed to save wellness entry" error because the database Row Level Security (RLS) policies haven't been applied to your Supabase project yet.

## The Solution - Apply SQL Migration

Follow these steps exactly:

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/msfwykwgukbazmhsmjso/sql/new
2. This opens the SQL Editor for your project

### Step 2: Copy the SQL Migration
1. Open the file: `supabase/migrations/20251119_fix_tasks_rls_policy.sql`
2. Copy ALL the contents (Cmd+A, then Cmd+C)

### Step 3: Run the Migration
1. Paste the SQL into the Supabase SQL Editor
2. Click the "Run" button (or press Cmd+Enter)
3. You should see "Success. No rows returned"

### Step 4: Verify It Works
1. Go back to your app at http://localhost:5173
2. Make sure you're logged in
3. Go to the Wellness tab
4. Try to save a wellness entry
5. It should work now!

## Quick Test
After applying the SQL, you can verify it's working by running:
```bash
node test-wellness.mjs
```

This will test if wellness entries can be created (you need to be logged in first).

## What This SQL Does
- Fixes RLS policies for tasks, courses, assignments, wellness_entries, pomodoro_sessions, and study_groups
- Changes from broken user lookup pattern to direct `auth.uid()` checks
- Allows authenticated users to manage their own data

## Still Having Issues?
1. Make sure you're logged into the app
2. Check browser console (F12) for the exact error message
3. Verify you ran the SQL in the correct Supabase project
4. Try logging out and back in
