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
    // Simplified initialization - no async calls that could hang
      setLoading(false)
  }, [authLoading])

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
    return <PremiumLoader message="Preparing your spiritual journey..." minDuration={0} />
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
    return <PremiumLoader message="Loading your spiritual journey..." minDuration={0} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 overflow-x-hidden">
      {/* CLEAN & ORGANIZED Navigation Bar - YouTube Style */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Layout - Clean & Organized */}
          <div className="block lg:hidden">
            {/* Single Row - YouTube Style Layout */}
            <div className="flex items-center justify-between h-14 sm:h-16">
              {/* Left: Logo */}
              <div className="flex items-center space-x-3">
                <div className="relative group flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <span className="text-white font-black text-lg sm:text-xl">SL</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-base font-black bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent truncate">
                    SpeakLife
                  </h1>
                </div>
              </div>
              
              {/* Center: Navigation Pills */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                    activeTab === 'home'
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{ minHeight: '32px' }}
                >
                  <span className="flex items-center gap-1">
                    <span className="text-sm">🏠</span>
                    <span className="hidden sm:inline">Home</span>
                  </span>
                </button>
                <button 
                  onClick={() => setActiveTab('bible')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                    activeTab === 'bible'
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{ minHeight: '32px' }}
                >
                  <span className="flex items-center gap-1">
                    <span className="text-sm">📖</span>
                    <span className="hidden sm:inline">Bible</span>
                  </span>
                </button>
            </div>
            
              {/* Right: Auth Buttons */}
              {!user && (
                <div className="flex items-center gap-2 flex-shrink-0">
              <button
                    onClick={() => setShowLogin(true)}
                    className="text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200"
                    style={{ minHeight: '32px' }}
                  >
                    <span className="hidden sm:inline">Sign in</span>
                    <span className="sm:hidden">Sign in</span>
              </button>
              <button
                    onClick={() => setShowRegistration(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shadow-lg"
                    style={{ minHeight: '32px' }}
                  >
                    <span className="hidden sm:inline">Start</span>
                    <span className="sm:hidden">Start</span>
              </button>
                </div>
              )}
              
              {user && (
                <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={() => onNavigate('dashboard')}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shadow-lg"
                    style={{ minHeight: '32px' }}
                  >
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden">Go</span>
                </button>
              </div>
              )}
            </div>
          </div>
          
          {/* Desktop Layout - Clean & Organized */}
          <div className="hidden lg:flex items-center justify-between h-16">
            {/* Left: Logo & Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <span className="text-white font-black text-xl">SL</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-xl font-black bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    SpeakLife
                  </h1>
                </div>
              </div>
              
              {/* Navigation Pills */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeTab === 'home'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>🏠</span>
                    <span>Home</span>
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('bible')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeTab === 'bible'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>📖</span>
                    <span>Bible</span>
                  </span>
                </button>
              </div>
            </div>
            
            {/* Right: Profile Actions */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <button 
                    onClick={() => onNavigate('dashboard')}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-lg"
                  >
                    Dashboard
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg">
                      <span className="text-white font-semibold text-sm">
                        {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setShowLogin(true)}
                    className="text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
                  >
                    Sign in
                  </button>
                  <button 
                    onClick={() => fetchData()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shadow-lg mr-2"
                  >
                    Load Content
                  </button>
                  <button 
                    onClick={() => setShowRegistration(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-lg"
                  >
                    Get Started
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
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(1deg);
          }
          50% {
            transform: translateY(-20px) rotate(0deg);
          }
          75% {
            transform: translateY(-10px) rotate(-1deg);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(147, 51, 234, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(147, 51, 234, 0.6), 0 0 60px rgba(236, 72, 153, 0.4);
          }
        }

        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }

        /* Scrollbar hiding */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Mobile-specific optimizations */
        @media (max-width: 768px) {
          /* Prevent zoom on input focus for iOS */
          input[type="text"], input[type="email"], input[type="password"] {
            font-size: 16px !important;
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
          }
          
          /* Optimize touch interactions */
          button, [role="button"] {
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
            touch-action: manipulation;
          }
          
          /* Smooth scrolling for iOS */
          * {
            -webkit-overflow-scrolling: touch;
          }
          
          /* Prevent text selection on buttons */
          button {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
        }

        /* iOS Safari specific fixes */
        @supports (-webkit-touch-callout: none) {
          input[type="text"], input[type="email"], input[type="password"] {
            font-size: 16px !important;
          }
          
          /* Fix for iOS Safari viewport issues */
          .min-h-screen {
            min-height: -webkit-fill-available;
          }
        }

        /* Android Chrome optimizations */
        @media screen and (-webkit-min-device-pixel-ratio: 0) {
          input[type="text"], input[type="email"], input[type="password"] {
            font-size: 16px !important;
          }
        }

        /* High DPI display optimizations */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .shadow-lg {
            box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
        }
      `}</style>
    </div>
  )
}

export default LandingPage

