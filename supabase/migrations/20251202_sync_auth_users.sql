-- Create function to sync auth.users to public.users
-- This ensures that when a user signs up via Supabase Auth, 
-- they also get a row in the public.users table for foreign key relationships

-- First, drop the function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, username, password_hash)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    -- Generate unique username by appending user id suffix
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)) || '_' || SUBSTRING(NEW.id::text, 1, 8),
    'supabase_auth' -- placeholder since real password is in auth.users
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also handle existing auth users that don't have a public.users row
-- This is important for users who signed up before this migration
INSERT INTO public.users (id, email, full_name, username, password_hash)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  -- Generate unique username by appending user id suffix to avoid duplicates
  COALESCE(
    au.raw_user_meta_data->>'username', 
    SPLIT_PART(au.email, '@', 1)
  ) || '_' || SUBSTRING(au.id::text, 1, 8),
  'supabase_auth'
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;
