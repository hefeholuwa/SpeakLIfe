-- Option 1: Make user_id nullable to allow demo usage
ALTER TABLE user_confessions 
ALTER COLUMN user_id DROP NOT NULL;

-- Option 2: Create a demo user (uncomment if you prefer this approach)
-- INSERT INTO users (id, email, created_at) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'demo@speaklife.app', NOW())
-- ON CONFLICT (id) DO NOTHING;
