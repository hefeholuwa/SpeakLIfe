import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../supabaseClient.jsx'
import BibleReader from '../components/BibleReader.jsx'
import Register from '../components/Register.jsx'
import Login from '../components/Login.jsx'
import PremiumLoader from '../components/PremiumLoader.jsx'

const LandingPage = ({ onNavigate }) => {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [minLoadingComplete, setMinLoadingComplete] = useState(false)
  const [topics, setTopics] = useState([])
  const [verses, setVerses] = useState([])
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('home')
  const [showRegistration, setShowRegistration] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  const fetchData = async () => {
    try {
      // Fetch topics and verses
      const [topicsRes, versesRes] = await Promise.all([
        supabase.from('topics').select('*').order('title'),
        supabase.from('verses').select(`
          *,
          topics(title)
        `).order('created_at', { ascending: false })
      ])

      if (topicsRes.error) throw topicsRes.error
      if (versesRes.error) throw versesRes.error

      setTopics(topicsRes.data)
      setVerses(versesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    // Ensure minimum loading duration of 2 seconds
    const minTimer = setTimeout(() => {
      setMinLoadingComplete(true)
      setLoading(false)
    }, 2000)

    fetchData()

    return () => clearTimeout(minTimer)
  }, [])

  // Listen for email verification events
  useEffect(() => {
    let hasNavigated = false
    
    const handleUserVerified = (event) => {
      
      // Only redirect if we're not on the admin route
      const currentPath = window.location.pathname
      if (currentPath === '/admin') {
        return
      }
      
      // Prevent duplicate navigation
      if (hasNavigated) {
        return
      }
      
      hasNavigated = true
      // Automatically navigate to dashboard when user verifies email
      onNavigate('dashboard')
    }

    window.addEventListener('userVerified', handleUserVerified)
    
    return () => {
      window.removeEventListener('userVerified', handleUserVerified)
    }
  }, [onNavigate])

  // Check if user is already verified and redirect to dashboard
  useEffect(() => {
    // Only redirect if we're not on the admin route
    const currentPath = window.location.pathname
    if (user && user.email_confirmed_at && currentPath !== '/admin') {
      onNavigate('dashboard')
    }
  }, [user, onNavigate])

  // Show premium loading screen while checking authentication
  if (authLoading) {
    return <PremiumLoader message="Preparing your spiritual journey..." />
  }

  const filteredVerses = verses.filter(verse => {
    const matchesTopic = !selectedTopic || verse.topic_id === selectedTopic.id
    const matchesSearch = !searchQuery || 
      verse.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      verse.scripture_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      verse.confession_text.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTopic && matchesSearch
  })



  if (loading) {
    return <PremiumLoader message="Loading your spiritual journey..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 overflow-x-hidden">
      {/* Simple Mobile App Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          {/* Mobile Layout */}
          <div className="block md:hidden">
            {/* Simple Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SL</span>
                </div>
                <h1 className="text-lg font-semibold text-gray-900">SpeakLife</h1>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowLogin(true)}
                  className="text-gray-600 px-3 py-1.5 text-sm"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => setShowRegistration(true)}
                  className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
                >
                  Get Started
                </button>
              </div>
            </div>
            
            {/* Simple Tab Bar */}
            <div className="flex border-t border-gray-200">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === 'home'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('bible')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === 'bible'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500'
                }`}
              >
                Bible
              </button>
            </div>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                    <span className="text-white font-black text-2xl">SL</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-800">SpeakLife</h1>
                  <p className="text-sm text-gray-600 font-medium">One Confession at a Time</p>
                </div>
              </div>
              
              {/* Header Options */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    activeTab === 'home'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 backdrop-blur-sm'
                  }`}
                >
                  🏠 Home
                </button>
                <button
                  onClick={() => setActiveTab('bible')}
                  className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    activeTab === 'bible'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 backdrop-blur-sm'
                  }`}
                >
                  📖 Bible
                </button>
              </div>
            </div>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search bible"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const event = new CustomEvent('searchBible', { detail: searchQuery })
                      window.dispatchEvent(event)
                    }
                  }}
                  className="w-full pl-12 pr-14 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all shadow-lg"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">🔍</span>
                </div>
                <button
                  onClick={() => {
                    const event = new CustomEvent('searchBible', { detail: searchQuery })
                    window.dispatchEvent(event)
                  }}
                  disabled={!searchQuery.trim()}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-lg">🚀</span>
                </button>
              </div>
            </div>
            
            {/* Enhanced Profile Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">
                        {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">
                      {user.user_metadata?.full_name || 'User'}
                    </span>
                  </div>
                  <button 
                    onClick={() => onNavigate('dashboard')}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-2xl hover:from-purple-700 hover:to-pink-600 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    🚀 Dashboard
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setShowRegistration(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-2xl hover:from-purple-700 hover:to-pink-600 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    ✨ Get Started
                  </button>
                  <button 
                    onClick={() => setShowLogin(true)}
                    className="text-gray-600 hover:text-gray-900 px-4 py-3 rounded-2xl hover:bg-white/50 backdrop-blur-sm transition-all duration-300 text-sm font-bold"
                  >
                    🔑 Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>


      <div className="max-w-4xl mx-auto px-4 py-6 md:py-4">
        {/* Landing Page */}
        {activeTab === 'home' && (
          <>
            {/* Simple Hero Section */}
            <div className="text-center py-6 md:py-20 mb-8 md:mb-20">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
                  Welcome to <span className="text-purple-600">SpeakLife</span>
                </h1>
                <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8">
                  Transform your spiritual journey with personalized confessions, divine verses, and guidance.
                </p>
                
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center">
                  <button 
                    onClick={() => setShowRegistration(true)}
                    className="bg-purple-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Get Started
                  </button>
                  <button className="border border-purple-600 text-purple-600 px-6 py-3 md:px-8 md:py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-purple-50 transition-colors">
                    Learn More
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile-First Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-12 mb-8 md:mb-24">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-10 text-center">
                <div className="w-12 h-12 md:w-24 md:h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-8 shadow-md">
                  <span className="text-white text-lg md:text-4xl">🙏</span>
                </div>
                <h3 className="text-base md:text-2xl font-bold text-gray-800 mb-2 md:mb-6">Personalized Confessions</h3>
                <p className="text-xs md:text-lg text-gray-600 leading-relaxed">
                  Generate spiritual confessions tailored to your journey and current season of life.
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-10 text-center">
                <div className="w-12 h-12 md:w-24 md:h-24 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-8 shadow-md">
                  <span className="text-white text-lg md:text-4xl">📖</span>
                </div>
                <h3 className="text-base md:text-2xl font-bold text-gray-800 mb-2 md:mb-6">Personalized Verses</h3>
                <p className="text-xs md:text-lg text-gray-600 leading-relaxed">
                  Discover unique Bible verses and confessions that speak directly to your spiritual focus areas.
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-10 text-center">
                <div className="w-12 h-12 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-8 shadow-md">
                  <span className="text-white text-lg md:text-4xl">✨</span>
                </div>
                <h3 className="text-base md:text-2xl font-bold text-gray-800 mb-2 md:mb-6">Divine Guidance</h3>
                <p className="text-xs md:text-lg text-gray-600 leading-relaxed">
                  Receive spiritual guidance and encouragement that understands your faith journey.
                </p>
              </div>
            </div>

            {/* Mobile-First CTA Section */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl md:rounded-3xl p-6 md:p-16 text-center text-white">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-8">
                <span className="text-white text-xl md:text-3xl">🌟</span>
              </div>
              <h2 className="text-xl md:text-5xl font-black mb-3 md:mb-8">Ready to Transform Your Spiritual Life?</h2>
              <p className="text-sm md:text-2xl mb-4 md:mb-12 opacity-90 max-w-2xl mx-auto leading-relaxed">
                Join thousands of believers who are experiencing deeper spiritual growth through personalized confessions.
              </p>
              <button 
                onClick={() => onNavigate('dashboard')}
                className="bg-white text-purple-600 px-6 md:px-16 py-3 md:py-6 rounded-lg md:rounded-2xl text-sm md:text-xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>🚀</span>
                  <span>Start Your Journey</span>
                  <span>✨</span>
                </span>
              </button>
            </div>
          </>
        )}

        {/* Bible Tab */}
        {activeTab === 'bible' && (
          <BibleReader searchQuery={searchQuery} />
        )}

      </div>


      {/* Enhanced Footer */}
      <footer className="bg-white/80 backdrop-blur-xl border-t border-white/20 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white font-black text-lg">SL</span>
              </div>
              <div>
                <span className="text-2xl font-black text-gray-800">SpeakLife</span>
                <p className="text-sm text-gray-600 font-medium">One Confession at a Time</p>
              </div>
            </div>
            <p className="text-gray-600 text-lg font-medium mb-8">
              Powered by The Pillars Prayer Network
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <span className="hover:text-purple-600 transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-purple-600 transition-colors cursor-pointer">Terms of Service</span>
              <span className="hover:text-purple-600 transition-colors cursor-pointer">Contact Us</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Authentication Modals */}

      {showRegistration && (
        <Register 
          onClose={() => setShowRegistration(false)}
          onSuccess={() => {
            setShowRegistration(false)
            // Navigate to dashboard after email verification
            onNavigate('dashboard')
          }}
          onSwitchToLogin={() => {
            setShowRegistration(false)
            setShowLogin(true)
          }}
        />
      )}

      {showLogin && (
        <Login 
          onClose={() => setShowLogin(false)}
          onSuccess={() => {
            setShowLogin(false)
            onNavigate('dashboard')
          }}
          onSwitchToRegister={() => {
            setShowLogin(false)
            setShowRegistration(true)
          }}
        />
      )}
    </div>
  )
}

export default LandingPage

