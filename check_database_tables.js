// Simple script to check database tables using Supabase client
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xxuskmfvqpozgttakhou.supabase.co'
const supabaseKey = 'your-anon-key-here' // You'll need to add your anon key

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...')
    
    // Check daily_verses table
    const { data: dailyVerses, error: dailyError } = await supabase
      .from('daily_verses')
      .select('*')
      .limit(1)
    
    if (dailyError) {
      console.log('❌ daily_verses table:', dailyError.message)
    } else {
      console.log('✅ daily_verses table exists')
    }
    
    // Check topics table
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('*')
      .limit(1)
    
    if (topicsError) {
      console.log('❌ topics table:', topicsError.message)
    } else {
      console.log('✅ topics table exists')
    }
    
    // Check topic_verses table
    const { data: topicVerses, error: versesError } = await supabase
      .from('topic_verses')
      .select('*')
      .limit(1)
    
    if (versesError) {
      console.log('❌ topic_verses table:', versesError.message)
    } else {
      console.log('✅ topic_verses table exists')
    }
    
    // Check topic_confessions table
    const { data: confessions, error: confessionsError } = await supabase
      .from('topic_confessions')
      .select('*')
      .limit(1)
    
    if (confessionsError) {
      console.log('❌ topic_confessions table:', confessionsError.message)
    } else {
      console.log('✅ topic_confessions table exists')
    }
    
    console.log('✅ Database check complete!')
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message)
  }
}

checkTables()

