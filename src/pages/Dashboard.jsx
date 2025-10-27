import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import UserDashboard from '../components/UserDashboard.jsx'
import PremiumLoader from '../components/PremiumLoader.jsx'

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
    return <PremiumLoader message="Loading your dashboard..." minDuration={0} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Dashboard Content */}
      <UserDashboard onNavigate={onNavigate} />
    </div>
  )
}

export default Dashboard
