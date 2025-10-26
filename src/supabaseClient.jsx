import { createClient } from '@supabase/supabase-js'

// Use fallback values for testing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

console.log('Environment check:', {
  hasSupabaseUrl: !!supabaseUrl,
  hasSupabaseKey: !!supabaseAnonKey,
  urlLength: supabaseUrl?.length || 0,
  keyLength: supabaseAnonKey?.length || 0
})

// Check if we're using placeholder values
const isUsingPlaceholders = supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder')

if (isUsingPlaceholders) {
  console.warn('Using placeholder Supabase credentials - app will show demo mode')
  
  // Show demo mode message
  const demoMessage = document.createElement('div')
  demoMessage.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; right: 0; background: #fbbf24; color: #92400e; padding: 12px; text-align: center; z-index: 9999; font-family: Arial, sans-serif;">
      <strong>Demo Mode:</strong> Environment variables not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel dashboard. (v2)
    </div>
  `
  document.body.appendChild(demoMessage)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
