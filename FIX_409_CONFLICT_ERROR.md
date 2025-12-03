# Fix 409 Conflict Error - Course Creation

## Problem
Getting a **409 Conflict** error when trying to create a course. This is a database constraint violation.

## Root Cause
The `courses` table has a foreign key to `public.users(id)`, but when users sign up through Supabase Auth, they're only added to `auth.users`, NOT `public.users`. This breaks the foreign key constraint.

## Solution
Run the new migration that syncs auth users to public users automatically.

## Steps to Fix

### 1. Run the New Migration

Go to your Supabase Dashboard and run this SQL:

**Location**: `supabase/migrations/20251202_sync_auth_users.sql`

Or copy and paste this SQL into your Supabase SQL Editor:

```sql
-- Create function to sync auth.users to public.users
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, username, password_hash)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    'supabase_auth'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Sync existing auth users
INSERT INTO public.users (id, email, full_name, username, password_hash)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  COALESCE(au.raw_user_meta_data->>'username', SPLIT_PART(au.email, '@', 1)),
  'supabase_auth'
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;
```

### 2. Verify the Fix

After running the migration:

1. Refresh your app at http://localhost:5173/
2. Log in if needed
3. Go to **Grades** tab
4. Click **Add Course**
5. Fill in:
   - Course Name: "Test Course"
   - Course Code: "TEST101"
   - Credits: 3
   - Target Grade: 90
6. Click **Create Course**
7. ✅ It should work now!

## What This Migration Does

1. **Creates a trigger function** (`handle_new_user()`) that:
   - Runs automatically when someone signs up via Supabase Auth
   - Inserts their info into `public.users` table
   - Uses email as fallback for username/full_name if not provided

2. **Creates the trigger** on `auth.users` table:
   - Fires after each INSERT (new signup)
   - Calls the `handle_new_user()` function

3. **Syncs existing users**:
   - Finds all users in `auth.users` that don't exist in `public.users`
   - Adds them to `public.users`
   - This fixes the issue for your current account!

## Why This Happened

When you sign up using Supabase Auth:
- User is added to `auth.users` ✅
- BUT not added to `public.users` ❌

When you try to create a course:
- Database tries to insert: `{ user_id: "your-uuid", name: "Course Name", ... }`
- Foreign key constraint checks: Does this user_id exist in `public.users`?
- Answer: NO! ❌
- Result: 409 CONFLICT error

## After This Fix

When new users sign up:
- User added to `auth.users` ✅
- **Trigger automatically adds them to `public.users`** ✅
- Foreign keys work correctly ✅
- Course creation succeeds ✅

## Quick Test Commands

After running the migration, verify users were synced:

```sql
-- Check if your user exists in public.users
SELECT id, email, username FROM public.users;

-- Should return at least one row with your account
```

If you see your user there, you're good to go! 🚀
