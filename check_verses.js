const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xxuskmfvqpozgttakhou.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4dXNrbWZ2cXBvemd0dGFraG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjIxMzAsImV4cCI6MjA3NjAzODEzMH0.ozo311pBooyUt9QWKj4qeXT_3nvsA7wBjEfqc4MnCtw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkContent() {
    try {
        const { data, error } = await supabase
            .from('daily_verses')
            .select('date, verse_text, confession_text')
            .order('date', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Error:', error);
        } else {
            console.log('Recent Daily Verses:');
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error('Exception:', e);
    }
}
checkContent();
