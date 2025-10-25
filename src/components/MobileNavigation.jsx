import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'

const MobileNavigation = ({ 
  activeTab, 
  setActiveTab, 
  searchQuery, 
  setSearchQuery, 
  onNavigate,
  showRegistration,
  setShowRegistration,
  showLogin,
  setShowLogin
}) => {
  const { user } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Handle scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const event = new CustomEvent('searchBible', { detail: searchQuery })
      window.dispatchEvent(event)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <header 
      className={`bg-white/90 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-lg' : 'shadow-md'
      }`}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        {/* Top Row - Logo and Actions */}
        <div className="flex items-center justify-between py-3 sm:py-4">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
            <div className="relative group flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-black text-lg sm:text-xl">SL</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-black text-gray-800 truncate">SpeakLife</h1>
              <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">One Confession at a Time</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {user ? (
              <>
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all duration-300 text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 touch-manipulation"
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">🚀</span>
                </button>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm sm:text-base">
                    {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </span>
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setShowRegistration(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all duration-300 text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 touch-manipulation"
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">✨</span>
                </button>
                <button 
                  onClick={() => setShowLogin(true)}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 touch-manipulation"
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  <span className="text-gray-600 text-sm sm:text-base">👤</span>
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Navigation Tabs - Touch Optimized */}
        <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-4 sm:mb-6">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold transition-all duration-300 touch-manipulation ${
              activeTab === 'home'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 backdrop-blur-sm active:bg-white/70'
            }`}
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <span className="text-base sm:text-lg">🏠</span>
              <span className="hidden sm:inline">Home</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('bible')}
            className={`px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold transition-all duration-300 touch-manipulation ${
              activeTab === 'bible'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 backdrop-blur-sm active:bg-white/70'
            }`}
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <span className="text-base sm:text-lg">📖</span>
              <span className="hidden sm:inline">Bible</span>
            </span>
          </button>
        </div>
        
        {/* Enhanced Search Bar - Mobile Optimized */}
        <div className="w-full mb-4 sm:mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search bible verses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={`w-full pl-12 pr-14 py-4 sm:py-4 bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all text-base shadow-lg touch-manipulation ${
                isSearchFocused ? 'bg-white shadow-xl' : ''
              }`}
              style={{ 
                fontSize: '16px', // Prevents zoom on iOS
                minHeight: '48px' // iOS touch target
              }}
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 text-lg sm:text-xl">🔍</span>
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors touch-manipulation"
              style={{ minHeight: '48px', minWidth: '48px' }}
            >
              <span className="text-lg sm:text-xl">🚀</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile-specific styles */}
      <style jsx="true">{`
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
      `}</style>
    </header>
  )
}

export default MobileNavigation
