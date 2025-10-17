-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to daily_reflections" ON daily_reflections;
DROP POLICY IF EXISTS "Allow authenticated users to insert daily_reflections" ON daily_reflections;
DROP POLICY IF EXISTS "Allow authenticated users to update daily_reflections" ON daily_reflections;
DROP POLICY IF EXISTS "Allow authenticated users to delete daily_reflections" ON daily_reflections;

-- Create new policies that allow anonymous access for daily reflections
-- (since these are public spiritual content, not user-specific data)

-- Allow anyone to read daily reflections
CREATE POLICY "Allow public read access to daily_reflections" ON daily_reflections
  FOR SELECT USING (true);

-- Allow anyone to insert daily reflections (for AI-generated content)
CREATE POLICY "Allow public insert to daily_reflections" ON daily_reflections
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update daily reflections (for same-day updates)
CREATE POLICY "Allow public update to daily_reflections" ON daily_reflections
  FOR UPDATE USING (true);

-- Allow anyone to delete daily reflections (for cleanup if needed)
CREATE POLICY "Allow public delete to daily_reflections" ON daily_reflections
  FOR DELETE USING (true);
