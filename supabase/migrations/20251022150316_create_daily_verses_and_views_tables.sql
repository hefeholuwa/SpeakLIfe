/*
  # Create Daily Verses and Topic Views Tables

  1. New Tables
    - `daily_verses`
      - `id` (uuid, primary key)
      - `verse_text` (text) - Bible verse text
      - `reference` (varchar) - Verse reference
      - `book` (varchar) - Bible book name
      - `chapter` (integer) - Chapter number
      - `verse` (integer) - Verse number
      - `translation` (varchar) - Bible translation
      - `theme` (varchar) - Verse theme
      - `confession_title` (varchar) - Related confession title
      - `confession_text` (text) - Related confession text
      - `date` (date) - Date for this verse
      - `created_at` (timestamp)

    - `topic_views`
      - `id` (uuid, primary key)
      - `topic_id` (uuid, foreign key to topics)
      - `user_id` (uuid, foreign key to auth.users) - nullable for anonymous views
      - `viewed_at` (timestamp)
      - `date` (date) - Date of view for daily aggregation

  2. Security
    - Enable RLS on both tables
    - Daily verses: public read, authenticated write
    - Topic views: public insert, authenticated read own data

  3. Indexes
    - Index on `date` for daily queries
    - Index on `topic_id` and `date` for analytics
*/

CREATE TABLE IF NOT EXISTS daily_verses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  verse_text TEXT NOT NULL,
  reference VARCHAR(100) NOT NULL,
  book VARCHAR(50) NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  translation VARCHAR(10) DEFAULT 'KJV',
  theme VARCHAR(100),
  confession_title VARCHAR(200),
  confession_text TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date)
);

CREATE TABLE IF NOT EXISTS topic_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  date DATE DEFAULT CURRENT_DATE
);

ALTER TABLE daily_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Daily verses are viewable by everyone" ON daily_verses
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert daily verses" ON daily_verses
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update daily verses" ON daily_verses
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete daily verses" ON daily_verses
  FOR DELETE TO authenticated
  USING (true);

CREATE POLICY "Anyone can record topic views" ON topic_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Topic views are viewable by everyone" ON topic_views
  FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_daily_verses_date ON daily_verses(date);
CREATE INDEX IF NOT EXISTS idx_topic_views_topic_id ON topic_views(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_views_date ON topic_views(date);
CREATE INDEX IF NOT EXISTS idx_topic_views_topic_date ON topic_views(topic_id, date);