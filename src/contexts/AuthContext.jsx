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
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasDispatchedVerified, setHasDispatchedVerified] = useState(false)

  // Simplified user profile loading - just set to null for now
  const loadUserProfile = async (authUser) => {
    setUserProfile(null)
  }

  useEffect(() => {
    // Simplified initial session check
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setError(error.message)
        } else {
          setUser(session?.user || null)
          
          // Load user profile if user exists (simplified)
          if (session?.user) {
            setUserProfile(null)
          }
        }
        
        setLoading(false)
        
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setError(error.message)
        setLoading(false)
      }
    }

    getInitialSession()


    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        
        // Load user profile on auth changes
        if (session?.user) {
          try {
            await loadUserProfile(session.user)
          } catch (error) {
            console.error('Error loading user profile in auth change:', error)
            setUserProfile(null)
          }
        } else {
          setUserProfile(null)
        }
        
        setLoading(false)
        
        // If user just verified their email, dispatch a custom event
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at && !hasDispatchedVerified) {
          setHasDispatchedVerified(true)
          window.dispatchEvent(new CustomEvent('userVerified', { 
            detail: { user: session.user, session } 
          }))
        }
        
        // Also check for TOKEN_REFRESHED event which happens after email verification
        if (event === 'TOKEN_REFRESHED' && session?.user?.email_confirmed_at && !hasDispatchedVerified) {
          setHasDispatchedVerified(true)
          window.dispatchEvent(new CustomEvent('userVerified', { 
            detail: { user: session.user, session } 
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

      // Load user profile after successful login
      if (data.user) {
        try {
          await loadUserProfile(data.user)
        } catch (profileError) {
          console.error('Error loading user profile after login:', profileError)
          // Continue anyway, don't block the login
        }
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
      
      // Clear user state immediately
      setUser(null)
      setUserProfile(null)
      
      // Try Supabase logout but don't wait for it
      supabase.auth.signOut().catch(err => {
        // Supabase logout failed, but continuing with local logout
      })
      
      // Dispatch custom event to notify components of logout
      window.dispatchEvent(new CustomEvent('userLoggedOut'))
      
      return { success: true }
    } catch (error) {
      console.error('Error in signOut:', error)
      // Even if there's an error, clear the user and logout locally
      setUser(null)
      window.dispatchEvent(new CustomEvent('userLoggedOut'))
      return { success: true }
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
    userProfile,
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
