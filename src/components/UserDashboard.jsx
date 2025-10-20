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
  const { user, needsVerification } = useAuth()
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
      
      {/* Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-20 z-40">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-1 py-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'home'
                  ? 'bg-purple-100 text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              🏠 Home
            </button>
            <button
              onClick={() => setActiveTab('bible')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'bible'
                  ? 'bg-purple-100 text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              📖 Bible
            </button>
            <button
              onClick={() => setActiveTab('confessions')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'confessions'
                  ? 'bg-purple-100 text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              📝 Confession Journal
            </button>
          </nav>
        </div>
      </div>
      
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



        {/* Admin Access */}
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => window.location.href = '/admin'}
            className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-900 transition-colors"
            title="Admin Dashboard"
          >
            🔧
          </button>
        </div>

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