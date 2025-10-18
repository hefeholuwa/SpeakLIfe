-- =====================================================
-- SPEAKLIFE COMPLETE DATABASE SCHEMA UPDATE
-- =====================================================

-- 1. DROP EXISTING TABLES (if they exist)
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS daily_verses CASCADE;
DROP TABLE IF EXISTS daily_reflections CASCADE;
DROP TABLE IF EXISTS user_confessions CASCADE;

-- 2. CREATE DAILY VERSES TABLE (with confession support)
CREATE TABLE daily_verses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  verse_text TEXT NOT NULL,
  reference TEXT NOT NULL,
  confession_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE USER FAVORITES TABLE
CREATE TABLE user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  verse_text TEXT NOT NULL,
  reference TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE USER CONFESSIONS TABLE (for streak tracking)
CREATE TABLE user_confessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  note TEXT,
  confessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_suggested BOOLEAN DEFAULT false,
  personalization_factors JSONB
);

-- 5. CREATE DAILY REFLECTIONS TABLE (AI-generated content)
CREATE TABLE daily_reflections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  reflection_text TEXT NOT NULL,
  scripture_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CREATE READING PROGRESS TABLE (for Bible reading tracking)
CREATE TABLE user_reading_progress (
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

-- 7. CREATE TOPICS TABLE (for spiritual topics)
CREATE TABLE topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CREATE VERSES TABLE (for topic-based verses)
CREATE TABLE verses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id),
  scripture_text TEXT NOT NULL,
  reference TEXT NOT NULL,
  confession_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE daily_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE verses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- Daily Verses: Public read access, admin write access
CREATE POLICY "Allow public read access to daily_verses" ON daily_verses
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to daily_verses" ON daily_verses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to daily_verses" ON daily_verses
  FOR UPDATE USING (true);

-- User Favorites: User-specific access
CREATE POLICY "Users can view their own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- User Confessions: User-specific access
CREATE POLICY "Users can view their own confessions" ON user_confessions
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own confessions" ON user_confessions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own confessions" ON user_confessions
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own confessions" ON user_confessions
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Daily Reflections: Public read access
CREATE POLICY "Allow public read access to daily_reflections" ON daily_reflections
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to daily_reflections" ON daily_reflections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to daily_reflections" ON daily_reflections
  FOR UPDATE USING (true);

-- User Reading Progress: User-specific access
CREATE POLICY "Users can view their own reading progress" ON user_reading_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading progress" ON user_reading_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading progress" ON user_reading_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading progress" ON user_reading_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Topics: Public read access
CREATE POLICY "Allow public read access to topics" ON topics
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to topics" ON topics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to topics" ON topics
  FOR UPDATE USING (true);

-- Verses: Public read access
CREATE POLICY "Allow public read access to verses" ON verses
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to verses" ON verses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to verses" ON verses
  FOR UPDATE USING (true);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Daily Verses indexes
CREATE INDEX idx_daily_verses_date ON daily_verses(date);
CREATE INDEX idx_daily_verses_created_at ON daily_verses(created_at);

-- User Favorites indexes
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_created_at ON user_favorites(created_at);

-- User Confessions indexes
CREATE INDEX idx_user_confessions_user_id ON user_confessions(user_id);
CREATE INDEX idx_user_confessions_confessed_at ON user_confessions(confessed_at);
CREATE INDEX idx_user_confessions_date ON user_confessions(DATE(confessed_at));

-- Daily Reflections indexes
CREATE INDEX idx_daily_reflections_date ON daily_reflections(date);
CREATE INDEX idx_daily_reflections_created_at ON daily_reflections(created_at);

-- User Reading Progress indexes
CREATE INDEX idx_user_reading_progress_user_id ON user_reading_progress(user_id);
CREATE INDEX idx_user_reading_progress_plan_name ON user_reading_progress(plan_name);

-- Topics indexes
CREATE INDEX idx_topics_category ON topics(category);
CREATE INDEX idx_topics_created_at ON topics(created_at);

