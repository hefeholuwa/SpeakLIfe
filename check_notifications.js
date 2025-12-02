import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkNotifications() {
    console.log('🔍 Checking notifications in database...\n')

    try {
        // Try to fetch all global notifications
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('is_global', true)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('❌ Error fetching notifications:', error.message)
            console.log('\n💡 This might be an RLS policy issue.')
            console.log('📋 To add test notifications manually:')
            console.log('1. Go to Supabase Dashboard → SQL Editor')
            console.log('2. Run this SQL:\n')
            console.log(`
INSERT INTO notifications (title, message, type, is_global) VALUES
  ('Welcome to SpeakLife! 🎉', 'Thank you for joining our spiritual community. Start your journey today!', 'success', true),
  ('Daily Verse Available 📖', 'Your daily verse and confession are ready. Check them out now!', 'info', true),
  ('New Reading Plan Available 📚', 'A new 7-day reading plan has been added. Start growing today!', 'info', true),
  ('Streak Milestone! 🔥', 'Congratulations! You have maintained a 7-day streak!', 'success', true),
  ('Community Update 💬', 'New discussions are happening in the community!', 'info', true);
      `)
            return
        }

        if (data && data.length > 0) {
            console.log(`✅ Found ${data.length} notifications:\n`)
            data.forEach((notif, i) => {
                console.log(`${i + 1}. ${notif.title}`)
                console.log(`   Message: ${notif.message.substring(0, 60)}...`)
                console.log(`   Type: ${notif.type}`)
                console.log(`   Created: ${new Date(notif.created_at).toLocaleString()}\n`)
            })
        } else {
            console.log('⚠️  No notifications found in database.')
            console.log('\n📋 To add test notifications:')
            console.log('1. Go to Supabase Dashboard → SQL Editor')
            console.log('2. Run the INSERT statement shown above')
        }

    } catch (error) {
        console.error('❌ Error:', error.message)
    }
}

checkNotifications()
