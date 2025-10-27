import { useState, useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext.jsx'
import LandingPage from './pages/LandingPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import BibleSection from './components/BibleSection.jsx'
import TopicDetail from './components/TopicDetail.jsx'

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
    } else if (path.startsWith('/topic/')) {
      setCurrentRoute('topic')
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
      } else if (path.startsWith('/topic/')) {
        setCurrentRoute('topic')
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🔧</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin Panel</h1>
          <p className="text-lg text-gray-600 mb-6">
            The admin panel is currently under development and will be available soon.
          </p>
          <button
            onClick={() => navigateTo('landing')}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  if (currentRoute === 'topic') {
    return (
      <AuthProvider>
        <TopicDetail />
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
