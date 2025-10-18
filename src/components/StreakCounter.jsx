import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../supabaseClient.jsx'

const StreakCounter = () => {
  const { user } = useAuth()
  const [streakData, setStreakData] = useState({
    dayStreak: 0,
    monthlyConfessions: 0,
    totalConfessions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchStreakData()
    } else {
      // For demo purposes, show some sample data
      setStreakData({
        dayStreak: 7,
        monthlyConfessions: 12,
        totalConfessions: 45
      })
      setLoading(false)
    }
  }, [user])

  const fetchStreakData = async () => {
    try {
      setLoading(true)
      const userId = user?.id

      // Get day streak using the database function
      const { data: streakData, error: streakError } = await supabase
        .rpc('get_user_confession_streak', { user_uuid: userId })

      // Get monthly confessions using the database function
      const { data: monthlyData, error: monthlyError } = await supabase
        .rpc('get_user_monthly_confessions', { user_uuid: userId })

      // Get total confessions using the database function
      const { data: totalData, error: totalError } = await supabase
        .rpc('get_user_total_confessions', { user_uuid: userId })

      if (streakError) console.error('Error fetching streak:', streakError)
      if (monthlyError) console.error('Error fetching monthly:', monthlyError)
      if (totalError) console.error('Error fetching total:', totalError)

      setStreakData({
        dayStreak: streakData || 0,
        monthlyConfessions: monthlyData || 0,
        totalConfessions: totalData || 0
      })
    } catch (error) {
      console.error('Error fetching streak data:', error)
      // Fallback to demo data
      setStreakData({
        dayStreak: 7,
        monthlyConfessions: 12,
        totalConfessions: 45
      })
    } finally {
      setLoading(false)
    }
  }

  // Function to refresh streak data (can be called from parent component)
  const refreshStreakData = () => {
    if (user) {
      fetchStreakData()
    }
  }

  // Expose refresh function to parent component
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.refreshStreakData = refreshStreakData
    }
  }, [user])
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="group p-8 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 border-0 shadow-2xl hover:shadow-3xl transition-all duration-200 hover:scale-102">
        <div className="flex items-center justify-between mb-6">
          <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg group-hover:scale-105 transition-transform duration-200">
            <span className="text-3xl">🔥</span>
          </div>
          <div className="text-right">
            <span className="text-5xl font-black text-white">
              {loading ? '...' : streakData.dayStreak}
            </span>
            <div className="w-12 h-1 bg-white/30 rounded-full mt-2">
              <div 
                className="h-1 bg-white rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((streakData.dayStreak / 30) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-2">Day Streak</h3>
          <p className="text-white/80 text-sm">Keep the fire burning! 🔥</p>
        </div>
      </Card>

      <Card className="group p-8 bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 border-0 shadow-2xl hover:shadow-3xl transition-all duration-200 hover:scale-102">
        <div className="flex items-center justify-between mb-6">
          <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg group-hover:scale-105 transition-transform duration-200">
            <span className="text-3xl">📅</span>
          </div>
          <div className="text-right">
            <span className="text-5xl font-black text-white">
              {loading ? '...' : streakData.monthlyConfessions}
            </span>
            <div className="w-12 h-1 bg-white/30 rounded-full mt-2">
              <div 
                className="h-1 bg-white rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((streakData.monthlyConfessions / 31) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-2">This Month</h3>
          <p className="text-white/80 text-sm">Days of spiritual growth</p>
        </div>
      </Card>

      <Card className="group p-8 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 border-0 shadow-2xl hover:shadow-3xl transition-all duration-200 hover:scale-102">
        <div className="flex items-center justify-between mb-6">
          <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg group-hover:scale-105 transition-transform duration-200">
            <span className="text-3xl">🏆</span>
          </div>
          <div className="text-right">
            <span className="text-5xl font-black text-white">
              {loading ? '...' : streakData.totalConfessions}
            </span>
            <div className="w-12 h-1 bg-white/30 rounded-full mt-2">
              <div 
                className="h-1 bg-white rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((streakData.totalConfessions / 100) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-2">Total Confessions</h3>
          <p className="text-white/80 text-sm">Declaring God's truth daily</p>
        </div>
      </Card>
    </div>
  )
}

export default StreakCounter