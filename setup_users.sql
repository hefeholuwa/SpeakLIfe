-- ==========================================
-- USER MANAGEMENT & PROFILES SETUP
-- ==========================================

-- 1. Create Profiles Table
-- This table extends the default auth.users table with application-specific data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT, -- Optional: cache email for easier access
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Public profiles are viewable by everyone (e.g. for leaderboards or social features)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);

-- Users can insert their own profile (usually handled by trigger, but good for backup)
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- 4. Automatic Profile Creation Trigger
-- This function runs every time a new user signs up via Supabase Auth
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
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Streak Management Function
-- Updates user streaks based on daily activity
CREATE OR REPLACE FUNCTION update_streak()
RETURNS JSONB AS $$
DECLARE
  user_profile profiles%ROWTYPE;
  today DATE := CURRENT_DATE;
  yesterday DATE := CURRENT_DATE - 1;
  new_streak INTEGER;
  new_longest INTEGER;
BEGIN
  -- Get current profile
  SELECT * INTO user_profile FROM profiles WHERE id = auth.uid();
  
  -- If no profile exists (safety net), create one
  IF NOT FOUND THEN
    INSERT INTO profiles (id, current_streak, longest_streak, last_activity_date)
    VALUES (auth.uid(), 1, 1, today)
    RETURNING * INTO user_profile;
    RETURN jsonb_build_object('current_streak', 1, 'longest_streak', 1, 'message', 'First day!');
  END IF;

  -- If already active today, just return current stats
  IF user_profile.last_activity_date = today THEN
    RETURN jsonb_build_object('current_streak', user_profile.current_streak, 'longest_streak', user_profile.longest_streak, 'message', 'Already active today');
  END IF;

  -- Calculate new streak logic
  IF user_profile.last_activity_date = yesterday THEN
    new_streak := user_profile.current_streak + 1;
  ELSE
    new_streak := 1; -- Reset streak if day missed
  END IF;
  
  new_longest := GREATEST(new_streak, user_profile.longest_streak);

  -- Update profile with new stats
  UPDATE profiles
  SET 
    current_streak = new_streak,
    longest_streak = new_longest,
    last_activity_date = today,
    updated_at = NOW()
  WHERE id = auth.uid();

  RETURN jsonb_build_object('current_streak', new_streak, 'longest_streak', new_longest, 'message', 'Streak updated');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Backfill Existing Users
-- Ensures all current users in auth.users have a corresponding profile
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT * FROM auth.users LOOP
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
      user_record.id, 
      user_record.email,
      user_record.raw_user_meta_data->>'full_name'
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;
