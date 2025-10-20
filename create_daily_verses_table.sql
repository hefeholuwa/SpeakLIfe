-- Create daily_verses table if it doesn't exist
CREATE TABLE IF NOT EXISTS daily_verses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    verse TEXT NOT NULL,
    confession TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for daily_verses table
ALTER TABLE daily_verses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to daily_verses" ON daily_verses;
DROP POLICY IF EXISTS "Allow public insert access to daily_verses" ON daily_verses;
DROP POLICY IF EXISTS "Allow public update access to daily_verses" ON daily_verses;
DROP POLICY IF EXISTS "Allow public delete access to daily_verses" ON daily_verses;

-- Create new policies
CREATE POLICY "Allow public read access to daily_verses" ON daily_verses
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to daily_verses" ON daily_verses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to daily_verses" ON daily_verses
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to daily_verses" ON daily_verses
    FOR DELETE USING (true);

-- Create index on date for better performance
CREATE INDEX IF NOT EXISTS idx_daily_verses_date ON daily_verses(date);
