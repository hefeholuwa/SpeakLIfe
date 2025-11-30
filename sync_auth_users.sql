-- ==========================================
-- SYNC AUTH USERS TO DATABASE PROFILES
-- ==========================================
-- Run this script to ensure all users in Supabase Auth have a corresponding profile in the 'profiles' table.
-- This is useful for migrating existing users or fixing any sync issues.

-- 1. Ensure Profiles Table Exists
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create/Update Trigger for New Users
-- This ensures FUTURE users are automatically synced
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, current_streak, longest_streak, last_activity_date)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email,
    0, 
    0, 
    NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. SYNC EXISTING USERS (The "Transfer")
-- This block iterates through all existing auth users and inserts them into profiles if missing
DO $$
DECLARE
  user_record RECORD;
  count_new INTEGER := 0;
  count_updated INTEGER := 0;
BEGIN
  FOR user_record IN SELECT * FROM auth.users LOOP
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
      user_record.id, 
      user_record.email,
      user_record.raw_user_meta_data->>'full_name'
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      -- Only update name if it is null in the existing profile
      full_name = COALESCE(profiles.full_name, EXCLUDED.full_name);
      
    IF FOUND THEN
      count_updated := count_updated + 1;
    ELSE
      count_new := count_new + 1;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Sync complete. Processed users.';
END $$;
