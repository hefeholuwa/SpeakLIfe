-- Add category and is_featured columns to topics table
ALTER TABLE topics ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'General';
ALTER TABLE topics ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Update existing topics with a default category
UPDATE topics SET category = 'General' WHERE category IS NULL;

-- Create index for category for faster filtering
CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category);
CREATE INDEX IF NOT EXISTS idx_topics_is_featured ON topics(is_featured);
