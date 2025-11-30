const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xxuskmfvqpozgttakhou.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4dXNrbWZ2cXBvemd0dGFraG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjIxMzAsImV4cCI6MjA3NjAzODEzMH0.ozo311pBooyUt9QWKj4qeXT_3nvsA7wBjEfqc4MnCtw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    try {
        const { error: plansError } = await supabase.from('reading_plans').select('id').limit(1);
        const { error: profilesError } = await supabase.from('profiles').select('id').limit(1);

        console.log('Reading Plans Table Exists:', !plansError || plansError.code !== '42P01'); // 42P01 is undefined_table
        if (plansError) console.log('Plans Error:', plansError.message);

        console.log('Profiles Table Exists:', !profilesError || profilesError.code !== '42P01');
        if (profilesError) console.log('Profiles Error:', profilesError.message);

    } catch (e) {
        console.error('Exception:', e);
    }
}

checkTables();
