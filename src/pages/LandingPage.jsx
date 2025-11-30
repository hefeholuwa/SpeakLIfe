import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../supabaseClient.jsx'
import BibleReader from '../components/BibleReader.jsx'
import Register from '../components/Register.jsx'
import Login from '../components/Login.jsx'
import EmailVerification from '../components/EmailVerification.jsx'
import PremiumLoader from '../components/PremiumLoader.jsx'
import { BookOpen, Home, User, Heart, Sparkles, Menu, X, ChevronRight } from 'lucide-react'

import adminService from '../services/adminService.js'

const LandingPage = ({ onNavigate }) => {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('home')
  const [showRegistration, setShowRegistration] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dailyVerse, setDailyVerse] = useState({
    text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
    reference: "Jeremiah 29:11"
  })

  useEffect(() => {
    const fetchDailyVerse = async () => {
      try {
        const data = await adminService.getDailyContent(new Date().toISOString().split('T')[0])
        if (data && data.length > 0) {
          setDailyVerse({
            text: data[0].verse_text,
            reference: data[0].reference
          })
        }
      } catch (error) {
        console.error('Error fetching daily verse:', error)
      }
    }

    fetchDailyVerse()

    // Add a small delay to prevent the loader from flashing too quickly
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [authLoading])

  // Listen for email verification events
  useEffect(() => {
    let hasNavigated = false
    const handleUserVerified = (event) => {
      const currentPath = window.location.pathname
      if (currentPath === '/admin') return
      if (hasNavigated) return
      hasNavigated = true
      onNavigate('dashboard')
    }
    window.addEventListener('userVerified', handleUserVerified)
    return () => window.removeEventListener('userVerified', handleUserVerified)
  }, [onNavigate])

  // Check if user is already verified and redirect to dashboard
  useEffect(() => {
    const currentPath = window.location.pathname
    if (user && currentPath !== '/admin') {
      if (user.email_confirmed_at) {
        onNavigate('dashboard')
      } else {
        // User is logged in but not verified
        setShowVerification(true)
      }
    }
  }, [user, onNavigate])

  if (authLoading || loading) {
    return <PremiumLoader message="Preparing your spiritual journey..." minDuration={0} />
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-gray-900 font-sans pb-24 md:pb-0 overflow-x-hidden selection:bg-purple-100">

      {/* Ambient Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-purple-200/40 blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-amber-200/40 blur-[80px] md:blur-[120px]" />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-6 sticky top-0 z-40 bg-[#FDFCF8]/80 backdrop-blur-xl border-b border-gray-100/50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-gray-900/10">SL</div>
          <span className="font-bold text-xl tracking-tight text-gray-900">SpeakLife</span>
        </div>
        <button
          onClick={() => user ? onNavigate('dashboard') : setShowLogin(true)}
          className="w-10 h-10 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center active:scale-95 transition-transform"
        >
          <User size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Desktop Header */}
      <header className="hidden md:flex items-center justify-between px-8 py-6 max-w-7xl mx-auto relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-gray-900/10">SL</div>
          <span className="font-bold text-2xl tracking-tight text-gray-900">SpeakLife</span>
        </div>

        <nav className="flex items-center gap-8">
          <button onClick={() => setActiveTab('home')} className={`text-sm font-medium transition-colors ${activeTab === 'home' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Home</button>
          <button onClick={() => setActiveTab('bible')} className={`text-sm font-medium transition-colors ${activeTab === 'bible' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Bible</button>
        </nav>

        <div className="flex items-center gap-4">
          {!user && (
            <>
              <button onClick={() => setShowLogin(true)} className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2">Sign In</button>
              <button onClick={() => setShowRegistration(true)} className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10">Get Started</button>
            </>
          )}
          {user && (
            <button onClick={() => onNavigate('dashboard')} className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10">Dashboard</button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 pt-6 md:pt-20 max-w-md mx-auto md:max-w-7xl">

        {activeTab === 'home' && (
          <div className="flex flex-col md:flex-row md:items-center md:gap-20">

            {/* Hero Section */}
            <div className="md:flex-1 text-center md:text-left mb-12 md:mb-0 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-purple-100 text-purple-600 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
                <Sparkles size={12} className="fill-purple-600" />
                <span>Daily Spiritual Growth</span>
              </div>

              <h1 className="text-[2.75rem] md:text-7xl font-black leading-[1.1] mb-6 tracking-tight text-gray-900">
                Speak Life Over <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-amber-500">Your Situation</span>
              </h1>

              <p className="text-gray-500 text-lg md:text-xl mb-10 leading-relaxed max-w-lg mx-auto md:mx-0">
                Transform your mind and spirit with daily personalized scripture, powerful confessions, and guided spiritual growth.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button
                  onClick={() => setShowRegistration(true)}
                  className="w-full sm:w-auto bg-gray-900 text-white h-14 px-8 rounded-2xl font-bold text-lg shadow-xl shadow-purple-900/10 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                >
                  Start Daily Session
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setActiveTab('bible')}
                  className="w-full sm:w-auto bg-white text-gray-900 border border-gray-200 h-14 px-8 rounded-2xl font-bold text-lg hover:bg-gray-50 active:scale-95 transition-all"
                >
                  Read Bible
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex items-center justify-center md:justify-start gap-8 opacity-60 grayscale">
                {/* Simple placeholders for trust logos/stats */}
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Trusted by 10,000+ Believers</div>
              </div>
            </div>

            {/* Floating Verse Card */}
            <div className="md:flex-1 w-full perspective-1000">
              <div className="relative group cursor-default">
                {/* Decorative Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-amber-500 rounded-[2.5rem] blur-2xl opacity-20 transform rotate-6 scale-95 group-hover:rotate-3 transition-transform duration-700" />
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-300/30 rounded-full blur-2xl animate-pulse" />

                {/* Glass Card */}
                <div className="relative bg-white/70 backdrop-blur-2xl border border-white/60 p-8 md:p-12 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-transform duration-500 hover:-translate-y-2">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold tracking-widest text-purple-600 uppercase">Verse of the Day</span>
                      <span className="text-sm font-medium text-gray-400">Daily Inspiration</span>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-lg shadow-purple-500/10 flex items-center justify-center text-red-500">
                      <Heart size={24} className="fill-current" />
                    </div>
                  </div>

                  <p className="text-2xl md:text-3xl font-serif leading-relaxed text-gray-800 mb-8">
                    "{dailyVerse.text}"
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">📖</div>
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-gray-900">{dailyVerse.reference}</span>
                      <span className="text-xs text-gray-500">New International Version</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Bible Tab */}
        {activeTab === 'bible' && (
          <div className="animate-fade-in-up">
            <BibleReader searchQuery={searchQuery} />
          </div>
        )}

      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-900/20 z-50 border border-white/10">
        <div className="flex justify-around items-center p-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all ${activeTab === 'home' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
          >
            <Home size={22} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          </button>

          <button
            onClick={() => setShowRegistration(true)}
            className="relative -top-8 bg-gradient-to-br from-purple-600 to-amber-500 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl shadow-purple-600/30 active:scale-90 transition-transform border-4 border-[#FDFCF8]"
          >
            <Sparkles size={26} className="fill-white/20" />
          </button>

          <button
            onClick={() => setActiveTab('bible')}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all ${activeTab === 'bible' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
          >
            <BookOpen size={22} strokeWidth={activeTab === 'bible' ? 2.5 : 2} />
          </button>
        </div>
      </div>

      {/* Auth Modals */}
      {showRegistration && (
        <Register
          onClose={() => setShowRegistration(false)}
          onSuccess={() => {
            setShowRegistration(false)
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

      {showVerification && user && (
        <EmailVerification
          email={user.email}
          onClose={() => setShowVerification(false)}
          onVerified={() => {
            setShowVerification(false)
            onNavigate('dashboard')
          }}
        />
      )}

      <style jsx="true">{`
        .perspective-1000 {
          perspective: 1000px;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  )
}

export default LandingPage
