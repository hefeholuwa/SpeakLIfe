-- ==========================================
-- READING PLANS FEATURE
-- ==========================================

-- 1. Plans Table (The available plans)
CREATE TABLE IF NOT EXISTS reading_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  image_gradient VARCHAR(50) DEFAULT 'from-blue-500 to-cyan-500',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Plan Days Table (The content for each day)
CREATE TABLE IF NOT EXISTS reading_plan_days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES reading_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  reading_reference VARCHAR(100) NOT NULL, -- e.g. "Proverbs 1"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, day_number)
);

-- 3. User Progress Table (Tracking what users have done)
CREATE TABLE IF NOT EXISTS user_plan_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES reading_plans(id) ON DELETE CASCADE,
  day_id UUID REFERENCES reading_plan_days(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, plan_id, day_id) -- Prevent duplicate completions
);

-- Enable RLS
ALTER TABLE reading_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plan_progress ENABLE ROW LEVEL SECURITY;

-- Policies
-- Plans are public read
CREATE POLICY "Everyone can view plans" ON reading_plans FOR SELECT USING (true);
CREATE POLICY "Everyone can view plan days" ON reading_plan_days FOR SELECT USING (true);

-- User progress is private
CREATE POLICY "Users can view own progress" ON user_plan_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_plan_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own progress" ON user_plan_progress FOR DELETE USING (auth.uid() = user_id);

-- Seed Data: Proverbs Plan
DO $$
DECLARE
  plan_id UUID;
BEGIN
  -- Insert Plan
  INSERT INTO reading_plans (title, description, duration_days, image_gradient)
  VALUES ('Proverbs in 31 Days', 'Gain wisdom for daily living by reading one chapter of Proverbs each day.', 31, 'from-amber-500 to-orange-500')
  RETURNING id INTO plan_id;

  -- Insert 31 Days
  FOR i IN 1..31 LOOP
    INSERT INTO reading_plan_days (plan_id, day_number, reading_reference)
    VALUES (plan_id, i, 'Proverbs ' || i);
  END LOOP;
END $$;

-- Seed Data: Gospels Plan
DO $$
DECLARE
  plan_id UUID;
BEGIN
  INSERT INTO reading_plans (title, description, duration_days, image_gradient)
  VALUES ('The Gospels in 90 Days', 'Walk with Jesus through Matthew, Mark, Luke, and John.', 90, 'from-blue-500 to-cyan-500')
  RETURNING id INTO plan_id;

  -- Just adding first few days for demo
  INSERT INTO reading_plan_days (plan_id, day_number, reading_reference) VALUES (plan_id, 1, 'Matthew 1');
  INSERT INTO reading_plan_days (plan_id, day_number, reading_reference) VALUES (plan_id, 2, 'Matthew 2');
  INSERT INTO reading_plan_days (plan_id, day_number, reading_reference) VALUES (plan_id, 3, 'Matthew 3');
END $$;
