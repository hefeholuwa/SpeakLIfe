import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupNotifications() {
    console.log('🔧 Setting up notifications tables...\n')

    // Create notifications table
    const createNotificationsTable = `
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info' CHECK (type IN ('info', 'alert', 'success')),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      is_global BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `

    // Create notification_reads table
    const createReadsTable = `
    CREATE TABLE IF NOT EXISTS notification_reads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
      read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, notification_id)
    );
  `

    // Create indexes
    const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_global ON notifications(is_global);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_notification_reads_user_id ON notification_reads(user_id);
    CREATE INDEX IF NOT EXISTS idx_notification_reads_notification_id ON notification_reads(notification_id);
  `

    try {
        // Check if tables already exist
        const { data: existingNotifs, error: checkError } = await supabase
            .from('notifications')
            .select('id')
            .limit(1)

        if (!checkError) {
            console.log('✅ Notifications tables already exist!')

            // Show sample data
            const { data: sampleNotifs } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5)

            console.log(`\n📊 Found ${sampleNotifs?.length || 0} notifications:`)
            sampleNotifs?.forEach(n => {
                console.log(`  - ${n.title} (${n.type})`)
            })

            return
        }

        console.log('⚠️  Tables do not exist. Please run the SQL migration manually.')
        console.log('\n📋 Steps to create tables:')
        console.log('1. Go to your Supabase dashboard')
        console.log('2. Navigate to SQL Editor')
        console.log('3. Run the migration file: supabase/migrations/20251202092300_create_notifications.sql')
        console.log('\nOr copy and paste this SQL:\n')
        console.log('='.repeat(80))
        console.log(createNotificationsTable)
        console.log(createReadsTable)
        console.log(createIndexes)
        console.log('='.repeat(80))

    } catch (error) {
        console.error('❌ Error:', error.message)
    }
}

setupNotifications()
