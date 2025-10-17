import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import UserDashboard from '../components/UserDashboard.jsx'

const Dashboard = ({ onNavigate }) => {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    if (!authLoading) {
      if (!user) {
        // User is not authenticated, redirect to landing page
        onNavigate('landing')
        return
      }
      setLoading(false)
    }
  }, [user, authLoading, onNavigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-6 animate-pulse">✨</div>
          <p className="text-gray-600 text-xl font-light">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Content */}
      <UserDashboard />
    </div>
  )
}

export default Dashboard
