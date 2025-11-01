/*
  # Fix user registration for anonymous users

  1. Security Updates
    - Drop existing restrictive INSERT policy
    - Create new policy allowing anonymous (anon) role to register
    - Maintain security for authenticated operations

  This allows unauthenticated users to create accounts while keeping
  other operations secure and restricted to authenticated users only.
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow user registration" ON users;

-- Create a new policy that allows anonymous users to register
CREATE POLICY "Allow anonymous user registration"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Ensure the existing policies for authenticated users remain
-- (These should already exist from previous migrations)