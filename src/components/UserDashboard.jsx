import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import DashboardHeader from './DashboardHeader'
import DailyVerseHero from './DailyVerseHero'
import ReadingProgress from './ReadingProgress'
import QuickActions from './QuickActions'
import TopicLibrary from './TopicLibrary'
import RecentActivity from './RecentActivity'
import UserProfile from './UserProfile'
import BibleReader from './BibleReader'
import BibleSection from './BibleSection'
import ConfessionJournal from './ConfessionJournal'
import ReadingPlans from './ReadingPlans'
import notificationService from '../services/notificationService'

const UserDashboard = ({ onNavigate }) => {
  const { user, needsVerification } = useAuth()
  const [showProfile, setShowProfile] = useState(false)
  const [activeTab, setActiveTab] = useState('home')

  // Initialize notifications on component mount
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Request notification permission
        await notificationService.requestPermission();
        
        // Register service worker
        await notificationService.registerServiceWorker();
        
        // Set up daily notifications
        await notificationService.setupDailyNotifications();
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    initializeNotifications();
  }, []);



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

        {activeTab === 'home' && (
          <>
            <DailyVerseHero />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ReadingProgress />
              <QuickActions onNavigate={onNavigate} />
            </div>

            <TopicLibrary />

            <RecentActivity />
          </>
        )}

        {activeTab === 'bible' && (
          <BibleSection />
        )}

        {activeTab === 'confessions' && (
          <ConfessionJournal />
        )}

        {activeTab === 'plans' && (
          <ReadingPlans />
        )}

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