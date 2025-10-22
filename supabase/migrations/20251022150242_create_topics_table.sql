/*
  # Create Topics Table

  1. New Tables
    - `topics`
      - `id` (uuid, primary key)
      - `name` (varchar) - Topic name
      - `title` (varchar) - Display title
      - `icon` (varchar) - Emoji icon
      - `color` (varchar) - Hex color code
      - `gradient` (varchar) - CSS gradient
      - `verses` (integer) - Verse count
      - `description` (text) - Topic description
      - `is_active` (boolean) - Active status
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `topics` table
    - Add policy for public read access
    - Add policy for authenticated user management

  3. Indexes
    - Index on `is_active` for filtering
    - Index on `name` for searching
*/

CREATE TABLE IF NOT EXISTS topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  title VARCHAR(100) NOT NULL,
  icon VARCHAR(10) NOT NULL DEFAULT '📖',
  color VARCHAR(20) DEFAULT '#6366f1',
  gradient VARCHAR(100) NOT NULL DEFAULT 'from-gray-400 via-gray-500 to-gray-600',
  verses INTEGER DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

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

INSERT INTO topics (name, title, icon, color, gradient, verses, description, is_active) VALUES
('faith', 'Faith', '✨', '#f59e0b', 'from-yellow-400 via-orange-500 to-red-500', 0, 'Believe and receive', true),
('peace', 'Peace', '🛡️', '#3b82f6', 'from-blue-400 via-blue-500 to-indigo-600', 0, 'God''s protection', true),
('love', 'Love', '❤️', '#ef4444', 'from-pink-400 via-red-500 to-pink-600', 0, 'Unconditional love', true),
('wisdom', 'Wisdom', '💡', '#f59e0b', 'from-amber-400 via-yellow-500 to-orange-500', 0, 'Divine understanding', true),
('prosperity', 'Prosperity', '💰', '#10b981', 'from-green-400 via-emerald-500 to-teal-600', 0, 'Abundant blessings', true),
('relationships', 'Relationships', '👥', '#8b5cf6', 'from-purple-400 via-violet-500 to-purple-600', 0, 'Godly connections', true);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Topics are viewable by everyone" ON topics
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert topics" ON topics
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update topics" ON topics
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete topics" ON topics
  FOR DELETE TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_topics_is_active ON topics(is_active);
CREATE INDEX IF NOT EXISTS idx_topics_name ON topics(name);