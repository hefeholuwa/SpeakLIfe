import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase URL or Anon Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSignup() {
    const email = `test.signup.${Date.now()}@example.com`
    const password = 'password123'

    console.log(`Attempting signup for: ${email}`)

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        console.error('Signup Error:', error)
    } else {
        console.log('Signup Success!')
        console.log('User ID:', data.user?.id)
        console.log('Session exists?', !!data.session)
        console.log('User Confirmed At:', data.user?.email_confirmed_at)
        console.log('User Role:', data.user?.role)
        console.log('App Metadata:', data.user?.app_metadata)

        if (data.user && !data.session) {
            console.log('RESULT: Verification REQUIRED (Correct behavior)')
        } else {
            console.log('RESULT: Verification NOT required (Session created immediately)')
        }
    }
}

testSignup()
