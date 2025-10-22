/*
  # Create Topic Content Tables

  1. New Tables
    - `topic_verses`
      - `id` (uuid, primary key)
      - `topic_id` (uuid, foreign key to topics)
      - `verse_text` (text) - Bible verse text
      - `reference` (varchar) - Verse reference (e.g., "John 3:16")
      - `book` (varchar) - Bible book name
      - `chapter` (integer) - Chapter number
      - `verse` (integer) - Verse number
      - `translation` (varchar) - Bible translation
      - `is_featured` (boolean) - Featured status
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `topic_confessions`
      - `id` (uuid, primary key)
      - `topic_id` (uuid, foreign key to topics)
      - `confession_text` (text) - Confession text
      - `title` (varchar) - Confession title
      - `is_featured` (boolean) - Featured status
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for authenticated user management

  3. Indexes
    - Index on `topic_id` for joins
    - Index on `is_featured` for filtering
    - Index on `reference` for searching
*/

CREATE TABLE IF NOT EXISTS topic_verses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  verse_text TEXT NOT NULL,
  reference VARCHAR(100) NOT NULL,
  book VARCHAR(50) NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  translation VARCHAR(10) DEFAULT 'KJV',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS topic_confessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  confession_text TEXT NOT NULL,
  title VARCHAR(200),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE topic_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_confessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Topic verses are viewable by everyone" ON topic_verses
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert topic verses" ON topic_verses
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update topic verses" ON topic_verses
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete topic verses" ON topic_verses
  FOR DELETE TO authenticated
  USING (true);

CREATE POLICY "Topic confessions are viewable by everyone" ON topic_confessions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert topic confessions" ON topic_confessions
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update topic confessions" ON topic_confessions
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete topic confessions" ON topic_confessions
  FOR DELETE TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_topic_verses_topic_id ON topic_verses(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_verses_reference ON topic_verses(reference);
CREATE INDEX IF NOT EXISTS idx_topic_verses_is_featured ON topic_verses(is_featured);
CREATE INDEX IF NOT EXISTS idx_topic_confessions_topic_id ON topic_confessions(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_confessions_is_featured ON topic_confessions(is_featured);

CREATE TRIGGER update_topic_verses_updated_at 
  BEFORE UPDATE ON topic_verses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topic_confessions_updated_at 
  BEFORE UPDATE ON topic_confessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();