import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function addTestNotifications() {
    console.log('📬 Adding test notifications...\n')

    const testNotifications = [
        {
            title: 'Welcome to SpeakLife! 🎉',
            message: 'Thank you for joining our spiritual community. Start your journey today by exploring the daily verse!',
            type: 'success',
            is_global: true
        },
        {
            title: 'Daily Verse Available 📖',
            message: 'Your daily verse and confession are ready. Take a moment to read and reflect on God\'s word.',
            type: 'info',
            is_global: true
        },
        {
            title: 'New Reading Plan Available 📚',
            message: 'A new 7-day reading plan "Growing in Faith" has been added. Start your spiritual growth journey today!',
            type: 'info',
            is_global: true
        },
        {
            title: 'Streak Milestone! 🔥',
            message: 'Congratulations! You\'ve maintained a 7-day streak. Keep up the amazing work!',
            type: 'success',
            is_global: true
        },
        {
            title: 'Community Update 💬',
            message: 'New discussions are happening in the community. Join the conversation and share your insights!',
            type: 'info',
            is_global: true
        }
    ]

    try {
        const { data, error } = await supabase
            .from('notifications')
            .insert(testNotifications)
            .select()

        if (error) {
            console.error('❌ Error adding notifications:', error.message)
            return
        }

        console.log(`✅ Successfully added ${data.length} test notifications!\n`)

        data.forEach((notif, i) => {
            console.log(`${i + 1}. ${notif.title}`)
            console.log(`   Type: ${notif.type}`)
            console.log(`   Global: ${notif.is_global}`)
            console.log(`   ID: ${notif.id}\n`)
        })

        console.log('🎯 You can now test the notification inbox in the app!')
        console.log('👉 Look for the bell icon in the dashboard header')

    } catch (error) {
        console.error('❌ Error:', error.message)
    }
}

addTestNotifications()
