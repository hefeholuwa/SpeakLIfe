-- Create user_confessions table for storing user confessions
CREATE TABLE IF NOT EXISTS user_confessions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  confession_text TEXT NOT NULL,
  confession_type VARCHAR(50) NOT NULL,
  emotional_state VARCHAR(50),
  spiritual_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_confessions_user_id ON user_confessions(user_id);

-- Create index on created_at for streak calculations
CREATE INDEX IF NOT EXISTS idx_user_confessions_created_at ON user_confessions(created_at);

-- Enable Row Level Security
ALTER TABLE user_confessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Allow public access to user_confessions" ON user_confessions;

-- Create policy to allow public access (since we're using demo users)
CREATE POLICY "Allow public access to user_confessions" ON user_confessions
  FOR ALL USING (true);
