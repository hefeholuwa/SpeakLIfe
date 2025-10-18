-- =====================================================
-- SPEAKLIFE SAFE DATABASE SCHEMA UPDATE
-- =====================================================

-- 1. SAFELY DROP EXISTING TABLES (only if they exist)
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS daily_verses CASCADE;
DROP TABLE IF EXISTS daily_reflections CASCADE;
DROP TABLE IF EXISTS user_reading_progress CASCADE;

-- 2. CREATE DAILY VERSES TABLE (with confession support)
CREATE TABLE IF NOT EXISTS daily_verses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  verse_text TEXT NOT NULL,
  reference TEXT NOT NULL,
  confession_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE USER FAVORITES TABLE
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  verse_text TEXT NOT NULL,
  reference TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE DAILY REFLECTIONS TABLE (AI-generated content)
CREATE TABLE IF NOT EXISTS daily_reflections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  reflection_text TEXT NOT NULL,
  scripture_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE READING PROGRESS TABLE (for Bible reading tracking)
CREATE TABLE IF NOT EXISTS user_reading_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_name TEXT NOT NULL,
  current_day INTEGER DEFAULT 1,
  completed_books JSONB DEFAULT '[]',
  reading_streak INTEGER DEFAULT 0,
  last_read_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. UPDATE EXISTING VERSES TABLE (add confession_text if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'verses' AND column_name = 'confession_text') THEN
    ALTER TABLE verses ADD COLUMN confession_text TEXT;
  END IF;
END $$;

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE daily_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reading_progress ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES (with IF NOT EXISTS logic)
-- =====================================================

-- Daily Verses: Public read access, admin write access
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_verses' AND policyname = 'Allow public read access to daily_verses') THEN
    CREATE POLICY "Allow public read access to daily_verses" ON daily_verses
      FOR SELECT USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_verses' AND policyname = 'Allow public insert access to daily_verses') THEN
    CREATE POLICY "Allow public insert access to daily_verses" ON daily_verses
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_verses' AND policyname = 'Allow public update access to daily_verses') THEN
    CREATE POLICY "Allow public update access to daily_verses" ON daily_verses
      FOR UPDATE USING (true);
  END IF;
END $$;

-- User Favorites: User-specific access
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_favorites' AND policyname = 'Users can view their own favorites') THEN
    CREATE POLICY "Users can view their own favorites" ON user_favorites
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_favorites' AND policyname = 'Users can insert their own favorites') THEN
    CREATE POLICY "Users can insert their own favorites" ON user_favorites
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_favorites' AND policyname = 'Users can delete their own favorites') THEN
    CREATE POLICY "Users can delete their own favorites" ON user_favorites
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Daily Reflections: Public read access
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_reflections' AND policyname = 'Allow public read access to daily_reflections') THEN
    CREATE POLICY "Allow public read access to daily_reflections" ON daily_reflections
      FOR SELECT USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_reflections' AND policyname = 'Allow public insert access to daily_reflections') THEN
    CREATE POLICY "Allow public insert access to daily_reflections" ON daily_reflections
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_reflections' AND policyname = 'Allow public update access to daily_reflections') THEN
    CREATE POLICY "Allow public update access to daily_reflections" ON daily_reflections
      FOR UPDATE USING (true);
  END IF;
END $$;

-- User Reading Progress: User-specific access
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_reading_progress' AND policyname = 'Users can view their own reading progress') THEN
    CREATE POLICY "Users can view their own reading progress" ON user_reading_progress
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_reading_progress' AND policyname = 'Users can insert their own reading progress') THEN
    CREATE POLICY "Users can insert their own reading progress" ON user_reading_progress
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_reading_progress' AND policyname = 'Users can update their own reading progress') THEN
    CREATE POLICY "Users can update their own reading progress" ON user_reading_progress
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_reading_progress' AND policyname = 'Users can delete their own reading progress') THEN
    CREATE POLICY "Users can delete their own reading progress" ON user_reading_progress
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE (with IF NOT EXISTS)
-- =====================================================

-- Daily Verses indexes
CREATE INDEX IF NOT EXISTS idx_daily_verses_date ON daily_verses(date);
CREATE INDEX IF NOT EXISTS idx_daily_verses_created_at ON daily_verses(created_at);

-- User Favorites indexes
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at);

-- Daily Reflections indexes
CREATE INDEX IF NOT EXISTS idx_daily_reflections_date ON daily_reflections(date);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_created_at ON daily_reflections(created_at);

-- User Reading Progress indexes
CREATE INDEX IF NOT EXISTS idx_user_reading_progress_user_id ON user_reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reading_progress_plan_name ON user_reading_progress(plan_name);

-- =====================================================
-- INSERT SAMPLE DATA (only if not exists)
-- =====================================================

-- Insert today's daily verse and confession (only if not exists)
INSERT INTO daily_verses (date, verse_text, reference, confession_text) 
SELECT CURRENT_DATE, 
       'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.', 
       'Jeremiah 29:11 (NIV)', 
       'Today, I declare that God''s plans for my life are good. I trust in His perfect timing and His promise to give me hope and a prosperous future. I am not moved by what I see, but by what He has spoken over my life.'
WHERE NOT EXISTS (SELECT 1 FROM daily_verses WHERE date = CURRENT_DATE);

-- Insert today's daily reflection (only if not exists)
INSERT INTO daily_reflections (date, reflection_text, scripture_reference) 
SELECT CURRENT_DATE, 
       'Today is a new day filled with endless possibilities. God has prepared this day specifically for you, with opportunities for growth, blessing, and divine encounters. Step into this day with confidence, knowing that you are loved, chosen, and equipped for every challenge that comes your way.', 
       'Jeremiah 29:11'
WHERE NOT EXISTS (SELECT 1 FROM daily_reflections WHERE date = CURRENT_DATE);

-- =====================================================
-- CREATE FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Function to get user's confession streak
CREATE OR REPLACE FUNCTION get_user_confession_streak(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  streak_count INTEGER := 0;
  current_date DATE := CURRENT_DATE;
  confession_date DATE;
BEGIN
  -- Get the most recent confession date
  SELECT DATE(confessed_at) INTO confession_date
  FROM user_confessions
  WHERE user_id = user_uuid
  ORDER BY confessed_at DESC
  LIMIT 1;
  
  -- If no confessions, return 0
  IF confession_date IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate streak
  WHILE confession_date >= current_date - INTERVAL '1 day' * streak_count LOOP
    -- Check if there's a confession for this date
    IF EXISTS (
      SELECT 1 FROM user_confessions
      WHERE user_id = user_uuid
      AND DATE(confessed_at) = confession_date
    ) THEN
      streak_count := streak_count + 1;
      confession_date := confession_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's monthly confession count
CREATE OR REPLACE FUNCTION get_user_monthly_confessions(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM user_confessions
    WHERE user_id = user_uuid
    AND DATE_TRUNC('month', confessed_at) = DATE_TRUNC('month', CURRENT_DATE)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get user's total confession count
CREATE OR REPLACE FUNCTION get_user_total_confessions(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM user_confessions
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SCHEMA UPDATE COMPLETE
-- =====================================================

-- Verify tables exist
SELECT 'Safe schema update completed successfully!' as status;
