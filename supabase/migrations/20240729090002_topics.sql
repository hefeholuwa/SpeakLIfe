-- Create topics table for managing spiritual topics
CREATE TABLE IF NOT EXISTS topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10) NOT NULL DEFAULT '📖',
  gradient VARCHAR(100) NOT NULL DEFAULT 'from-gray-400 via-gray-500 to-gray-600',
  verses INTEGER DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_topics_updated_at 
  BEFORE UPDATE ON topics 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default topics
INSERT INTO topics (name, icon, gradient, verses, description, is_active) VALUES
('Faith', '✨', 'from-yellow-400 via-orange-500 to-red-500', 42, 'Believe and receive', true),
('Peace', '🛡️', 'from-blue-400 via-blue-500 to-indigo-600', 38, 'God''s protection', true),
('Love', '❤️', 'from-pink-400 via-red-500 to-pink-600', 51, 'Unconditional love', true),
('Wisdom', '💡', 'from-amber-400 via-yellow-500 to-orange-500', 35, 'Divine understanding', true),
('Prosperity', '💰', 'from-green-400 via-emerald-500 to-teal-600', 29, 'Abundant blessings', true),
('Relationships', '👥', 'from-purple-400 via-violet-500 to-purple-600', 33, 'Godly connections', true);

-- Enable RLS (Row Level Security)
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Create policies for topics (public read, admin write)
CREATE POLICY "Topics are viewable by everyone" ON topics
  FOR SELECT USING (true);

CREATE POLICY "Topics are manageable by authenticated users" ON topics
  FOR ALL USING (auth.role() = 'authenticated');

-- Create index for better performance
CREATE INDEX idx_topics_is_active ON topics(is_active);
CREATE INDEX idx_topics_name ON topics(name);
