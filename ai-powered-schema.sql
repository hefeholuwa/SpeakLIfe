-- AI-Powered SpeakLife Database Schema
-- Full AI integration for intelligent confession platform

-- 1. ENHANCED USERS TABLE (AI-Powered)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    streak_count INTEGER DEFAULT 0,
    last_confession_date TIMESTAMP WITH TIME ZONE,
    total_confessions INTEGER DEFAULT 0,
    
    -- AI Personalization Fields
    ai_preferences JSONB DEFAULT '{}', -- User's AI preferences
    spiritual_focus TEXT[] DEFAULT '{}', -- Areas of spiritual focus
    confession_style TEXT DEFAULT 'balanced', -- formal, casual, poetic, etc.
    spiritual_maturity_level TEXT DEFAULT 'beginner', -- beginner, intermediate, advanced
    preferred_ai_model TEXT DEFAULT 'deepseek-v3.1', -- User's preferred AI model
    timezone TEXT DEFAULT 'UTC',
    preferred_confession_times TEXT[], -- Times user likes to confess
    
    -- AI Learning Data
    ai_interaction_count INTEGER DEFAULT 0,
    last_ai_interaction TIMESTAMP WITH TIME ZONE,
    ai_satisfaction_score DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. AI MODELS TABLE
CREATE TABLE IF NOT EXISTS ai_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- 'deepseek-v3.1', 'gpt-oss-20b', etc.
    display_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    cost_per_token DECIMAL(10,6),
    max_tokens INTEGER,
    capabilities JSONB DEFAULT '{}', -- What this model can do
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. AI INTERACTIONS TABLE (Learning Data)
CREATE TABLE IF NOT EXISTS ai_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ai_model_id UUID REFERENCES ai_models(id),
    interaction_type TEXT NOT NULL, -- 'confession_generated', 'verse_selected', 'guidance_given', etc.
    prompt_used TEXT, -- The prompt sent to AI
    ai_response TEXT, -- AI's response
    user_feedback TEXT, -- 'liked', 'disliked', 'neutral', 'loved', 'hated'
    feedback_score INTEGER, -- -2 to +2 scale
    context_data JSONB DEFAULT '{}', -- Additional context (time, mood, etc.)
    processing_time_ms INTEGER, -- How long AI took to respond
    tokens_used INTEGER, -- Tokens consumed
    cost DECIMAL(10,6), -- Cost of this interaction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. AI PERSONALIZED CONTENT TABLE
CREATE TABLE IF NOT EXISTS ai_personalized_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL, -- 'confession', 'verse', 'encouragement', 'guidance', 'prayer'
    content_text TEXT NOT NULL,
    ai_model_id UUID REFERENCES ai_models(id),
    generation_prompt TEXT, -- What prompted this content
    personalization_factors JSONB DEFAULT '{}', -- Why this was personalized
    is_favorited BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE, -- When this content expires
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. AI LEARNING PATTERNS TABLE
CREATE TABLE IF NOT EXISTS ai_learning_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pattern_type TEXT NOT NULL, -- 'confession_preferences', 'timing_patterns', 'content_style', etc.
    pattern_data JSONB NOT NULL, -- The actual pattern data
    confidence_score DECIMAL(3,2) DEFAULT 0.0, -- How confident we are in this pattern
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. AI CONTENT RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL, -- 'confession', 'verse', 'topic', 'timing'
    recommended_content_id UUID, -- ID of the recommended content
    recommendation_reason TEXT, -- Why this was recommended
    priority_score DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
    is_shown BOOLEAN DEFAULT false,
    is_acted_upon BOOLEAN DEFAULT false,
    user_response TEXT, -- How user responded to recommendation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 7. ENHANCED TOPICS TABLE (AI-Powered)
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT DEFAULT '📖',
    color TEXT DEFAULT '#6366f1',
    
    -- AI Enhancement
    ai_generated BOOLEAN DEFAULT false,
    ai_model_id UUID REFERENCES ai_models(id),
    popularity_score DECIMAL(3,2) DEFAULT 0.0, -- How popular this topic is
    usage_count INTEGER DEFAULT 0,
    last_ai_enhancement TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ENHANCED VERSES TABLE (AI-Powered)
CREATE TABLE IF NOT EXISTS verses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    reference TEXT NOT NULL,
    scripture_text TEXT NOT NULL,
    confession_text TEXT NOT NULL,
    version TEXT DEFAULT 'NIV',
    
    -- AI Enhancement
    ai_generated BOOLEAN DEFAULT false,
    ai_model_id UUID REFERENCES ai_models(id),
    generation_prompt TEXT, -- What prompted this verse
    ai_quality_score DECIMAL(3,2) DEFAULT 0.0, -- AI's confidence in this content
    usage_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    last_ai_enhancement TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. AI CONVERSATION SESSIONS TABLE
