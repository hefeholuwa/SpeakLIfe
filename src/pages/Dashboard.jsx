import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import UserDashboard from '../components/UserDashboard.jsx'
import PremiumLoader from '../components/PremiumLoader.jsx'

const Dashboard = ({ onNavigate }) => {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [minLoadingComplete, setMinLoadingComplete] = useState(false)

  useEffect(() => {
    // Ensure minimum loading duration of 2 seconds
    const minTimer = setTimeout(() => {
      setMinLoadingComplete(true)
    }, 2000)

    return () => clearTimeout(minTimer)
  }, [])

  useEffect(() => {
    // Check if user is authenticated
    if (!authLoading && minLoadingComplete) {
      if (!user) {
        // User is not authenticated, redirect to landing page
        onNavigate('landing')
        return
      }
      setLoading(false)
    }
  }, [user, authLoading, minLoadingComplete, onNavigate])

  if (loading) {
    return <PremiumLoader message="Loading your dashboard..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Dashboard Content */}
      <UserDashboard />
    </div>
  )
}

export default Dashboard
