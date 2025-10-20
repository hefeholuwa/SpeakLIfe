-- Create topic_views table to track daily views
CREATE TABLE IF NOT EXISTS topic_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  view_date DATE NOT NULL DEFAULT CURRENT_DATE,
  view_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure one record per user per topic per day
  UNIQUE(topic_id, user_id, view_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_topic_views_topic_id ON topic_views(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_views_view_date ON topic_views(view_date);
CREATE INDEX IF NOT EXISTS idx_topic_views_user_id ON topic_views(user_id);

-- Enable RLS
ALTER TABLE topic_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Topic views are viewable by everyone" ON topic_views
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own topic views" ON topic_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own topic views" ON topic_views
  FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_topic_views_updated_at
  BEFORE UPDATE ON topic_views
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get daily view count for a topic
CREATE OR REPLACE FUNCTION get_topic_daily_views(topic_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(view_count), 0)
    FROM topic_views 
    WHERE topic_id = topic_uuid 
    AND view_date = CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql;

-- Function to increment topic view
CREATE OR REPLACE FUNCTION increment_topic_view(topic_uuid UUID, user_uuid UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  INSERT INTO topic_views (topic_id, user_id, view_count)
  VALUES (topic_uuid, user_uuid, 1)
  ON CONFLICT (topic_id, user_id, view_date)
  DO UPDATE SET 
    view_count = topic_views.view_count + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;
