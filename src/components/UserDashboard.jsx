
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import BibleReader from './BibleReader'
import ConfessionArea from './ConfessionArea'
import UserProfile from './UserProfile'

const UserDashboard = () => {
  const { user, signOut, needsVerification } = useAuth()
  const [activeTab, setActiveTab] = useState('home')
  const [showProfile, setShowProfile] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case 'bible':
        return <BibleReader />
      case 'confessions':
        return <ConfessionArea />
      case 'guidance':
        return (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Spiritual Guidance</h2>
            <p className="text-gray-600">AI-powered spiritual guidance will be available here soon.</p>
          </div>
        )
      case 'profile':
        return (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Profile</h2>
            <p className="text-gray-600">Your profile settings will be available here soon.</p>
          </div>
        )
      default:
        return (
          <>
            {/* Welcome Section - Balanced */}
            <div className="mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white text-lg">🙏</span>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-lg font-bold text-gray-800 mb-1">Welcome back!</h1>
                    <p className="text-gray-600 text-sm">Ready to continue your spiritual journey?</p>
                  </div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 shadow-inner">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      <h3 className="font-semibold text-gray-800 mb-1 text-sm">Today's Focus</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">"For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future."</p>
                      <p className="text-xs text-gray-500 mt-1">Jeremiah 29:11</p>
                    </div>
                    <div className="text-center flex-shrink-0">
                      <div className="text-lg mb-1">✨</div>
                      <div className="text-xs text-gray-500">Blessed Day</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions - Balanced Grid */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-3 rounded-xl shadow-lg transform active:scale-95 transition-all duration-200 min-h-[75px]">
                  <div className="text-xl mb-1">🙏</div>
                  <div className="font-semibold text-sm">Confession</div>
                  <div className="text-xs opacity-90">Start praying</div>
                </button>
                
                <button className="bg-gradient-to-br from-green-500 to-green-600 text-white p-3 rounded-xl shadow-lg transform active:scale-95 transition-all duration-200 min-h-[75px]">
                  <div className="text-xl mb-1">📖</div>
                  <div className="font-semibold text-sm">Bible</div>
                  <div className="text-xs opacity-90">Daily reading</div>
                </button>
                
                <button className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-3 rounded-xl shadow-lg transform active:scale-95 transition-all duration-200 min-h-[75px]">
                  <div className="text-xl mb-1">✨</div>
                  <div className="font-semibold text-sm">Guidance</div>
                  <div className="text-xs opacity-90">Get wisdom</div>
                </button>
                
                <button className="bg-gradient-to-br from-pink-500 to-rose-500 text-white p-3 rounded-xl shadow-lg transform active:scale-95 transition-all duration-200 min-h-[75px]">
                  <div className="text-xl mb-1">📝</div>
                  <div className="font-semibold text-sm">Journal</div>
                  <div className="text-xs opacity-90">Reflect & write</div>
                </button>
              </div>
            </div>

            {/* Spiritual Progress - Balanced */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Your Spiritual Journey</h2>
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-xl font-bold text-blue-600 mb-1">7</div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-600 mb-1">23</div>
                    <div className="text-sm text-gray-600">Confessions</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-600 mb-1">156</div>
                    <div className="text-sm text-gray-600">Verses Read</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-bold">SL</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">SpeakLife</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowProfile(true)}
                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
              >
                <span className="text-white text-sm font-bold">
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Verification Banner */}
      {needsVerification && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mb-4 rounded-r-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Email Verification Required:</strong> Please check your email and click the verification link to access all features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Balanced Mobile Design */}
      <div className="px-4 py-4 pb-24 max-w-4xl mx-auto">
        {renderContent()}
      </div>

      {/* Bottom Navigation - Premium Mobile Design */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-gray-50 border-t border-gray-200 shadow-2xl px-3 py-3 safe-area-pb backdrop-blur-lg">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center space-y-1 py-3 px-3 rounded-3xl min-w-0 flex-1 mx-1 shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300 ${
              activeTab === 'home' 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                : 'hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 active:bg-gradient-to-br active:from-blue-100 active:to-blue-200'
            }`}
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md ${
              activeTab === 'home' 
                ? 'bg-white/20 backdrop-blur-sm shadow-inner' 
                : 'bg-gradient-to-br from-blue-100 to-blue-200'
            }`}>
              <span className={`text-xl ${activeTab === 'home' ? 'text-white drop-shadow-sm' : 'text-blue-600'}`}>🏠</span>
            </div>
            <span className={`text-xs font-semibold leading-tight ${
              activeTab === 'home' ? 'text-white drop-shadow-sm' : 'text-gray-700'
            }`}>Home</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('confessions')}
            className={`flex flex-col items-center space-y-1 py-3 px-3 rounded-3xl min-w-0 flex-1 mx-1 transform hover:scale-105 active:scale-95 transition-all duration-300 ${
              activeTab === 'confessions' 
                ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                : 'hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 active:bg-gradient-to-br active:from-purple-100 active:to-purple-200'
            }`}
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md ${
              activeTab === 'confessions' 
                ? 'bg-white/20 backdrop-blur-sm shadow-inner' 
                : 'bg-gradient-to-br from-purple-100 to-purple-200'
            }`}>
              <span className={`text-xl ${activeTab === 'confessions' ? 'text-white drop-shadow-sm' : 'text-purple-600'}`}>🙏</span>
            </div>
            <span className={`text-xs font-semibold leading-tight ${
              activeTab === 'confessions' ? 'text-white drop-shadow-sm' : 'text-gray-700'
            }`}>Confessions</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('bible')}
            className={`flex flex-col items-center space-y-1 py-3 px-3 rounded-3xl min-w-0 flex-1 mx-1 transform hover:scale-105 active:scale-95 transition-all duration-300 ${
              activeTab === 'bible' 
                ? 'bg-gradient-to-br from-green-500 to-green-600' 
                : 'hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 active:bg-gradient-to-br active:from-green-100 active:to-green-200'
            }`}
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md ${
              activeTab === 'bible' 
                ? 'bg-white/20 backdrop-blur-sm shadow-inner' 
                : 'bg-gradient-to-br from-green-100 to-green-200'
            }`}>
              <span className={`text-xl ${activeTab === 'bible' ? 'text-white drop-shadow-sm' : 'text-green-600'}`}>📖</span>
            </div>
            <span className={`text-xs font-semibold leading-tight ${
              activeTab === 'bible' ? 'text-white drop-shadow-sm' : 'text-gray-700'
            }`}>Bible</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('guidance')}
            className={`flex flex-col items-center space-y-1 py-3 px-3 rounded-3xl min-w-0 flex-1 mx-1 transform hover:scale-105 active:scale-95 transition-all duration-300 ${
              activeTab === 'guidance' 
                ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                : 'hover:bg-gradient-to-br hover:from-yellow-50 hover:to-yellow-100 active:bg-gradient-to-br active:from-yellow-100 active:to-yellow-200'
            }`}
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md ${
              activeTab === 'guidance' 
                ? 'bg-white/20 backdrop-blur-sm shadow-inner' 
                : 'bg-gradient-to-br from-yellow-100 to-yellow-200'
            }`}>
              <span className={`text-xl ${activeTab === 'guidance' ? 'text-white drop-shadow-sm' : 'text-yellow-600'}`}>✨</span>
            </div>
            <span className={`text-xs font-semibold leading-tight ${
              activeTab === 'guidance' ? 'text-white drop-shadow-sm' : 'text-gray-700'
            }`}>Guidance</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center space-y-1 py-3 px-3 rounded-3xl min-w-0 flex-1 mx-1 transform hover:scale-105 active:scale-95 transition-all duration-300 ${
              activeTab === 'profile' 
                ? 'bg-gradient-to-br from-pink-500 to-rose-500' 
                : 'hover:bg-gradient-to-br hover:from-pink-50 hover:to-pink-100 active:bg-gradient-to-br active:from-pink-100 active:to-pink-200'
            }`}
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md ${
              activeTab === 'profile' 
                ? 'bg-white/20 backdrop-blur-sm shadow-inner' 
                : 'bg-gradient-to-br from-pink-100 to-pink-200'
            }`}>
              <span className={`text-xl ${activeTab === 'profile' ? 'text-white drop-shadow-sm' : 'text-pink-600'}`}>👤</span>
            </div>
            <span className={`text-xs font-semibold leading-tight ${
              activeTab === 'profile' ? 'text-white drop-shadow-sm' : 'text-gray-700'
            }`}>Profile</span>
          </button>
        </div>
      </div>

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
