import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

console.log('Environment check:', {
  hasSupabaseUrl: !!supabaseUrl,
  hasSupabaseKey: !!supabaseAnonKey,
  urlLength: supabaseUrl?.length || 0,
  keyLength: supabaseAnonKey?.length || 0
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    supabaseUrl: supabaseUrl ? 'Present' : 'Missing',
    supabaseAnonKey: supabaseAnonKey ? 'Present' : 'Missing'
  })
  
  // Show error message on page
  document.body.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
      <div style="text-align: center; padding: 20px; border: 2px solid #ef4444; border-radius: 8px; background: #fef2f2;">
        <h2 style="color: #dc2626; margin-bottom: 16px;">Configuration Error</h2>
        <p style="color: #7f1d1d; margin-bottom: 8px;">Missing environment variables:</p>
        <ul style="color: #7f1d1d; text-align: left;">
          <li>VITE_SUPABASE_URL: ${supabaseUrl ? '✓ Present' : '✗ Missing'}</li>
          <li>VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓ Present' : '✗ Missing'}</li>
        </ul>
        <p style="color: #7f1d1d; margin-top: 16px; font-size: 14px;">
          Please set these environment variables in your Vercel dashboard.
        </p>
      </div>
    </div>
  `
  throw new Error('Missing required environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
