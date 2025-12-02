import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDeclarationsSystem() {
    console.log('🚀 Setting up Declarations System...\n')

    try {
        // Check if life_areas table exists
        const { data: lifeAreas, error } = await supabase
            .from('life_areas')
            .select('*')
            .limit(1)

        if (!error && lifeAreas) {
            console.log('✅ Declarations system tables already exist!')

            // Show life areas
            const { data: areas } = await supabase
                .from('life_areas')
                .select('*')
                .order('sort_order')

            console.log(`\n📋 Found ${areas?.length || 0} Life Areas:`)
            areas?.forEach(area => {
                console.log(`  ${area.icon} ${area.name}`)
            })

            return
        }

        console.log('⚠️  Tables do not exist yet.')
        console.log('\n📋 To create the declarations system:')
        console.log('1. Go to your Supabase Dashboard')
        console.log('2. Navigate to SQL Editor')
        console.log('3. Run the migration file:')
        console.log('   supabase/migrations/20251202095400_create_declarations_system.sql')
        console.log('\nThis will create:')
        console.log('  - life_areas (8 default categories)')
        console.log('  - user_declarations (your personal declarations)')
        console.log('  - practice_sessions (daily practice tracking)')
        console.log('  - session_declarations (what you practiced)')
        console.log('  - practice_streaks (gamification)')

    } catch (error) {
        console.error('❌ Error:', error.message)
    }
}

setupDeclarationsSystem()
