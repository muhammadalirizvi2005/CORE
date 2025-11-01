/*
  # Fix User Registration RLS Policy

  1. Security Updates
    - Update INSERT policy to allow public user registration
    - Users can register without being authenticated first
    - Maintain security for other operations (SELECT, UPDATE still require authentication)

  2. Changes
    - Modified "Allow user registration" policy to use 'true' condition
    - This allows anyone to create a new user account during registration
    - Other policies remain restrictive for data protection
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Allow user registration" ON users;

-- Create a new policy that allows public user registration
CREATE POLICY "Allow user registration"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);