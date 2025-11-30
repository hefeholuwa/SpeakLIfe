const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xxuskmfvqpozgttakhou.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4dXNrbWZ2cXBvemd0dGFraG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjIxMzAsImV4cCI6MjA3NjAzODEzMH0.ozo311pBooyUt9QWKj4qeXT_3nvsA7wBjEfqc4MnCtw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    try {
        const { error: daysError } = await supabase.from('reading_plan_days').select('id').limit(1);
        const { error: entriesError } = await supabase.from('reading_plan_entries').select('id').limit(1);

        console.log('reading_plan_days Table Exists:', !daysError || daysError.code !== '42P01');
        if (daysError) console.log('reading_plan_days Error:', daysError.message);

        console.log('reading_plan_entries Table Exists:', !entriesError || entriesError.code !== '42P01');
        if (entriesError) console.log('reading_plan_entries Error:', entriesError.message);

    } catch (e) {
        console.error('Exception:', e);
    }
}

checkTables();
