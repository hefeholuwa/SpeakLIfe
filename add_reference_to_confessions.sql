
-- Add reference column to topic_confessions table
ALTER TABLE topic_confessions 
ADD COLUMN IF NOT EXISTS reference VARCHAR(100);

-- Add comment to explain usage
COMMENT ON COLUMN topic_confessions.reference IS 'The scripture reference (e.g., Phil 4:13) that backs this confession';
