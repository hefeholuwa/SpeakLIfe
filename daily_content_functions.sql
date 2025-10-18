-- Helper functions for daily content management
-- These functions work with the existing daily_verses table

-- Function to check if daily content exists for a specific date
CREATE OR REPLACE FUNCTION daily_content_exists(check_date DATE DEFAULT CURRENT_DATE)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM daily_verses WHERE date = check_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get today's content
CREATE OR REPLACE FUNCTION get_todays_content()
RETURNS TABLE (
  id UUID,
  date DATE,
  verse_text TEXT,
  reference TEXT,
  confession_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dv.id,
    dv.date,
    dv.verse_text,
    dv.reference,
    dv.confession_text,
    dv.created_at
  FROM daily_verses dv
  WHERE dv.date = CURRENT_DATE
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION daily_content_exists TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_todays_content TO anon, authenticated;