CREATE TABLE IF NOT EXISTS ai_conversation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL, -- 'spiritual_guidance', 'confession_help', 'prayer_support'
    ai_model_id UUID REFERENCES ai_models(id),
    session_context JSONB DEFAULT '{}', -- Context for this conversation
    is_active BOOLEAN DEFAULT true,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    total_messages INTEGER DEFAULT 0,
    user_satisfaction_score DECIMAL(3,2)
);

-- 10. AI CONVERSATION MESSAGES TABLE
CREATE TABLE IF NOT EXISTS ai_conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES ai_conversation_sessions(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL, -- 'user' or 'ai'
    message_text TEXT NOT NULL,
    ai_model_id UUID REFERENCES ai_models(id),
    message_context JSONB DEFAULT '{}',
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. AI ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS ai_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    metric_context JSONB DEFAULT '{}',
    ai_model_id UUID REFERENCES ai_models(id),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. ENHANCED USER_CONFESSIONS TABLE (AI-Powered)
CREATE TABLE IF NOT EXISTS user_confessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    verse_id UUID REFERENCES verses(id) ON DELETE CASCADE,
    confessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    note TEXT,
    
    -- AI Enhancement
    ai_suggested BOOLEAN DEFAULT false,
    ai_model_id UUID REFERENCES ai_models(id),
    ai_confidence_score DECIMAL(3,2) DEFAULT 0.0,
    personalization_factors JSONB DEFAULT '{}',
    user_satisfaction_score DECIMAL(3,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. ENHANCED FAVORITES TABLE (AI-Powered)
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    verse_id UUID REFERENCES verses(id) ON DELETE CASCADE,
    
    -- AI Enhancement
    ai_recommended BOOLEAN DEFAULT false,
    ai_model_id UUID REFERENCES ai_models(id),
    recommendation_reason TEXT,
    favorite_strength DECIMAL(3,2) DEFAULT 0.0, -- How much user likes this
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, verse_id)
);

-- Create comprehensive indexes for AI performance
CREATE INDEX IF NOT EXISTS idx_users_ai_preferences ON users USING GIN(ai_preferences);
CREATE INDEX IF NOT EXISTS idx_users_spiritual_focus ON users USING GIN(spiritual_focus);
CREATE INDEX IF NOT EXISTS idx_users_ai_interaction_count ON users(ai_interaction_count);
CREATE INDEX IF NOT EXISTS idx_users_ai_satisfaction ON users(ai_satisfaction_score);

CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_type ON ai_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_feedback ON ai_interactions(user_feedback);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_created_at ON ai_interactions(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_personalized_content_user_id ON ai_personalized_content(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_personalized_content_type ON ai_personalized_content(content_type);
CREATE INDEX IF NOT EXISTS idx_ai_personalized_content_expires ON ai_personalized_content(expires_at);

CREATE INDEX IF NOT EXISTS idx_ai_learning_patterns_user_id ON ai_learning_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_learning_patterns_type ON ai_learning_patterns(pattern_type);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_type ON ai_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_priority ON ai_recommendations(priority_score);

CREATE INDEX IF NOT EXISTS idx_verses_ai_generated ON verses(ai_generated);
CREATE INDEX IF NOT EXISTS idx_verses_ai_quality ON verses(ai_quality_score);
CREATE INDEX IF NOT EXISTS idx_verses_usage_count ON verses(usage_count);

CREATE INDEX IF NOT EXISTS idx_topics_ai_generated ON topics(ai_generated);
CREATE INDEX IF NOT EXISTS idx_topics_popularity ON topics(popularity_score);

CREATE INDEX IF NOT EXISTS idx_ai_conversation_sessions_user_id ON ai_conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_sessions_active ON ai_conversation_sessions(is_active);

CREATE INDEX IF NOT EXISTS idx_ai_conversation_messages_session_id ON ai_conversation_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_messages_sender ON ai_conversation_messages(sender_type);

-- Insert default AI models
INSERT INTO ai_models (name, display_name, description, cost_per_token, max_tokens, capabilities) VALUES
('deepseek/deepseek-chat-v3.1:free', 'DeepSeek v3.1 (Free)', 'Advanced spiritual content generation', 0.0, 4000, '{"spiritual_content": true, "confession_generation": true, "biblical_insights": true}'),
('openai/gpt-oss-20b:free', 'GPT-OSS-20B (Free)', 'Open source spiritual assistant', 0.0, 2000, '{"conversational": true, "guidance": true, "prayer_support": true}');

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_verses_updated_at BEFORE UPDATE ON verses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

