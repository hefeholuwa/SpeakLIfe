import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.jsx'

const AdminAuthContext = createContext({})

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Admin email list - in production, this should be in a database
  const ADMIN_EMAILS = [
    'admin@speaklife.app',
    'hefeholuwa@gmail.com', // Add your admin email here
    // Add more admin emails as needed
  ]

  // Check if user is admin
  const checkAdminStatus = async (user) => {
    if (!user) {
      setIsAdmin(false)
      setAdminUser(null)
      return false
    }

    try {
      // Check if user email is in admin list
      const isAdminEmail = ADMIN_EMAILS.includes(user.email)
      console.log('Checking admin status for:', user.email, 'Is admin email:', isAdminEmail)
      
      if (isAdminEmail) {
        // For admin emails, we'll create/update the profile with admin role
        // This avoids the RLS recursion issue
        console.log('Fetching profile for admin user...')
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, create admin profile
          console.log('Creating admin profile...')
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email.split('@')[0],
              role: 'admin',
              is_admin: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (insertError) {
            console.error('Error creating admin profile:', insertError)
            return false
          }

          console.log('Admin profile created successfully')
          setIsAdmin(true)
          setAdminUser({ ...user, role: 'admin', is_admin: true })
          return true
        } else if (error) {
          console.error('Error fetching admin profile:', error)
          return false
        } else {
          // Profile exists, update to admin if needed
          console.log('Profile found:', profile)
          if (profile.role !== 'admin' || !profile.is_admin) {
            console.log('Updating profile to admin...')
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                role: 'admin',
                is_admin: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id)

            if (updateError) {
              console.error('Error updating admin profile:', updateError)
              return false
            }
            console.log('Profile updated to admin successfully')
          }

          console.log('Setting admin user and status')
          setIsAdmin(true)
          setAdminUser({ ...user, ...profile, role: 'admin', is_admin: true })
          return true
        }
      } else {
        setIsAdmin(false)
        setAdminUser(null)
        return false
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      setError(error.message)
      setIsAdmin(false)
      setAdminUser(null)
      return false
    }
  }

  // Admin sign in
  const adminSignIn = async (email, password) => {
    try {
      setError(null)
      setLoading(true)

      // Check if email is in admin list first
      if (!ADMIN_EMAILS.includes(email)) {
        setError('Access denied. Admin privileges required.')
        return { success: false, error: 'Access denied. Admin privileges required.' }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      if (data.user) {
        const isAdminUser = await checkAdminStatus(data.user)
        if (isAdminUser) {
          return { success: true, data }
        } else {
          // Sign out if not admin
          await supabase.auth.signOut()
          setError('Access denied. Admin privileges required.')
          return { success: false, error: 'Access denied. Admin privileges required.' }
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

  // Admin sign out
  const adminSignOut = async () => {
    try {
      setError(null)
      await supabase.auth.signOut()
      setAdminUser(null)
      setIsAdmin(false)
      return { success: true }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  // Check admin status on mount and auth changes
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setError(error.message)
        } else {
          if (session?.user) {
            await checkAdminStatus(session.user)
          } else {
            setIsAdmin(false)
            setAdminUser(null)
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setError(error.message)
        setIsAdmin(false)
        setAdminUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await checkAdminStatus(session.user)
        } else if (event === 'SIGNED_OUT') {
          setIsAdmin(false)
          setAdminUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    adminUser,
    isAdmin,
    loading,
    error,
    setError,
    adminSignIn,
    adminSignOut,
    checkAdminStatus
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export default AdminAuthContext
