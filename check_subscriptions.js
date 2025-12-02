import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSubscriptions() {
    console.log('🔍 Checking push subscriptions...')
    const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')

    if (error) {
        console.error('❌ Error:', error.message)
    } else {
        console.log(`✅ Found ${data.length} subscriptions.`)
        console.log(data)
    }
}

checkSubscriptions()
