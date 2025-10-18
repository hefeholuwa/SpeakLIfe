-- Bible Features Database Schema
-- This script creates tables for bookmarks, highlights, and reading plans

-- Create bible_bookmarks table
CREATE TABLE IF NOT EXISTS bible_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book VARCHAR(100) NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bible_highlights table
CREATE TABLE IF NOT EXISTS bible_highlights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book VARCHAR(100) NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  color VARCHAR(20) DEFAULT 'yellow',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reading_plans table
CREATE TABLE IF NOT EXISTS reading_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  plan_type VARCHAR(50) DEFAULT 'daily', -- daily, weekly, custom
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reading_plan_entries table
CREATE TABLE IF NOT EXISTS reading_plan_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES reading_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  book VARCHAR(100) NOT NULL,
  start_chapter INTEGER NOT NULL,
  end_chapter INTEGER,
  start_verse INTEGER,
  end_verse INTEGER,
  notes TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create confession_journal table
CREATE TABLE IF NOT EXISTS confession_journal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200),
  content TEXT NOT NULL,
  category VARCHAR(50), -- prayer, confession, reflection, testimony
  mood VARCHAR(50), -- grateful, repentant, hopeful, etc.
  is_private BOOLEAN DEFAULT true,
  tags TEXT[], -- array of tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create push_notifications table
CREATE TABLE IF NOT EXISTS push_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- daily_verse, confession_reminder, reading_plan, etc.
  is_sent BOOLEAN DEFAULT false,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  notification_settings JSONB DEFAULT '{}',
  reading_preferences JSONB DEFAULT '{}',
  theme_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE bible_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_plan_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE confession_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bible_bookmarks
CREATE POLICY "Users can view their own bookmarks" ON bible_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" ON bible_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks" ON bible_bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON bible_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for bible_highlights
CREATE POLICY "Users can view their own highlights" ON bible_highlights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own highlights" ON bible_highlights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own highlights" ON bible_highlights
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own highlights" ON bible_highlights
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for reading_plans
CREATE POLICY "Users can view their own reading plans" ON reading_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading plans" ON reading_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading plans" ON reading_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading plans" ON reading_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for reading_plan_entries
CREATE POLICY "Users can view their own reading plan entries" ON reading_plan_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reading_plans 
      WHERE reading_plans.id = reading_plan_entries.plan_id 
      AND reading_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own reading plan entries" ON reading_plan_entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM reading_plans 
      WHERE reading_plans.id = reading_plan_entries.plan_id 
      AND reading_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own reading plan entries" ON reading_plan_entries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM reading_plans 
      WHERE reading_plans.id = reading_plan_entries.plan_id 
      AND reading_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own reading plan entries" ON reading_plan_entries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM reading_plans 
      WHERE reading_plans.id = reading_plan_entries.plan_id 
      AND reading_plans.user_id = auth.uid()
    )
  );

-- Create RLS policies for confession_journal
CREATE POLICY "Users can view their own confession journal" ON confession_journal
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own confession journal" ON confession_journal
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own confession journal" ON confession_journal
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own confession journal" ON confession_journal
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for push_notifications
CREATE POLICY "Users can view their own notifications" ON push_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" ON push_notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON push_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON push_notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bible_bookmarks_user_id ON bible_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bible_bookmarks_book_chapter_verse ON bible_bookmarks(book, chapter, verse);
CREATE INDEX IF NOT EXISTS idx_bible_highlights_user_id ON bible_highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_bible_highlights_book_chapter_verse ON bible_highlights(book, chapter, verse);
CREATE INDEX IF NOT EXISTS idx_reading_plans_user_id ON reading_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_plan_entries_plan_id ON reading_plan_entries(plan_id);
CREATE INDEX IF NOT EXISTS idx_confession_journal_user_id ON confession_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_confession_journal_created_at ON confession_journal(created_at);
CREATE INDEX IF NOT EXISTS idx_push_notifications_user_id ON push_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_push_notifications_scheduled_for ON push_notifications(scheduled_for);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_bible_bookmarks_updated_at 
  BEFORE UPDATE ON bible_bookmarks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bible_highlights_updated_at 
  BEFORE UPDATE ON bible_highlights 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_plans_updated_at 
  BEFORE UPDATE ON reading_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_confession_journal_updated_at 
  BEFORE UPDATE ON confession_journal 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
