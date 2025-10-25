import React from 'react'
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext'
import AdminDashboard from './components/AdminDashboard.jsx'
import AdminLogin from './components/AdminLogin.jsx'

const AdminRouterContent = () => {
  const { isAdmin, loading } = useAdminAuth()

  const navigateTo = (route) => {
    if (route === 'dashboard') {
      window.history.pushState({}, '', '/dashboard')
      window.location.reload()
    } else if (route === 'bible') {
      window.history.pushState({}, '', '/bible')
      window.location.reload()
    } else {
      window.history.pushState({}, '', '/')
      window.location.reload()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return <AdminLogin onSuccess={() => window.location.reload()} />
  }

  return <AdminDashboard onNavigate={navigateTo} />
}

const AdminRouter = () => {
  return (
    <AdminAuthProvider>
      <AdminRouterContent />
    </AdminAuthProvider>
  )
}

export default AdminRouter
