-- Create daily_reflections table for storing AI-generated daily reflections
CREATE TABLE IF NOT EXISTS daily_reflections (
  id SERIAL PRIMARY KEY,
  date VARCHAR(50) NOT NULL UNIQUE,
  reflection TEXT NOT NULL,
  scripture TEXT,
  confession_type VARCHAR(50),
  spiritual_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on date for faster lookups
CREATE INDEX IF NOT EXISTS idx_daily_reflections_date ON daily_reflections(date);

-- Enable Row Level Security
ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read daily reflections (public content)
CREATE POLICY "Allow public read access to daily_reflections" ON daily_reflections
  FOR SELECT USING (true);

-- Create policy to allow authenticated users to insert daily reflections
CREATE POLICY "Allow authenticated users to insert daily_reflections" ON daily_reflections
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update daily reflections
CREATE POLICY "Allow authenticated users to update daily_reflections" ON daily_reflections
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete daily reflections (if needed)
CREATE POLICY "Allow authenticated users to delete daily_reflections" ON daily_reflections
  FOR DELETE USING (auth.role() = 'authenticated');
