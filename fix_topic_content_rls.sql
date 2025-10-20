-- Fix RLS policies for topic content tables
-- These tables contain public content that admins need to manage

-- Enable RLS on topic_verses if not already enabled
ALTER TABLE topic_verses ENABLE ROW LEVEL SECURITY;

-- Enable RLS on topic_confessions if not already enabled  
ALTER TABLE topic_confessions ENABLE ROW LEVEL SECURITY;

-- Create policies for topic_verses
-- Allow everyone to read topic verses (public content)
CREATE POLICY "Anyone can view topic verses" ON topic_verses
  FOR SELECT USING (true);

-- Allow authenticated users to insert topic verses (for admin management)
CREATE POLICY "Authenticated users can insert topic verses" ON topic_verses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update topic verses (for admin management)
CREATE POLICY "Authenticated users can update topic verses" ON topic_verses
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete topic verses (for admin management)
CREATE POLICY "Authenticated users can delete topic verses" ON topic_verses
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for topic_confessions
-- Allow everyone to read topic confessions (public content)
CREATE POLICY "Anyone can view topic confessions" ON topic_confessions
  FOR SELECT USING (true);

-- Allow authenticated users to insert topic confessions (for admin management)
CREATE POLICY "Authenticated users can insert topic confessions" ON topic_confessions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update topic confessions (for admin management)
CREATE POLICY "Authenticated users can update topic confessions" ON topic_confessions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete topic confessions (for admin management)
CREATE POLICY "Authenticated users can delete topic confessions" ON topic_confessions
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for topic_views (analytics table)
-- Allow everyone to insert topic views (for tracking)
CREATE POLICY "Anyone can insert topic views" ON topic_views
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to read topic views (for admin analytics)
CREATE POLICY "Authenticated users can view topic views" ON topic_views
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policies for topics table
-- Allow everyone to read topics (public content)
CREATE POLICY "Anyone can view topics" ON topics
  FOR SELECT USING (true);

-- Allow authenticated users to update topics (for admin management)
CREATE POLICY "Authenticated users can update topics" ON topics
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert topics (for admin management)
CREATE POLICY "Authenticated users can insert topics" ON topics
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete topics (for admin management)
CREATE POLICY "Authenticated users can delete topics" ON topics
  FOR DELETE USING (auth.role() = 'authenticated');