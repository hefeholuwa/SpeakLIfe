-- Fix RLS Policies for Bible Features
-- This script creates the tables and policies needed for bookmarking and highlighting

-- Create bible_bookmarks table if it doesn't exist
CREATE TABLE IF NOT EXISTS bible_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book VARCHAR(100) NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bible_highlights table if it doesn't exist
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bible_bookmarks;
DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON bible_bookmarks;
DROP POLICY IF EXISTS "Users can update their own bookmarks" ON bible_bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bible_bookmarks;

DROP POLICY IF EXISTS "Users can view their own highlights" ON bible_highlights;
DROP POLICY IF EXISTS "Users can insert their own highlights" ON bible_highlights;
DROP POLICY IF EXISTS "Users can update their own highlights" ON bible_highlights;
DROP POLICY IF EXISTS "Users can delete their own highlights" ON bible_highlights;

-- Create new RLS policies for bible_bookmarks
CREATE POLICY "Users can view their own bookmarks" ON bible_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" ON bible_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks" ON bible_bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON bible_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Create new RLS policies for bible_highlights
CREATE POLICY "Users can view their own highlights" ON bible_highlights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own highlights" ON bible_highlights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own highlights" ON bible_highlights
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own highlights" ON bible_highlights
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bible_bookmarks_user_id ON bible_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bible_highlights_user_id ON bible_highlights(user_id);
