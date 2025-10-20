-- Quick way to see table structure
\d daily_verses;

-- Alternative: Describe table structure
SELECT 
    'Column: ' || column_name || 
    ', Type: ' || data_type || 
    ', Nullable: ' || is_nullable || 
    ', Default: ' || COALESCE(column_default, 'None') as column_info
FROM information_schema.columns 
WHERE table_name = 'daily_verses' 
ORDER BY ordinal_position;
