-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL, -- e.g., 'Trophy', 'Star', 'Flame' (Lucide icon names)
  category TEXT NOT NULL, -- 'Challenge', 'Reading', 'Community', 'General'
  criteria JSONB DEFAULT '{}'::jsonb, -- e.g., { "type": "challenge_completion", "count": 1 }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_badges table (join table)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Policies for badges (Public read, Admin write)
CREATE POLICY "Badges are viewable by everyone" ON badges
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert badges" ON badges
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins can update badges" ON badges
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Policies for user_badges (Users can see their own, System/Admin can insert)
CREATE POLICY "Users can view their own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id); 
  -- Note: Ideally, this should be restricted to server-side functions, 
  -- but for this app architecture, we'll allow the client to award badges 
  -- via the badgeService (which runs as the user).

-- Seed Initial Badges
INSERT INTO badges (name, description, icon_name, category, criteria) VALUES
('First Step', 'Completed your first challenge day.', 'Footprints', 'Challenge', '{"type": "challenge_day", "count": 1}'),
('Challenge Champion', 'Completed a full spiritual bootcamp.', 'Trophy', 'Challenge', '{"type": "challenge_complete", "count": 1}'),
('Scripture Scholar', 'Completed a reading plan.', 'Scroll', 'Reading', '{"type": "plan_complete", "count": 1}'),
('Consistent Spirit', 'Completed 3 days in a row.', 'Flame', 'General', '{"type": "streak", "count": 3}'),
('Prayer Warrior', 'Created 5 journal entries.', 'HandsPraying', 'General', '{"type": "journal_count", "count": 5}')
ON CONFLICT DO NOTHING;
