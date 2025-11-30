const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xxuskmfvqpozgttakhou.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4dXNrbWZ2cXBvemd0dGFraG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjIxMzAsImV4cCI6MjA3NjAzODEzMH0.ozo311pBooyUt9QWKj4qeXT_3nvsA7wBjEfqc4MnCtw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDevotionalContent() {
    try {
        const { data, error } = await supabase
            .from('reading_plan_days')
            .select('id, day_number, reading_reference, devotional_content')
            .limit(5);

        if (error) {
            console.log('Error:', error.message);
        } else {
            console.log('Sample Data:', data);
        }
    } catch (e) {
        console.error('Exception:', e);
    }
}

checkDevotionalContent();
