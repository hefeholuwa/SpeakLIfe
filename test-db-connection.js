// Quick test to check database connection and RLS policies
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your_supabase_url_here'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key_here'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseConnection() {
  console.log('Testing database connection...')
  
  try {
    // Test 1: Check if we can read from topics table
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('*')
      .limit(1)
    
    if (topicsError) {
      console.error('❌ Error reading topics:', topicsError)
    } else {
      console.log('✅ Topics table accessible:', topics?.length || 0, 'topics found')
    }

    // Test 2: Check if we can read from users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.error('❌ Error reading users:', usersError)
    } else {
      console.log('✅ Users table accessible:', users?.length || 0, 'users found')
    }

    // Test 3: Check if we can insert into users table (this will test RLS)
    const testUser = {
      id: 'test-user-id-' + Date.now(),
      full_name: 'Test User',
      email: 'test@example.com',
      streak_count: 0,
      total_confessions: 0
    }

    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([testUser])
      .select()

    if (insertError) {
      console.error('❌ Error inserting user (RLS issue?):', insertError)
    } else {
      console.log('✅ User insertion successful:', insertData)
      
      // Clean up test user
      await supabase
        .from('users')
        .delete()
        .eq('id', testUser.id)
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error)
  }
}

testDatabaseConnection()
