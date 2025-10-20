-- Fix RLS policies for daily_verses table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to daily_verses" ON daily_verses;
DROP POLICY IF EXISTS "Allow public insert access to daily_verses" ON daily_verses;
DROP POLICY IF EXISTS "Allow public update access to daily_verses" ON daily_verses;
DROP POLICY IF EXISTS "Allow public delete access to daily_verses" ON daily_verses;
DROP POLICY IF EXISTS "Enable read access for all users" ON daily_verses;
DROP POLICY IF EXISTS "Enable insert for all users" ON daily_verses;
DROP POLICY IF EXISTS "Enable update for all users" ON daily_verses;
DROP POLICY IF EXISTS "Enable delete for all users" ON daily_verses;

-- Create new policies that allow public access
CREATE POLICY "Enable read access for all users" ON daily_verses
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON daily_verses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON daily_verses
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON daily_verses
    FOR DELETE USING (true);
