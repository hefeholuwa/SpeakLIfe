-- Add views and comments_count to posts
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Create comments table
CREATE TABLE IF NOT EXISTS community_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON community_comments;
CREATE POLICY "Comments are viewable by everyone" 
ON community_comments FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can insert their own comments" ON community_comments;
CREATE POLICY "Users can insert their own comments" 
ON community_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON community_comments;
CREATE POLICY "Users can delete their own comments" 
ON community_comments FOR DELETE 
USING (auth.uid() = user_id);

-- RPC to increment views
CREATE OR REPLACE FUNCTION increment_post_views(post_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE community_posts
  SET views = views + 1
  WHERE id = post_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update comments_count
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE community_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE community_posts
    SET comments_count = comments_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_change ON community_comments;
CREATE TRIGGER on_comment_change
AFTER INSERT OR DELETE ON community_comments
FOR EACH ROW EXECUTE FUNCTION update_comments_count();
