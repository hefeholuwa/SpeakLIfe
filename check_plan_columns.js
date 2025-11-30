const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xxuskmfvqpozgttakhou.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4dXNrbWZ2cXBvemd0dGFraG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjIxMzAsImV4cCI6MjA3NjAzODEzMH0.ozo311pBooyUt9QWKj4qeXT_3nvsA7wBjEfqc4MnCtw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    try {
        const { data, error } = await supabase
            .from('reading_plan_days')
            .select('*')
            .limit(1);

        if (error) {
            console.log('Error:', error.message);
        } else {
            console.log('Columns:', data && data.length > 0 ? Object.keys(data[0]) : 'Table empty, cannot infer columns from data');
            if (data && data.length === 0) {
                // If empty, we can't see columns this way easily without inspecting schema, 
                // but we can try to select a specific column and see if it errors.
                const { error: devError } = await supabase.from('reading_plan_days').select('devotion_content').limit(1);
                console.log('devotion_content column exists:', !devError);
            }
        }
    } catch (e) {
        console.error('Exception:', e);
    }
}

checkColumns();
