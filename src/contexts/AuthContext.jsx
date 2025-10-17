import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.jsx'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          setError(error.message)
        } else {
          setUser(session?.user || null)
          
          // If user is already verified on initial load, dispatch event
          if (session?.user?.email_confirmed_at) {
            console.log('User already verified on initial load, dispatching navigation event')
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('userVerified', { 
                detail: { user: session.user } 
              }))
            }, 100) // Small delay to ensure components are ready
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)
        setUser(session?.user || null)
        setLoading(false)
        
        // If user just verified their email, dispatch a custom event
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
          console.log('User verified email, dispatching navigation event')
          window.dispatchEvent(new CustomEvent('userVerified', { 
            detail: { user: session.user } 
          }))
        }
        
        // Also check for TOKEN_REFRESHED event which happens after email verification
        if (event === 'TOKEN_REFRESHED' && session?.user?.email_confirmed_at) {
          console.log('Token refreshed for verified user, dispatching navigation event')
          window.dispatchEvent(new CustomEvent('userVerified', { 
            detail: { user: session.user } 
          }))
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Sign up with email and password
  const signUp = async (email, password, fullName) => {
    try {
      setError(null)
      setLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        return { 
          success: true, 
          data, 
          requiresVerification: true,
          message: 'Please check your email to verify your account before signing in.'
        }
      }

      return { success: true, data, requiresVerification: false }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setError(null)
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      setUser(null)
      
      // Dispatch custom event to notify components of logout
      window.dispatchEvent(new CustomEvent('userLoggedOut'))
      
      return { success: true }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  // Reset password
  const resetPassword = async (email) => {
    try {
      setError(null)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      setError(null)
      
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      setUser(data.user)
      return { success: true, data }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  // Resend verification email
  const resendVerification = async (email) => {
    try {
      setError(null)
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }


  // Check if user needs email verification
  const needsVerification = user && !user.email_confirmed_at

  const value = {
    user,
    loading,
    error,
    needsVerification,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    resendVerification,
    setError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