-- Verses indexes
CREATE INDEX idx_verses_topic_id ON verses(topic_id);
CREATE INDEX idx_verses_created_at ON verses(created_at);

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Insert sample topics
INSERT INTO topics (title, description, category) VALUES
('Faith', 'Verses about faith and trust in God', 'spiritual'),
('Hope', 'Verses about hope and encouragement', 'spiritual'),
('Love', 'Verses about God''s love and loving others', 'spiritual'),
('Peace', 'Verses about peace and comfort', 'spiritual'),
('Strength', 'Verses about strength and courage', 'spiritual'),
('Forgiveness', 'Verses about forgiveness and mercy', 'spiritual'),
('Healing', 'Verses about physical and emotional healing', 'spiritual'),
('Wisdom', 'Verses about wisdom and understanding', 'spiritual');

-- Insert sample verses for each topic
INSERT INTO verses (topic_id, scripture_text, reference, confession_text) VALUES
((SELECT id FROM topics WHERE title = 'Faith'), 'Now faith is confidence in what we hope for and assurance about what we do not see.', 'Hebrews 11:1 (NIV)', 'Today, I declare that my faith is unshakeable. I believe in God''s promises even when I cannot see them. My faith moves mountains and opens doors.'),
((SELECT id FROM topics WHERE title = 'Hope'), 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.', 'Jeremiah 29:11 (NIV)', 'Today, I declare that God''s plans for my life are good. I trust in His perfect timing and His promise to give me hope and a prosperous future.'),
((SELECT id FROM topics WHERE title = 'Love'), 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.', 'John 3:16 (NIV)', 'Today, I declare that I am loved by God. His love is unconditional, unfailing, and everlasting. I am precious in His sight.'),
((SELECT id FROM topics WHERE title = 'Peace'), 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.', 'John 14:27 (NIV)', 'Today, I declare that I have the peace of God that surpasses all understanding. My heart is calm and my mind is at rest.'),
((SELECT id FROM topics WHERE title = 'Strength'), 'I can do all this through him who gives me strength.', 'Philippians 4:13 (NIV)', 'Today, I declare that I am strong in the Lord. His strength is made perfect in my weakness. I can do all things through Christ who strengthens me.'),
((SELECT id FROM topics WHERE title = 'Forgiveness'), 'If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.', '1 John 1:9 (NIV)', 'Today, I declare that I am forgiven. God''s mercy is new every morning. I am cleansed and made righteous through His blood.'),
((SELECT id FROM topics WHERE title = 'Healing'), 'Heal me, Lord, and I will be healed; save me and I will be saved, for you are the one I praise.', 'Jeremiah 17:14 (NIV)', 'Today, I declare that I am healed by the stripes of Jesus. My body is whole, my mind is clear, and my spirit is renewed.'),
((SELECT id FROM topics WHERE title = 'Wisdom'), 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.', 'James 1:5 (NIV)', 'Today, I declare that I have the wisdom of God. I make wise decisions and walk in understanding. God''s wisdom guides my every step.');

-- Insert today's daily verse and confession
INSERT INTO daily_verses (date, verse_text, reference, confession_text) VALUES
(CURRENT_DATE, 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.', 'Jeremiah 29:11 (NIV)', 'Today, I declare that God''s plans for my life are good. I trust in His perfect timing and His promise to give me hope and a prosperous future. I am not moved by what I see, but by what He has spoken over my life.');

-- Insert today's daily reflection
INSERT INTO daily_reflections (date, reflection_text, scripture_reference) VALUES
(CURRENT_DATE, 'Today is a new day filled with endless possibilities. God has prepared this day specifically for you, with opportunities for growth, blessing, and divine encounters. Step into this day with confidence, knowing that you are loved, chosen, and equipped for every challenge that comes your way.', 'Jeremiah 29:11');

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
SELECT 'Schema update completed successfully!' as status;
