-- Fix daily_verses table and RLS policies
-- This script ensures the table exists and has proper permissions

-- Create daily_verses table if it doesn't exist
CREATE TABLE IF NOT EXISTS daily_verses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  verse_text TEXT NOT NULL,
  reference TEXT NOT NULL,
  confession_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for date lookups
CREATE INDEX IF NOT EXISTS idx_daily_verses_date ON daily_verses(date);

-- Enable RLS
ALTER TABLE daily_verses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to daily_verses" ON daily_verses;
DROP POLICY IF EXISTS "Allow public insert access to daily_verses" ON daily_verses;
DROP POLICY IF EXISTS "Allow public update access to daily_verses" ON daily_verses;

-- Create new policies for daily_verses
CREATE POLICY "Allow public read access to daily_verses" ON daily_verses
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to daily_verses" ON daily_verses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to daily_verses" ON daily_verses
  FOR UPDATE USING (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON daily_verses TO anon, authenticated;
