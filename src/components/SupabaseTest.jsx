import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient.jsx'

const SupabaseTest = () => {
  const [status, setStatus] = useState('Testing...')
  const [error, setError] = useState(null)

  useEffect(() => {
    const testSupabase = async () => {
      try {
        // Test basic Supabase connection
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setError(`Supabase Error: ${error.message}`)
          setStatus('❌ Supabase Error')
        } else {
          setStatus('✅ Supabase Connected')
        }
      } catch (err) {
        setError(`Connection Error: ${err.message}`)
        setStatus('❌ Connection Failed')
      }
    }

    testSupabase()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Supabase Test</h1>
        <p className="text-lg text-gray-600 mb-4">Testing Supabase connection...</p>
        <div className="text-2xl font-bold mb-4">{status}</div>
        {error && (
          <div className="text-red-600 bg-red-100 p-4 rounded-lg max-w-md mx-auto">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

export default SupabaseTest
