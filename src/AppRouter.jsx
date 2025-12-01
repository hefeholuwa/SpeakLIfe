import { useState, useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext.jsx'
import LandingPage from './pages/LandingPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import BibleSection from './components/BibleSection.jsx'
import AdminLogin from './pages/AdminLogin.jsx'

import AdminDashboard from './components/AdminDashboard.jsx'


const AppRouter = () => {
  const [currentRoute, setCurrentRoute] = useState('landing')

  useEffect(() => {
    // Check URL on load
    const path = window.location.pathname
    if (path === '/dashboard') {
      setCurrentRoute('dashboard')
    } else if (path === '/bible') {
      setCurrentRoute('bible')
    } else if (path === '/admin') {
      setCurrentRoute('admin')
    } else if (path === '/admin-login') {
      setCurrentRoute('admin-login')
    } else {
      setCurrentRoute('landing')
    }

    // Listen for browser back/forward
    const handlePopState = () => {
      const path = window.location.pathname
      if (path === '/dashboard') {
        setCurrentRoute('dashboard')
      } else if (path === '/bible') {
        setCurrentRoute('bible')
      } else if (path === '/admin') {
        setCurrentRoute('admin')
      } else if (path === '/admin-login') {
        setCurrentRoute('admin-login')
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
    } else if (route === 'bible') {
      window.history.pushState({}, '', '/bible')
      setCurrentRoute('bible')
    } else if (route === 'admin') {
      window.history.pushState({}, '', '/admin')
      setCurrentRoute('admin')
    } else if (route === 'admin-login') {
      window.history.pushState({}, '', '/admin-login')
      setCurrentRoute('admin-login')
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

  if (currentRoute === 'bible') {
    return <BibleSection />
  }

  if (currentRoute === 'admin') {
    return (
      <AuthProvider>
        <AdminDashboard onNavigate={navigateTo} />
      </AuthProvider>
    )
  }

  if (currentRoute === 'admin-login') {
    return <AdminLogin onNavigate={navigateTo} />
  }

  return (
    <AuthProvider>
      <LandingPage onNavigate={navigateTo} />
    </AuthProvider>
  )
}

export default AppRouter
