import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import DashboardHeader from './DashboardHeader'
import DailyVerseHero from './DailyVerseHero'
import StreakCounter from './StreakCounter'
import ReadingProgress from './ReadingProgress'
import QuickActions from './QuickActions'
import TopicLibrary from './TopicLibrary'
import RecentActivity from './RecentActivity'
import UserProfile from './UserProfile'

const UserDashboard = () => {
  const { user, needsVerification } = useAuth()
  const [showProfile, setShowProfile] = useState(false)
  const [activeTab, setActiveTab] = useState('home')


  return (
    <div className="min-h-screen bg-celestial-gradient" style={{ willChange: 'auto' }}>
      <DashboardHeader onShowProfile={setShowProfile} />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Friend'} 👋
          </h2>
          <p className="text-muted-foreground">
            Continue building your life around sound truth
          </p>
        </div>

        <DailyVerseHero />
        
        <StreakCounter />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ReadingProgress />
          <QuickActions />
        </div>

        <TopicLibrary />

        <RecentActivity />

      </main>


      {/* User Profile Modal */}
      {showProfile && (
        <UserProfile 
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  )
}

export default UserDashboard