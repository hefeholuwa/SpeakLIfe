-- Create community_posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 500),
  category TEXT NOT NULL DEFAULT 'general', -- 'gratitude', 'testimony', 'prayer_request', 'general'
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_likes table for tracking user likes
CREATE TABLE IF NOT EXISTS community_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

-- Policies for community_posts
DROP POLICY IF EXISTS "Community posts are viewable by everyone" ON community_posts;
CREATE POLICY "Community posts are viewable by everyone" ON community_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert posts" ON community_posts;
CREATE POLICY "Authenticated users can insert posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON community_posts;
CREATE POLICY "Users can delete their own posts" ON community_posts FOR DELETE USING (auth.uid() = user_id);

-- Policies for community_likes
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON community_likes;
CREATE POLICY "Likes are viewable by everyone" ON community_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert likes" ON community_likes;
CREATE POLICY "Authenticated users can insert likes" ON community_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own likes" ON community_likes;
CREATE POLICY "Users can delete their own likes" ON community_likes FOR DELETE USING (auth.uid() = user_id);

-- Function to handle like count updates
CREATE OR REPLACE FUNCTION handle_new_like()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_posts
  SET likes_count = likes_count + 1
  WHERE id = new.post_id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION handle_unlike()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_posts
  SET likes_count = likes_count - 1
  WHERE id = old.post_id;
  RETURN old;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for likes
DROP TRIGGER IF EXISTS on_like_created ON community_likes;
CREATE TRIGGER on_like_created
  AFTER INSERT ON community_likes
  FOR EACH ROW EXECUTE PROCEDURE handle_new_like();

DROP TRIGGER IF EXISTS on_like_deleted ON community_likes;
CREATE TRIGGER on_like_deleted
  AFTER DELETE ON community_likes
  FOR EACH ROW EXECUTE PROCEDURE handle_unlike();
