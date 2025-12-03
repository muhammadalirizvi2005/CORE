# Fix: "Failed to create course" Error

## Problem
When creating a new course in the Grades tab, you get an error: **"ERROR: Failed to create course"**

## Root Cause
The Row Level Security (RLS) policies in your Supabase database have a bug in the `courses` table policy. The policy is checking:
```sql
user_id = (SELECT id FROM users WHERE id = auth.uid() LIMIT 1)
```

This subquery fails because:
1. It references a `users` table that doesn't exist in your schema
2. Supabase uses `auth.users` (in the auth schema), not `public.users`

## Solution
Run the migration that fixes all RLS policies to use `auth.uid()` directly.

## Steps to Fix

### Option 1: Apply via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/msfwykwgukbazmhsmjso

2. Click on **SQL Editor** in the left sidebar

3. Copy the entire contents of the file: `supabase/migrations/20251119_fix_tasks_rls_policy.sql`

4. Paste it into the SQL Editor

5. Click **Run** (or press Cmd/Ctrl + Enter)

6. You should see success messages for all the policies being updated

7. Test creating a course again - it should work!

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
cd /Users/muhammadalirizvi/CORE
supabase db push
```

This will apply all pending migrations.

### Option 3: Manual SQL (if migration file is lost)

Run this SQL in your Supabase SQL Editor:

```sql
-- Fix courses table RLS policy
DROP POLICY IF EXISTS "Users can manage their own courses" ON courses;
CREATE POLICY "Users can manage their own courses"
  ON courses
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

## Verify the Fix

1. Go to your app at https://core.illinihunt.org
2. Log in to your account
3. Navigate to the **Grades** tab
4. Click **Add Course**
5. Fill in:
   - Course Name: "Test Course"
   - Course Code: "TEST101"
   - Credits: 3
   - Target Grade: 90
6. Click **Create Course** (or Submit)
7. The course should be created successfully without errors

## What This Migration Fixes

The migration `20251119_fix_tasks_rls_policy.sql` updates RLS policies for:
- ✅ tasks
- ✅ courses (this is what's causing your error)
- ✅ assignments
- ✅ wellness_entries
- ✅ pomodoro_sessions
- ✅ study_groups
- ✅ study_group_members

All policies are simplified to use `auth.uid()` directly instead of the buggy subquery.

## Technical Details

### Before (Buggy):
```sql
CREATE POLICY "Users can manage their own courses"
  ON courses
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE id = auth.uid() LIMIT 1))
  WITH CHECK (user_id = (SELECT id FROM users WHERE id = auth.uid() LIMIT 1));
```

### After (Fixed):
```sql
CREATE POLICY "Users can manage their own courses"
  ON courses
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

## Why This Happens

Supabase's `auth.uid()` returns the UUID of the currently authenticated user. There's no need to query a users table - we can compare it directly to the `user_id` column in your tables.

The original migration tried to be extra safe by checking if the user exists, but this backfired because:
1. The `users` table doesn't exist (Supabase manages users in `auth.users`)
2. Even if it did, the subquery is unnecessary and causes performance issues

## If You Still Get Errors

1. **Check browser console** - Open DevTools (F12), go to Console tab, and look for red errors
2. **Check Supabase logs** - Go to Supabase Dashboard → Logs → check for RLS policy errors
3. **Verify user is authenticated** - Make sure you're logged in
4. **Clear cache** - Try a hard refresh (Cmd+Shift+R or Ctrl+Shift+F5)
5. **Check environment** - Verify your production site is using the correct Supabase project URL and anon key

## Need More Help?

If the error persists after running the migration, check:
- Supabase Dashboard → Database → Tables → courses → verify the table exists
- Supabase Dashboard → Authentication → Policies → verify the new policy is active
- Browser console for the exact Supabase error message
