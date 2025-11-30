const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xxuskmfvqpozgttakhou.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4dXNrbWZ2cXBvemd0dGFraG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjIxMzAsImV4cCI6MjA3NjAzODEzMH0.ozo311pBooyUt9QWKj4qeXT_3nvsA7wBjEfqc4MnCtw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    try {
        const { data, error } = await supabase
            .from('topics')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Error:', error);
        } else {
            console.log('Topic keys:', data && data.length > 0 ? Object.keys(data[0]) : 'No data (empty table)');
            if (data && data.length > 0) console.log('Sample topic:', data[0]);
        }
    } catch (e) {
        console.error('Exception:', e);
    }
}
checkSchema();
