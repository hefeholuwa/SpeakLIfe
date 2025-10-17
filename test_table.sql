-- Test if user_confessions table exists
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_confessions' 
ORDER BY ordinal_position;
