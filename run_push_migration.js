import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
    try {
        console.log('📦 Running push subscriptions migration...')
        const migrationPath = join(__dirname, 'supabase', 'migrations', '20251202124500_create_push_subscriptions.sql')
        const sql = readFileSync(migrationPath, 'utf8')

        const { error } = await supabase.rpc('exec_sql', { sql_query: sql })

        if (error) {
            console.error('❌ RPC Error:', error.message)
            // Fallback: Try creating table directly via JS if RPC fails (often does on some setups)
            // But for DDL we really need SQL access.
            // If RPC fails, I'll instruct user to run it in dashboard.
        } else {
            console.log('✅ Migration executed successfully!')
        }
    } catch (error) {
        console.error('❌ Script Error:', error)
    }
}

runMigration()
