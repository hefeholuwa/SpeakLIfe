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
      {/* Enhanced Header with Glass Morphism */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          {/* Mobile Layout */}
          <div className="block md:hidden">
            {/* Top Row - Logo and Profile */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                    <span className="text-white font-black text-xl">SL</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-800">SpeakLife</h1>
                  <p className="text-xs text-gray-600 font-medium">One Confession at a Time</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setShowRegistration(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2.5 rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Get Started
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-gray-600 text-lg">👤</span>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center justify-center space-x-2 mb-6">
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
            
            {/* Enhanced Search Bar */}
            <div className="w-full">
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
                  className="w-full pl-12 pr-14 py-4 bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-base shadow-lg"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xl">🔍</span>
                </div>
                <button
                  onClick={() => {
                    const event = new CustomEvent('searchBible', { detail: searchQuery })
                    window.dispatchEvent(event)
                  }}
                  disabled={!searchQuery.trim()}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-xl">🚀</span>
                </button>
              </div>
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
            {/* Enhanced Hero Section */}
            <div className="relative text-center py-12 md:py-20 mb-12 md:mb-20">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-4 h-4 bg-purple-300/30 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-40 right-20 w-2 h-2 bg-pink-300/40 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-20 left-20 w-3 h-3 bg-blue-300/30 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-40 right-10 w-2 h-2 bg-purple-300/40 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
              </div>
              
              <div className="max-w-5xl mx-auto relative">
                <div className="relative group mb-8 md:mb-12">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110">
                    <span className="text-white font-black text-2xl md:text-3xl">SL</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse"></div>
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-gray-800 mb-6 md:mb-8 animate-fade-in-up">
                  Welcome to <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">SpeakLife</span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 md:mb-12 max-w-3xl mx-auto px-4 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  Transform your spiritual journey with personalized confessions, divine verses, and guidance that speaks directly to your heart.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center px-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <button 
                    onClick={() => setShowRegistration(true)}
                    className="group bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 rounded-2xl text-base sm:text-lg md:text-xl font-bold hover:from-purple-700 hover:via-pink-600 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
                  >
                    <span className="flex items-center justify-center gap-3">
                      <span className="text-2xl">✨</span>
                      <span>Get Started</span>
                      <span className="text-2xl group-hover:translate-x-1 transition-transform duration-300">🚀</span>
                    </span>
                  </button>
                  <button className="group border-2 border-purple-600 text-purple-600 px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 rounded-2xl text-base sm:text-lg md:text-xl font-bold hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-500 hover:text-white hover:border-transparent transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <span className="flex items-center justify-center gap-3">
                      <span className="text-2xl">📚</span>
                      <span>Learn More</span>
                      <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">💡</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 mb-12 sm:mb-16 md:mb-24">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 md:p-10 text-center shadow-xl border border-white/30 group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105">
                  <div className="relative group/icon mb-6 sm:mb-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover/icon:shadow-3xl transition-all duration-500 group-hover/icon:scale-110 group-hover/icon:rotate-3">
                      <span className="text-white text-3xl sm:text-4xl md:text-5xl">📖</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse"></div>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-800 mb-4 sm:mb-6 group-hover:text-purple-600 transition-colors duration-300">Daily Bible Study</h3>
                  <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    Access personalized daily verses and confessions tailored to your spiritual journey with AI-powered insights.
                  </p>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 md:p-10 text-center shadow-xl border border-white/30 group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105">
                  <div className="relative group/icon mb-6 sm:mb-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover/icon:shadow-3xl transition-all duration-500 group-hover/icon:scale-110 group-hover/icon:rotate-3">
                      <span className="text-white text-3xl sm:text-4xl md:text-5xl">💭</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse"></div>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-800 mb-4 sm:mb-6 group-hover:text-blue-600 transition-colors duration-300">Confession Journal</h3>
                  <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    Reflect and grow through guided confession prompts and spiritual exercises designed for deep personal transformation.
                  </p>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 md:p-10 text-center shadow-xl border border-white/30 group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105">
                  <div className="relative group/icon mb-6 sm:mb-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover/icon:shadow-3xl transition-all duration-500 group-hover/icon:scale-110 group-hover/icon:rotate-3">
                      <span className="text-white text-3xl sm:text-4xl md:text-5xl">🎯</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse"></div>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-800 mb-4 sm:mb-6 group-hover:text-green-600 transition-colors duration-300">Spiritual Growth</h3>
                  <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    Track your progress and deepen your relationship with God through structured guidance and personalized spiritual coaching.
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced CTA Section */}
            <div className="relative overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-purple-600"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }}></div>
                <div className="absolute bottom-10 right-10 w-24 h-24 bg-pink-300/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-purple-300/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
              </div>
              
              <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-purple-600 rounded-3xl p-8 sm:p-12 md:p-16 lg:p-20 text-center text-white">
                <div className="max-w-4xl mx-auto">
                  <div className="relative group mb-8 sm:mb-12">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                      <span className="text-white text-3xl sm:text-4xl md:text-5xl">🌟</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse"></div>
                  </div>
                  
                  <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-6 sm:mb-8 animate-fade-in-up">
                    Ready to Transform Your <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">Spiritual Life?</span>
                  </h2>
                  <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-12 opacity-90 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    Join thousands of believers who are experiencing deeper spiritual growth through personalized confessions and divine guidance.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <button 
                      onClick={() => setShowRegistration(true)}
                      className="group bg-white text-purple-600 px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 rounded-2xl text-base sm:text-lg md:text-xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
                    >
                      <span className="flex items-center justify-center gap-3">
                        <span className="text-2xl group-hover:translate-x-1 transition-transform duration-300">🚀</span>
                        <span>Start Your Journey</span>
                        <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">✨</span>
                      </span>
                    </button>
                    <button 
                      onClick={() => setShowLogin(true)}
                      className="group border-2 border-white/30 text-white px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 rounded-2xl text-base sm:text-lg md:text-xl font-bold hover:bg-white/10 hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <span className="flex items-center justify-center gap-3">
                        <span className="text-2xl">🔑</span>
                        <span>Sign In</span>
                        <span className="text-2xl group-hover:translate-x-1 transition-transform duration-300">→</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
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

      <style jsx="true">{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default LandingPage

