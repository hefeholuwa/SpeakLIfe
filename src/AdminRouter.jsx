import React from 'react'
import AdminDashboard from './components/AdminDashboard.jsx'

const AdminRouter = () => {
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

  return <AdminDashboard onNavigate={navigateTo} />
}

export default AdminRouter
