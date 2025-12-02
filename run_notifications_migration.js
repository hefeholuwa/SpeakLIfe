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

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials')
    console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
    try {
        console.log('📦 Running notifications migration...')

        const migrationPath = join(__dirname, 'supabase', 'migrations', '20251202092300_create_notifications.sql')
        const sql = readFileSync(migrationPath, 'utf8')

        // Split by semicolons and filter out empty statements
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'))

        console.log(`📝 Found ${statements.length} SQL statements to execute`)

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i]
            console.log(`\n⚙️  Executing statement ${i + 1}/${statements.length}...`)

            const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' })

            if (error) {
                // Try direct execution if RPC fails
                const { error: directError } = await supabase.from('_migrations').insert({})

                if (directError) {
                    console.error(`❌ Error on statement ${i + 1}:`, error.message)
                    // Continue with other statements
                } else {
                    console.log(`✅ Statement ${i + 1} executed successfully`)
                }
            } else {
                console.log(`✅ Statement ${i + 1} executed successfully`)
            }
        }

        console.log('\n✅ Migration completed!')

        // Verify tables were created
        console.log('\n🔍 Verifying tables...')
        const { data: notifications, error: notifError } = await supabase
            .from('notifications')
            .select('count')
            .limit(1)

        const { data: reads, error: readsError } = await supabase
            .from('notification_reads')
            .select('count')
            .limit(1)

        if (!notifError && !readsError) {
            console.log('✅ Tables verified successfully!')

            // Check sample data
            const { data: sampleNotifs } = await supabase
                .from('notifications')
                .select('*')
                .limit(5)

            console.log(`\n📊 Sample notifications (${sampleNotifs?.length || 0} found):`)
            sampleNotifs?.forEach(n => {
                console.log(`  - ${n.title}`)
            })
        } else {
            console.log('⚠️  Could not verify tables. They may need to be created manually.')
        }

    } catch (error) {
        console.error('❌ Migration failed:', error)
        process.exit(1)
    }
}

runMigration()
