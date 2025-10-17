-- Essential SpeakLife Database Schema
-- Run this first to create the core tables

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    streak_count INTEGER DEFAULT 0,
    last_confession_date TIMESTAMP WITH TIME ZONE,
    total_confessions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TOPICS TABLE
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT DEFAULT '📖',
    color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. VERSES TABLE
CREATE TABLE IF NOT EXISTS verses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    reference TEXT NOT NULL,
    scripture_text TEXT NOT NULL,
    confession_text TEXT NOT NULL,
    version TEXT DEFAULT 'NIV',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. USER_CONFESSIONS TABLE
CREATE TABLE IF NOT EXISTS user_confessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    verse_id UUID REFERENCES verses(id) ON DELETE CASCADE,
    confessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    verse_id UUID REFERENCES verses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, verse_id)
);

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_verses_topic_id ON verses(topic_id);
CREATE INDEX IF NOT EXISTS idx_user_confessions_user_id ON user_confessions(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
