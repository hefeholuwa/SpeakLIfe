-- RLS Policies for SpeakLife Database
-- Run this after creating the schema to set up Row Level Security

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- USERS TABLE POLICIES
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Allow public read access to users (for admin panel)
CREATE POLICY "Public read access to users" ON users
    FOR SELECT USING (true);

-- TOPICS TABLE POLICIES
-- Allow public read access to topics
CREATE POLICY "Public read access to topics" ON topics
    FOR SELECT USING (true);

-- Allow authenticated users to insert topics (for admin)
CREATE POLICY "Authenticated users can insert topics" ON topics
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update topics (for admin)
CREATE POLICY "Authenticated users can update topics" ON topics
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete topics (for admin)
CREATE POLICY "Authenticated users can delete topics" ON topics
    FOR DELETE USING (auth.role() = 'authenticated');

-- VERSES TABLE POLICIES
-- Allow public read access to verses
CREATE POLICY "Public read access to verses" ON verses
    FOR SELECT USING (true);

-- Allow authenticated users to insert verses (for admin)
CREATE POLICY "Authenticated users can insert verses" ON verses
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update verses (for admin)
CREATE POLICY "Authenticated users can update verses" ON verses
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete verses (for admin)
CREATE POLICY "Authenticated users can delete verses" ON verses
    FOR DELETE USING (auth.role() = 'authenticated');

-- USER_CONFESSIONS TABLE POLICIES
-- Allow users to read their own confessions
CREATE POLICY "Users can view own confessions" ON user_confessions
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own confessions
CREATE POLICY "Users can insert own confessions" ON user_confessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own confessions
CREATE POLICY "Users can update own confessions" ON user_confessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own confessions
CREATE POLICY "Users can delete own confessions" ON user_confessions
    FOR DELETE USING (auth.uid() = user_id);

-- Allow public read access to user_confessions (for admin panel)
CREATE POLICY "Public read access to user_confessions" ON user_confessions
    FOR SELECT USING (true);

-- FAVORITES TABLE POLICIES
-- Allow users to read their own favorites
CREATE POLICY "Users can view own favorites" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own favorites
CREATE POLICY "Users can insert own favorites" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own favorites
CREATE POLICY "Users can update own favorites" ON favorites
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own favorites
CREATE POLICY "Users can delete own favorites" ON favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Allow public read access to favorites (for admin panel)
CREATE POLICY "Public read access to favorites" ON favorites
    FOR SELECT USING (true);
