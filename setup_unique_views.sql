-- Create table to track unique views
CREATE TABLE IF NOT EXISTS community_post_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE community_post_views ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can insert their own views" ON community_post_views;
CREATE POLICY "Users can insert their own views" 
ON community_post_views FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Views are viewable by everyone" ON community_post_views;
CREATE POLICY "Views are viewable by everyone" 
ON community_post_views FOR SELECT 
USING (true);

-- Trigger to increment view count on unique view
CREATE OR REPLACE FUNCTION update_post_views_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_posts
  SET views = views + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_view_added ON community_post_views;
CREATE TRIGGER on_view_added
AFTER INSERT ON community_post_views
FOR EACH ROW EXECUTE FUNCTION update_post_views_count();

-- Function to safely record a view (idempotent)
CREATE OR REPLACE FUNCTION record_post_view(post_id_param UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO community_post_views (post_id, user_id)
  VALUES (post_id_param, auth.uid())
  ON CONFLICT (post_id, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
