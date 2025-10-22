-- Add Activity Tracking Columns to Users Table
-- This migration adds comprehensive activity tracking to the users table

-- Add login and session tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_session_time INTEGER DEFAULT 0; -- in minutes
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;

-- Add feature-specific activity tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_bible_reading_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_topic_viewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_daily_verse_viewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_reading_plan_activity_at TIMESTAMP WITH TIME ZONE;

-- Add engagement metrics
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_bible_reading_time INTEGER DEFAULT 0; -- in minutes
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_topic_views INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_daily_verse_views INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_reading_plan_sessions INTEGER DEFAULT 0;

-- Add activity frequency tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_activity_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS weekly_activity_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_activity_count INTEGER DEFAULT 0;

-- Add engagement score
ALTER TABLE users ADD COLUMN IF NOT EXISTS engagement_score NUMERIC DEFAULT 0.0; -- 0.0 to 1.0
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_engagement_calculation_at TIMESTAMP WITH TIME ZONE;

-- Add timezone and preferences for better tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_activity_time TIME;
ALTER TABLE users ADD COLUMN IF NOT EXISTS most_active_day_of_week INTEGER; -- 0-6 (Sunday-Saturday)

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_last_activity_at ON users(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users(last_login_at);
CREATE INDEX IF NOT EXISTS idx_users_is_online ON users(is_online);
CREATE INDEX IF NOT EXISTS idx_users_engagement_score ON users(engagement_score);

-- Add comments for documentation
COMMENT ON COLUMN users.last_login_at IS 'Timestamp of user''s last login';
COMMENT ON COLUMN users.last_activity_at IS 'Timestamp of user''s last activity (any action)';
COMMENT ON COLUMN users.login_count IS 'Total number of times user has logged in';
COMMENT ON COLUMN users.total_session_time IS 'Total time spent in sessions (minutes)';
COMMENT ON COLUMN users.is_online IS 'Whether user is currently online';
COMMENT ON COLUMN users.last_bible_reading_at IS 'Timestamp of last Bible reading activity';
COMMENT ON COLUMN users.last_topic_viewed_at IS 'Timestamp of last topic viewing';
COMMENT ON COLUMN users.last_daily_verse_viewed_at IS 'Timestamp of last daily verse viewing';
COMMENT ON COLUMN users.last_reading_plan_activity_at IS 'Timestamp of last reading plan activity';
COMMENT ON COLUMN users.total_bible_reading_time IS 'Total time spent reading Bible (minutes)';
COMMENT ON COLUMN users.total_topic_views IS 'Total number of topics viewed';
COMMENT ON COLUMN users.total_daily_verse_views IS 'Total number of daily verses viewed';
COMMENT ON COLUMN users.total_reading_plan_sessions IS 'Total reading plan sessions';
COMMENT ON COLUMN users.daily_activity_count IS 'Number of activities today';
COMMENT ON COLUMN users.weekly_activity_count IS 'Number of activities this week';
COMMENT ON COLUMN users.monthly_activity_count IS 'Number of activities this month';
COMMENT ON COLUMN users.engagement_score IS 'User engagement score (0.0 to 1.0)';
COMMENT ON COLUMN users.last_engagement_calculation_at IS 'When engagement score was last calculated';
COMMENT ON COLUMN users.preferred_activity_time IS 'User''s preferred time for activity';
COMMENT ON COLUMN users.most_active_day_of_week IS 'Day of week user is most active (0-6)';
