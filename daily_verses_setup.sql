-- Create daily_verses table for storing daily scripture and confession
CREATE TABLE IF NOT EXISTS daily_verses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  verse_text TEXT NOT NULL,
  reference TEXT NOT NULL,
  confession_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_favorites table for storing user's favorite verses
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  verse_text TEXT NOT NULL,
  reference TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE daily_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_verses (public read access)
CREATE POLICY "Allow public read access to daily_verses" ON daily_verses
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to daily_verses" ON daily_verses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to daily_verses" ON daily_verses
  FOR UPDATE USING (true);

-- Create policies for user_favorites (user-specific access)
CREATE POLICY "Users can view their own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_verses_date ON daily_verses(date);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at);
