-- Add new columns for rich notifications
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS action_url TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Function to handle new post likes
CREATE OR REPLACE FUNCTION handle_new_post_like()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  post_content TEXT;
  liker_name TEXT;
BEGIN
  -- Get post owner and content snippet
  SELECT user_id, content INTO post_owner_id, post_content
  FROM community_posts
  WHERE id = NEW.post_id;

  -- Don't notify if user likes their own post
  IF post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get liker's name
  SELECT username INTO liker_name
  FROM profiles
  WHERE id = NEW.user_id;
  
  IF liker_name IS NULL THEN
    liker_name := 'Someone';
  END IF;

  -- Insert notification
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    action_url,
    metadata,
    created_at
  ) VALUES (
    post_owner_id,
    'New Like',
    liker_name || ' liked your post: "' || NULLIF(substring(post_content from 1 for 30), '') || '..."',
    'success',
    '/community', -- Ideally deeper link, but we handle state
    jsonb_build_object('postId', NEW.post_id, 'type', 'like'),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for likes
DROP TRIGGER IF EXISTS on_post_like_notification ON community_likes;
CREATE TRIGGER on_post_like_notification
  AFTER INSERT ON community_likes
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_post_like();

-- Function to handle new post comments
CREATE OR REPLACE FUNCTION handle_new_post_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  post_content TEXT;
  commenter_name TEXT;
BEGIN
  -- Get post owner and content snippet
  SELECT user_id, content INTO post_owner_id, post_content
  FROM community_posts
  WHERE id = NEW.post_id;

  -- Don't notify if user comments on their own post
  IF post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get commenter's name
  SELECT username INTO commenter_name
  FROM profiles
  WHERE id = NEW.user_id;

  IF commenter_name IS NULL THEN
    commenter_name := 'Someone';
  END IF;

  -- Insert notification
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    action_url,
    metadata,
    created_at
  ) VALUES (
    post_owner_id,
    'New Comment',
    commenter_name || ' commented: "' || NULLIF(substring(NEW.content from 1 for 30), '') || '..."',
    'info',
    '/community',
    jsonb_build_object('postId', NEW.post_id, 'type', 'comment'),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for comments
DROP TRIGGER IF EXISTS on_post_comment_notification ON community_comments;
CREATE TRIGGER on_post_comment_notification
  AFTER INSERT ON community_comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_post_comment();
