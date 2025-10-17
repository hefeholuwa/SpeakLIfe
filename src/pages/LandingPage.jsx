import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../supabaseClient.jsx'
import AIPersonalizedVerses from '../components/AIPersonalizedVerses.jsx'
import BibleReader from '../components/BibleReader.jsx'
import Register from '../components/Register.jsx'
import Login from '../components/Login.jsx'

const LandingPage = ({ onNavigate }) => {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [topics, setTopics] = useState([])
  const [verses, setVerses] = useState([])
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('home')
  const [showRegistration, setShowRegistration] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      
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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Listen for email verification events
  useEffect(() => {
    const handleUserVerified = (event) => {
      console.log('User verified event received:', event.detail)
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
    if (user && user.email_confirmed_at) {
      console.log('User is already verified, redirecting to dashboard')
      onNavigate('dashboard')
    }
  }, [user, onNavigate])

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">SL</span>
          </div>
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-6 animate-pulse">✨</div>
          <p className="text-gray-600 text-xl font-light">Loading your spiritual journey...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - YouVersion Style */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Mobile Layout */}
          <div className="block md:hidden">
            {/* Top Row - Logo and Profile */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SL</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">SpeakLife</h1>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowRegistration(true)}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Get Started
                </button>
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center justify-center space-x-4 mb-4">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'home'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('bible')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'bible'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Bible
              </button>
            </div>
            
            {/* Search Bar - Full Width on Mobile */}
            <div className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search bible"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      // Trigger search in BibleReader
                      const event = new CustomEvent('searchBible', { detail: searchQuery })
                      window.dispatchEvent(event)
                    }
                  }}
                  className="w-full pl-10 pr-12 py-3 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-base"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  onClick={() => {
                    // Trigger search in BibleReader
                    const event = new CustomEvent('searchBible', { detail: searchQuery })
                    window.dispatchEvent(event)
                  }}
                  disabled={!searchQuery.trim()}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SL</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">SpeakLife</h1>
              </div>
              
              {/* Header Options */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'home'
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setActiveTab('bible')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'bible'
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Bible
                </button>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="max-w-sm">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search bible"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      // Trigger search in BibleReader
                      const event = new CustomEvent('searchBible', { detail: searchQuery })
                      window.dispatchEvent(event)
                    }
                  }}
                  className="w-full pl-10 pr-12 py-2 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  onClick={() => {
                    // Trigger search in BibleReader
                    const event = new CustomEvent('searchBible', { detail: searchQuery })
                    window.dispatchEvent(event)
                  }}
                  disabled={!searchQuery.trim()}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Profile Section */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {user.user_metadata?.full_name || 'User'}
                    </span>
                  </div>
                  <button 
                    onClick={() => onNavigate('dashboard')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Dashboard
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setShowRegistration(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Get Started
                  </button>
                  <button 
                    onClick={() => setShowLogin(true)}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Landing Page */}
        {activeTab === 'home' && (
          <>
            {/* Hero Section */}
            <div className="text-center py-8 md:py-16 mb-8 md:mb-16">
              <div className="max-w-4xl mx-auto">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8">
                  <span className="text-white font-bold text-xl md:text-2xl">SL</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
                  Welcome to <span className="text-blue-600">SpeakLife</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
                  Transform your spiritual journey with personalized confessions, divine verses, and guidance that speaks directly to your heart.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
                  <button 
                    onClick={() => setShowRegistration(true)}
                    className="bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    Get Started
                  </button>
                  <button className="border-2 border-blue-600 text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg font-semibold hover:bg-blue-50 transition-colors">
                    Learn More
                  </button>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <span className="text-purple-600 text-xl md:text-2xl">🙏</span>
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Personalized Confessions</h3>
                <p className="text-sm md:text-base text-gray-600">
                  Generate spiritual confessions tailored to your journey and current season of life.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <span className="text-green-600 text-xl md:text-2xl">📖</span>
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Personalized Verses</h3>
                <p className="text-sm md:text-base text-gray-600">
                  Discover unique Bible verses and confessions that speak directly to your spiritual focus areas.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <span className="text-blue-600 text-xl md:text-2xl">✨</span>
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Divine Guidance</h3>
                <p className="text-sm md:text-base text-gray-600">
                  Receive spiritual guidance and encouragement that understands your faith journey.
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 md:p-12 text-center text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Ready to Transform Your Spiritual Life?</h2>
              <p className="text-lg md:text-xl mb-6 md:mb-8 opacity-90 px-4">
                Join thousands of believers who are experiencing deeper spiritual growth through personalized confessions.
              </p>
              <button 
                onClick={() => onNavigate('dashboard')}
                className="bg-white text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Start Your Journey
              </button>
            </div>
          </>
        )}

        {/* Bible Tab */}
        {activeTab === 'bible' && (
          <BibleReader searchQuery={searchQuery} />
        )}

      </div>


      {/* Footer - YouVersion Style */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">SL</span>
              </div>
              <span className="text-gray-900 font-semibold">SpeakLife</span>
            </div>
            <p className="text-gray-500 text-sm">
              Powered by The Pillars Prayer Network
            </p>
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
