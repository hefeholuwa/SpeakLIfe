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
import notificationService from '../services/notificationService'

const UserDashboard = ({ onNavigate }) => {
  const { user, needsVerification, loading } = useAuth()
  const [showProfile, setShowProfile] = useState(false)
  const [activeTab, setActiveTab] = useState('home')

  // Handle navigation from QuickActions
  const handleNavigate = (tab) => {
    setActiveTab(tab)
  }

  // Initialize notifications on component mount
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Notification initialization timeout')), 5000)
        )

        const notificationPromise = (async () => {
          // Request notification permission
          await notificationService.requestPermission();
          
          // Register service worker
          await notificationService.registerServiceWorker();
          
          // Set up daily notifications
          await notificationService.setupDailyNotifications();
        })()

        await Promise.race([notificationPromise, timeoutPromise]);
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
        // Don't let notification errors block the app
      }
    };

    initializeNotifications();
  }, []);

  // Show loading screen if auth is still loading
  if (loading) {
    return (
      <div className="min-h-screen bg-celestial-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading SpeakLife...</h2>
          <p className="text-purple-200">Setting up your spiritual journey</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-celestial-gradient" style={{ willChange: 'auto' }}>
      <DashboardHeader onShowProfile={setShowProfile} />
      
      {/* Mobile-Optimized Navigation Tabs */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-white/20 sticky top-16 sm:top-20 z-40 shadow-lg">
        <div className="container mx-auto px-2 sm:px-4">
          <nav className="flex justify-around py-2 sm:py-4">
            <button
              onClick={() => setActiveTab('home')}
              className={`group relative px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 flex-1 max-w-24 sm:max-w-none ${
                activeTab === 'home'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg sm:shadow-xl transform scale-105'
                  : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50 hover:shadow-md hover:scale-105'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <span className="text-sm sm:text-lg">🏠</span>
                <span className="text-xs sm:text-sm">Home</span>
              </div>
              {activeTab === 'home' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('bible')}
              className={`group relative px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 flex-1 max-w-24 sm:max-w-none ${
                activeTab === 'bible'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg sm:shadow-xl transform scale-105'
                  : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50 hover:shadow-md hover:scale-105'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <span className="text-sm sm:text-lg">📖</span>
                <span className="text-xs sm:text-sm">Bible</span>
              </div>
              {activeTab === 'bible' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('confessions')}
              className={`group relative px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 flex-1 max-w-24 sm:max-w-none ${
                activeTab === 'confessions'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg sm:shadow-xl transform scale-105'
                  : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50 hover:shadow-md hover:scale-105'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <span className="text-sm sm:text-lg">📝</span>
                <span className="text-xs sm:text-sm">Journal</span>
              </div>
              {activeTab === 'confessions' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
              )}
            </button>
          </nav>
        </div>
      </div>
      
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
        <div className="space-y-1 sm:space-y-2">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Friend'} 👋
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Continue building your life around sound truth
          </p>
        </div>

        {activeTab === 'home' && (
          <>
            <DailyVerseHero />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              <ReadingProgress />
              <QuickActions onNavigate={handleNavigate} />
            </div>

            <TopicLibrary onNavigate={onNavigate} />

            <RecentActivity />
          </>
        )}

        {activeTab === 'bible' && (
          <BibleSection />
        )}

        {activeTab === 'confessions' && (
          <ConfessionJournal />
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