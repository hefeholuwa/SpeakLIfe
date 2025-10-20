-- Simple RLS fix - disable RLS for content tables
-- This allows content creation without authentication issues

ALTER TABLE topic_verses DISABLE ROW LEVEL SECURITY;
ALTER TABLE topic_confessions DISABLE ROW LEVEL SECURITY;
