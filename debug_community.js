const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xxuskmfvqpozgttakhou.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4dXNrbWZ2cXBvemd0dGFraG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjIxMzAsImV4cCI6MjA3NjAzODEzMH0.ozo311pBooyUt9QWKj4qeXT_3nvsA7wBjEfqc4MnCtw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugCommunity() {
    try {
        console.log("Checking community_posts...");
        const { data: posts, error } = await supabase
            .from('community_posts')
            .select('*');

        if (error) {
            console.log("Error fetching posts:", error.message);
        } else {
            console.log(`Found ${posts.length} posts.`);
            console.log(posts);
        }

        console.log("\nChecking profiles...");
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .limit(5);

        if (profileError) {
            console.log("Error fetching profiles:", profileError.message);
        } else {
            console.log("Profiles sample:", profiles);
        }

    } catch (e) {
        console.error('Exception:', e);
    }
}

debugCommunity();
