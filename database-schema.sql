-- SpeakLife Database Schema
-- Run this in your Supabase SQL Editor to create all tables

-- 1. USERS TABLE
-- Stores user profiles and authentication data
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    streak_count INTEGER DEFAULT 0,
    last_confession_date TIMESTAMP WITH TIME ZONE,
    total_confessions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TOPICS TABLE
-- Categories for organizing verses and confessions
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT DEFAULT '📖',
    color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. VERSES TABLE
-- Scripture verses and their corresponding confessions
CREATE TABLE IF NOT EXISTS verses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    reference TEXT NOT NULL,
    scripture_text TEXT NOT NULL,
    confession_text TEXT NOT NULL,
    version TEXT DEFAULT 'NIV',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. USER_CONFESSIONS TABLE
-- Tracks when users confess/declare specific verses
CREATE TABLE IF NOT EXISTS user_confessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    verse_id UUID REFERENCES verses(id) ON DELETE CASCADE,
    confessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. FAVORITES TABLE
-- User's favorite verses
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    verse_id UUID REFERENCES verses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, verse_id)
);

-- 6. USER_STREAKS TABLE (Optional - for detailed streak tracking)
-- Detailed streak information
CREATE TABLE IF NOT EXISTS user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    streak_start_date DATE NOT NULL,
    streak_end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_verses_topic_id ON verses(topic_id);
CREATE INDEX IF NOT EXISTS idx_user_confessions_user_id ON user_confessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_confessions_confessed_at ON user_confessions(confessed_at);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verses_updated_at BEFORE UPDATE ON verses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
