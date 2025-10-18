-- Comprehensive RLS Fix for Bible Features
-- This script will fix all RLS issues and ensure proper user isolation

-- First, let's check if tables exist and create them if they don't
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

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bible_bookmarks;
DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON bible_bookmarks;
DROP POLICY IF EXISTS "Users can update their own bookmarks" ON bible_bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bible_bookmarks;
DROP POLICY IF EXISTS "Allow public access to bible_bookmarks" ON bible_bookmarks;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON bible_bookmarks;

DROP POLICY IF EXISTS "Users can view their own highlights" ON bible_highlights;
DROP POLICY IF EXISTS "Users can insert their own highlights" ON bible_highlights;
DROP POLICY IF EXISTS "Users can update their own highlights" ON bible_highlights;
DROP POLICY IF EXISTS "Users can delete their own highlights" ON bible_highlights;
DROP POLICY IF EXISTS "Allow public access to bible_highlights" ON bible_highlights;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON bible_highlights;

-- Create comprehensive RLS policies for bible_bookmarks
CREATE POLICY "Enable read access for users based on user_id" ON bible_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users only" ON bible_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON bible_bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON bible_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for bible_highlights
CREATE POLICY "Enable read access for users based on user_id" ON bible_highlights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users only" ON bible_highlights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON bible_highlights
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON bible_highlights
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bible_bookmarks_user_id ON bible_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bible_highlights_user_id ON bible_highlights(user_id);

-- Create a function to automatically set user_id
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically set user_id
DROP TRIGGER IF EXISTS on_bible_bookmarks_insert ON bible_bookmarks;
CREATE TRIGGER on_bible_bookmarks_insert
  BEFORE INSERT ON bible_bookmarks
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS on_bible_highlights_insert ON bible_highlights;
CREATE TRIGGER on_bible_highlights_insert
  BEFORE INSERT ON bible_highlights
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
