const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xxuskmfvqpozgttakhou.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4dXNrbWZ2cXBvemd0dGFraG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjIxMzAsImV4cCI6MjA3NjAzODEzMH0.ozo311pBooyUt9QWKj4qeXT_3nvsA7wBjEfqc4MnCtw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    try {
        // Check confession_journal existence
        const { error: journalError } = await supabase
            .from('confession_journal')
            .select('id')
            .limit(1);

        console.log('confession_journal exists:', !journalError);
        if (journalError) console.log('Journal Error:', journalError.message);

        // Check reading_plans columns
        const { data: planData, error: planError } = await supabase
            .from('reading_plans')
            .select('*')
            .limit(1);

        if (planData && planData.length > 0) {
            console.log('reading_plans columns:', Object.keys(planData[0]));
        } else {
            console.log('reading_plans is empty or error:', planError?.message);
        }

    } catch (e) {
        console.error('Exception:', e);
    }
}

checkTables();
