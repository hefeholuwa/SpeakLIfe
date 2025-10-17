import { useState, useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext.jsx'
import LandingPage from './pages/LandingPage.jsx'
import Dashboard from './pages/Dashboard.jsx'

const AppRouter = () => {
  const [currentRoute, setCurrentRoute] = useState('landing')

  useEffect(() => {
    // Check URL on load
    const path = window.location.pathname
    if (path === '/dashboard') {
      setCurrentRoute('dashboard')
    } else {
      setCurrentRoute('landing')
    }

    // Listen for browser back/forward
    const handlePopState = () => {
      const path = window.location.pathname
      if (path === '/dashboard') {
        setCurrentRoute('dashboard')
      } else {
        setCurrentRoute('landing')
      }
    }

    // Listen for logout events
    const handleUserLoggedOut = () => {
      setCurrentRoute('landing')
      window.history.pushState({}, '', '/')
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('userLoggedOut', handleUserLoggedOut)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('userLoggedOut', handleUserLoggedOut)
    }
  }, [])

  const navigateTo = (route) => {
    if (route === 'dashboard') {
      window.history.pushState({}, '', '/dashboard')
      setCurrentRoute('dashboard')
    } else {
      window.history.pushState({}, '', '/')
      setCurrentRoute('landing')
    }
  }

  // Pass navigation function to components
  if (currentRoute === 'dashboard') {
    return (
      <AuthProvider>
        <Dashboard onNavigate={navigateTo} />
      </AuthProvider>
    )
  }

  return (
    <AuthProvider>
      <LandingPage onNavigate={navigateTo} />
    </AuthProvider>
  )
}

export default AppRouter
