-- Method 1: Show columns for a specific table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'daily_verses' 
ORDER BY ordinal_position;

-- Method 2: Show all columns with more details
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'daily_verses' 
ORDER BY ordinal_position;

-- Method 3: Show columns for any table (replace 'daily_verses' with your table name)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'your_table_name_here' 
ORDER BY ordinal_position;

-- Method 4: Show all tables and their columns
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
