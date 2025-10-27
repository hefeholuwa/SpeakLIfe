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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Dashboard Test</h1>
          <p className="text-lg text-gray-600 mb-4">Dashboard wrapper loaded successfully</p>
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-2xl">✓</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
