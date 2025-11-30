-- COMPLETE DATABASE SETUP & FIX SCRIPT
-- Run this script in your Supabase SQL Editor to fix all table permissions and missing functions

-- ==========================================
-- 1. BIBLE FEATURES (Bookmarks & Highlights)
-- ==========================================

CREATE TABLE IF NOT EXISTS bible_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book VARCHAR(100) NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bible_highlights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book VARCHAR(100) NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  color VARCHAR(20) DEFAULT 'yellow',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bible_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_highlights ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bible_bookmarks;
DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON bible_bookmarks;
DROP POLICY IF EXISTS "Users can update their own bookmarks" ON bible_bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bible_bookmarks;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON bible_bookmarks;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON bible_bookmarks;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON bible_bookmarks;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON bible_bookmarks;

DROP POLICY IF EXISTS "Users can view their own highlights" ON bible_highlights;
DROP POLICY IF EXISTS "Users can insert their own highlights" ON bible_highlights;
DROP POLICY IF EXISTS "Users can update their own highlights" ON bible_highlights;
DROP POLICY IF EXISTS "Users can delete their own highlights" ON bible_highlights;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON bible_highlights;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON bible_highlights;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON bible_highlights;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON bible_highlights;

-- Create policies
CREATE POLICY "Users can view their own bookmarks" ON bible_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bookmarks" ON bible_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bookmarks" ON bible_bookmarks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookmarks" ON bible_bookmarks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own highlights" ON bible_highlights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own highlights" ON bible_highlights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own highlights" ON bible_highlights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own highlights" ON bible_highlights FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bible_bookmarks_user_id ON bible_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bible_highlights_user_id ON bible_highlights(user_id);


-- ==========================================
-- 2. DAILY CONTENT (Verses)
-- ==========================================

CREATE TABLE IF NOT EXISTS daily_verses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  verse_text TEXT NOT NULL,
  reference VARCHAR(100) NOT NULL,
  confession_text TEXT,
  translation VARCHAR(20) DEFAULT 'KJV',
  theme VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE daily_verses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON daily_verses;
DROP POLICY IF EXISTS "Enable insert for all users" ON daily_verses;
DROP POLICY IF EXISTS "Enable update for all users" ON daily_verses;
DROP POLICY IF EXISTS "Enable delete for all users" ON daily_verses;

-- Create permissive policies (Public Read, Public Write for Admin simplicity)
-- WARNING: In production, restrict write access to admin users only
CREATE POLICY "Enable read access for all users" ON daily_verses FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON daily_verses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON daily_verses FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON daily_verses FOR DELETE USING (true);


-- ==========================================
-- 3. TOPICS & CONTENT
-- ==========================================

CREATE TABLE IF NOT EXISTS topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(10),
  color VARCHAR(20),
  usage_count INTEGER DEFAULT 0,
  popularity_score FLOAT DEFAULT 0.0,
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS topic_verses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  verse_text TEXT NOT NULL,
  reference VARCHAR(100) NOT NULL,
  book VARCHAR(50),
  chapter INTEGER,
  verse INTEGER,
  translation VARCHAR(20) DEFAULT 'KJV',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS topic_confessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  confession_text TEXT NOT NULL,
  title VARCHAR(100),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_confessions ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for Topics
DROP POLICY IF EXISTS "Enable read access for all users" ON topics;
DROP POLICY IF EXISTS "Enable insert for all users" ON topics;
DROP POLICY IF EXISTS "Enable update for all users" ON topics;
DROP POLICY IF EXISTS "Enable delete for all users" ON topics;

CREATE POLICY "Enable read access for all users" ON topics FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON topics FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON topics FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON topics FOR DELETE USING (true);

-- Create permissive policies for Topic Verses
DROP POLICY IF EXISTS "Enable read access for all users" ON topic_verses;
DROP POLICY IF EXISTS "Enable insert for all users" ON topic_verses;
DROP POLICY IF EXISTS "Enable update for all users" ON topic_verses;
DROP POLICY IF EXISTS "Enable delete for all users" ON topic_verses;

CREATE POLICY "Enable read access for all users" ON topic_verses FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON topic_verses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON topic_verses FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON topic_verses FOR DELETE USING (true);

-- Create permissive policies for Topic Confessions
DROP POLICY IF EXISTS "Enable read access for all users" ON topic_confessions;
DROP POLICY IF EXISTS "Enable insert for all users" ON topic_confessions;
DROP POLICY IF EXISTS "Enable update for all users" ON topic_confessions;
DROP POLICY IF EXISTS "Enable delete for all users" ON topic_confessions;

CREATE POLICY "Enable read access for all users" ON topic_confessions FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON topic_confessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON topic_confessions FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON topic_confessions FOR DELETE USING (true);


-- ==========================================
-- 4. ANALYTICS (Topic Views)
-- ==========================================

CREATE TABLE IF NOT EXISTS topic_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  view_date DATE NOT NULL DEFAULT CURRENT_DATE,
  view_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(topic_id, user_id, view_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_topic_views_topic_id ON topic_views(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_views_view_date ON topic_views(view_date);

-- Enable RLS
ALTER TABLE topic_views ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON topic_views;
DROP POLICY IF EXISTS "Enable insert for all users" ON topic_views;
DROP POLICY IF EXISTS "Enable update for all users" ON topic_views;

CREATE POLICY "Enable read access for all users" ON topic_views FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON topic_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON topic_views FOR UPDATE USING (true);

-- RPC Functions for Analytics
CREATE OR REPLACE FUNCTION get_topic_daily_views(topic_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(view_count), 0)
    FROM topic_views 
    WHERE topic_id = topic_uuid 
    AND view_date = CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_topic_view(topic_uuid UUID, user_uuid UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  INSERT INTO topic_views (topic_id, user_id, view_count)
  VALUES (topic_uuid, user_uuid, 1)
  ON CONFLICT (topic_id, user_id, view_date)
  DO UPDATE SET 
    view_count = topic_views.view_count + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Helper function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_topic_views_updated_at ON topic_views;
CREATE TRIGGER update_topic_views_updated_at
  BEFORE UPDATE ON topic_views
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
