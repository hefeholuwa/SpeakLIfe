-- Test script to check topics table structure
-- Run this in Supabase SQL Editor to see the actual column names

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'topics' 
ORDER BY ordinal_position;
