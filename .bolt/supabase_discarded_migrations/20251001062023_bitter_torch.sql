/*
  # Fix RLS Policies for User Authentication

  1. Security Changes
    - Drop existing restrictive policies
    - Create proper policy for anonymous user registration
    - Maintain security for authenticated operations

  2. Policies
    - Allow anonymous users to register (INSERT)
    - Allow users to read their own data (SELECT)
    - Allow users to update their own data (UPDATE)
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Allow anonymous user registration" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create policy to allow anonymous user registration
CREATE POLICY "Enable insert for anonymous users" ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy for users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Create policy for users to update their own data  
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);