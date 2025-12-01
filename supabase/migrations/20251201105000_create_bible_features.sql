/*
  # Create Bible Features Tables

  1. New Tables
    - `bible_bookmarks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `book` (text)
      - `chapter` (integer)
      - `verse` (integer)
      - `text` (text)
      - `created_at` (timestamp)
      - Unique constraint on user_id + book + chapter + verse

    - `bible_highlights`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `book` (text)
      - `chapter` (integer)
      - `verse` (integer)
      - `text` (text)
      - `color` (text) - default 'yellow'
      - `created_at` (timestamp)
      - Unique constraint on user_id + book + chapter + verse

  2. Security
    - Enable RLS on both tables
    - Policies for users to manage their own data (CRUD)
*/

CREATE TABLE IF NOT EXISTS bible_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, book, chapter, verse)
);

CREATE TABLE IF NOT EXISTS bible_highlights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT,
  color TEXT DEFAULT 'yellow',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, book, chapter, verse)
);

-- Enable RLS
ALTER TABLE bible_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_highlights ENABLE ROW LEVEL SECURITY;

-- Policies for bookmarks
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bible_bookmarks' AND policyname = 'Users can view their own bookmarks') THEN
        CREATE POLICY "Users can view their own bookmarks" ON bible_bookmarks FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bible_bookmarks' AND policyname = 'Users can insert their own bookmarks') THEN
        CREATE POLICY "Users can insert their own bookmarks" ON bible_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bible_bookmarks' AND policyname = 'Users can delete their own bookmarks') THEN
        CREATE POLICY "Users can delete their own bookmarks" ON bible_bookmarks FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Policies for highlights
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bible_highlights' AND policyname = 'Users can view their own highlights') THEN
        CREATE POLICY "Users can view their own highlights" ON bible_highlights FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bible_highlights' AND policyname = 'Users can insert their own highlights') THEN
        CREATE POLICY "Users can insert their own highlights" ON bible_highlights FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bible_highlights' AND policyname = 'Users can delete their own highlights') THEN
        CREATE POLICY "Users can delete their own highlights" ON bible_highlights FOR DELETE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bible_highlights' AND policyname = 'Users can update their own highlights') THEN
        CREATE POLICY "Users can update their own highlights" ON bible_highlights FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;
