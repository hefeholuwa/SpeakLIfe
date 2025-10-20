-- Create topic_verses table for verses associated with topics
CREATE TABLE IF NOT EXISTS topic_verses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  verse_text TEXT NOT NULL,
  reference VARCHAR(100) NOT NULL, -- e.g., "John 3:16"
  book VARCHAR(50) NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  translation VARCHAR(10) DEFAULT 'KJV',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create topic_confessions table for confessions associated with topics
CREATE TABLE IF NOT EXISTS topic_confessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  confession_text TEXT NOT NULL,
  title VARCHAR(200),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE topic_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_confessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for topic_verses (public read, admin write)
CREATE POLICY "Topic verses are viewable by everyone" ON topic_verses
  FOR SELECT USING (true);

CREATE POLICY "Topic verses are manageable by authenticated users" ON topic_verses
  FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for topic_confessions (public read, admin write)
CREATE POLICY "Topic confessions are viewable by everyone" ON topic_confessions
  FOR SELECT USING (true);

CREATE POLICY "Topic confessions are manageable by authenticated users" ON topic_confessions
  FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_topic_verses_topic_id ON topic_verses(topic_id);
CREATE INDEX idx_topic_verses_reference ON topic_verses(reference);
CREATE INDEX idx_topic_verses_is_featured ON topic_verses(is_featured);
CREATE INDEX idx_topic_confessions_topic_id ON topic_confessions(topic_id);
CREATE INDEX idx_topic_confessions_is_featured ON topic_confessions(is_featured);

-- Create updated_at triggers
CREATE TRIGGER update_topic_verses_updated_at 
  BEFORE UPDATE ON topic_verses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topic_confessions_updated_at 
  BEFORE UPDATE ON topic_confessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for existing topics
-- First, let's get the topic IDs and insert sample content
INSERT INTO topic_verses (topic_id, verse_text, reference, book, chapter, verse, is_featured) 
SELECT 
  t.id,
  'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
  'John 3:16',
  'John',
  3,
  16,
  true
FROM topics t 
WHERE t.title = 'Faith' OR t.title = 'Love'
LIMIT 1;

INSERT INTO topic_confessions (topic_id, confession_text, title, is_featured)
SELECT 
  t.id,
  'I confess that I am loved by God and have eternal life through Jesus Christ. I believe in His love and receive His salvation.',
  'Confession of Faith',
  true
FROM topics t 
WHERE t.title = 'Faith' OR t.title = 'Love'
LIMIT 1;
