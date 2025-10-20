-- Alternative: Disable RLS for topic content tables
-- This allows admin access without complex policies
-- Use this if you prefer simpler admin management

-- Disable RLS for topic content tables (admin needs full access)
ALTER TABLE topic_verses DISABLE ROW LEVEL SECURITY;
ALTER TABLE topic_confessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE topic_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE topics DISABLE ROW LEVEL SECURITY;

-- Note: This gives full access to these tables
-- Only use if you trust your admin users completely


