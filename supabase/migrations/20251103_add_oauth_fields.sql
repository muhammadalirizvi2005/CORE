-- Migration: add oauth fields to users table and create user_oauth_tokens table
-- Run this migration in Supabase SQL editor or your migration pipeline

BEGIN;

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS canvas_base_url text,
  ADD COLUMN IF NOT EXISTS canvas_connected boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS calendar_url text,
  ADD COLUMN IF NOT EXISTS calendar_connected boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_web_url text;

-- Table to securely store provider tokens (consider encrypting sensitive fields at rest)
CREATE TABLE IF NOT EXISTS public.user_oauth_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  scope text,
  token_type text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

COMMIT;
