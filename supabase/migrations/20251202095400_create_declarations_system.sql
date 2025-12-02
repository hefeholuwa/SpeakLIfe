-- =====================================================
-- SPEAKLIFE DECLARATIONS SYSTEM
-- Core tables for declaration practice feature
-- =====================================================

-- 1. LIFE AREAS TABLE
-- Categories for organizing declarations
CREATE TABLE IF NOT EXISTS life_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- emoji or icon name
  color TEXT, -- hex color for UI
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. USER DECLARATIONS TABLE
-- User's personalized declarations
CREATE TABLE IF NOT EXISTS user_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  life_area_id UUID REFERENCES life_areas(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  declaration_text TEXT NOT NULL,
  bible_reference TEXT, -- e.g., "Philippians 4:13"
  bible_verse_text TEXT, -- actual verse text
  is_active BOOLEAN DEFAULT true,
  is_favorite BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PRACTICE SESSIONS TABLE
-- Track when users complete practice sessions
CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_seconds INTEGER, -- how long the session lasted
  declarations_count INTEGER DEFAULT 0, -- how many declarations practiced
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT, -- optional reflection notes
  UNIQUE(user_id, session_date) -- one session per day
);

-- 4. SESSION DECLARATIONS TABLE
-- Track which declarations were practiced in each session
CREATE TABLE IF NOT EXISTS session_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  declaration_id UUID NOT NULL REFERENCES user_declarations(id) ON DELETE CASCADE,
  was_spoken BOOLEAN DEFAULT false,
  voice_recording_url TEXT, -- optional: URL to recorded audio
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. PRACTICE STREAKS TABLE
-- Enhanced streak tracking specifically for practice sessions
CREATE TABLE IF NOT EXISTS practice_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_practice_date DATE,
  total_sessions INTEGER DEFAULT 0,
  total_declarations_spoken INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_declarations_user_id ON user_declarations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_declarations_life_area ON user_declarations(life_area_id);
CREATE INDEX IF NOT EXISTS idx_user_declarations_active ON user_declarations(is_active);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_date ON practice_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_session_declarations_session ON session_declarations(session_id);
CREATE INDEX IF NOT EXISTS idx_practice_streaks_user_id ON practice_streaks(user_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Life Areas: Public read, admin write
ALTER TABLE life_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view life areas"
  ON life_areas FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage life areas"
  ON life_areas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- User Declarations: Users can only manage their own
ALTER TABLE user_declarations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own declarations"
  ON user_declarations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own declarations"
  ON user_declarations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own declarations"
  ON user_declarations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own declarations"
  ON user_declarations FOR DELETE
  USING (user_id = auth.uid());

-- Practice Sessions: Users can only manage their own
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON practice_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own sessions"
  ON practice_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions"
  ON practice_sessions FOR UPDATE
  USING (user_id = auth.uid());

-- Session Declarations: Inherit from practice_sessions
ALTER TABLE session_declarations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their session declarations"
  ON session_declarations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM practice_sessions
      WHERE practice_sessions.id = session_declarations.session_id
      AND practice_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create session declarations"
  ON session_declarations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM practice_sessions
      WHERE practice_sessions.id = session_declarations.session_id
      AND practice_sessions.user_id = auth.uid()
    )
  );

-- Practice Streaks: Users can only manage their own
ALTER TABLE practice_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own streaks"
  ON practice_streaks FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own streaks"
  ON practice_streaks FOR ALL
  USING (user_id = auth.uid());

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_life_areas_updated_at ON life_areas;
CREATE TRIGGER update_life_areas_updated_at
  BEFORE UPDATE ON life_areas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_declarations_updated_at ON user_declarations;
CREATE TRIGGER update_user_declarations_updated_at
  BEFORE UPDATE ON user_declarations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_practice_streaks_updated_at ON practice_streaks;
CREATE TRIGGER update_practice_streaks_updated_at
  BEFORE UPDATE ON practice_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update practice streak
CREATE OR REPLACE FUNCTION update_practice_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_streak_record RECORD;
  v_days_since_last INTEGER;
BEGIN
  -- Get or create streak record
  SELECT * INTO v_streak_record
  FROM practice_streaks
  WHERE user_id = NEW.user_id;

  IF NOT FOUND THEN
    -- Create new streak record
    INSERT INTO practice_streaks (user_id, current_streak, longest_streak, last_practice_date, total_sessions, total_declarations_spoken)
    VALUES (NEW.user_id, 1, 1, NEW.session_date, 1, NEW.declarations_count);
  ELSE
    -- Calculate days since last practice
    v_days_since_last := NEW.session_date - v_streak_record.last_practice_date;

    IF v_days_since_last = 1 THEN
      -- Consecutive day: increment streak
      UPDATE practice_streaks
      SET 
        current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_practice_date = NEW.session_date,
        total_sessions = total_sessions + 1,
        total_declarations_spoken = total_declarations_spoken + NEW.declarations_count
      WHERE user_id = NEW.user_id;
    ELSIF v_days_since_last = 0 THEN
      -- Same day: just update counts
      UPDATE practice_streaks
      SET 
        total_sessions = total_sessions + 1,
        total_declarations_spoken = total_declarations_spoken + NEW.declarations_count
      WHERE user_id = NEW.user_id;
    ELSE
      -- Streak broken: reset to 1
      UPDATE practice_streaks
      SET 
        current_streak = 1,
        last_practice_date = NEW.session_date,
        total_sessions = total_sessions + 1,
        total_declarations_spoken = total_declarations_spoken + NEW.declarations_count
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update streak when session is completed
DROP TRIGGER IF EXISTS update_streak_on_session ON practice_sessions;
CREATE TRIGGER update_streak_on_session
  AFTER INSERT ON practice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_practice_streak();

-- =====================================================
-- SEED DATA: DEFAULT LIFE AREAS
-- =====================================================

INSERT INTO life_areas (name, description, icon, color, sort_order) VALUES
  ('Faith & Spirituality', 'Declarations about your relationship with God, spiritual growth, and faith journey', '🙏', '#9333EA', 1),
  ('Health & Wellness', 'Declarations about physical health, mental wellness, and overall well-being', '💪', '#10B981', 2),
  ('Relationships', 'Declarations about family, friendships, marriage, and social connections', '❤️', '#EF4444', 3),
  ('Finances & Provision', 'Declarations about financial abundance, provision, and stewardship', '💰', '#F59E0B', 4),
  ('Career & Purpose', 'Declarations about your calling, career, and life purpose', '🎯', '#3B82F6', 5),
  ('Peace & Joy', 'Declarations about inner peace, joy, and emotional stability', '😊', '#EC4899', 6),
  ('Wisdom & Knowledge', 'Declarations about gaining wisdom, understanding, and discernment', '📚', '#8B5CF6', 7),
  ('Protection & Safety', 'Declarations about God''s protection, safety, and security', '🛡️', '#6366F1', 8)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SAMPLE DECLARATIONS (for testing)
-- =====================================================

-- Note: These will be inserted per-user through the app
-- This is just a reference of the structure

COMMENT ON TABLE user_declarations IS 'Stores user-created declarations for daily practice';
COMMENT ON TABLE practice_sessions IS 'Tracks daily practice sessions and completion';
COMMENT ON TABLE practice_streaks IS 'Maintains practice streak data for gamification';
COMMENT ON TABLE life_areas IS 'Categories for organizing declarations by life area';
