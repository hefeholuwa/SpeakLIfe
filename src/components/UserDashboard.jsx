import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Home, BookOpen, PenTool, User, LogOut, Settings, Bell, Search, Menu, X, ChevronRight, Heart, Share2, Calendar, ArrowRight, Users, Sparkles, Mic, Play } from 'lucide-react'
import BibleReader from './BibleReader'
import BiblePlans from './BiblePlans'
import ConfessionJournal from './ConfessionJournal'
import CommunityChat from './CommunityChat'
import UserProfile from './UserProfile'
import NotificationInbox from './NotificationInbox'
import PushNotificationManager from './PushNotificationManager'



import adminService from '../services/adminService.js'
import { supabase } from '../supabaseClient'

const UserDashboard = ({ onNavigate }) => {
  const { user, userProfile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('home')
  const [bibleReaderConfig, setBibleReaderConfig] = useState(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [dailyVerse, setDailyVerse] = useState(null)
  const [loadingVerse, setLoadingVerse] = useState(true)
  const [currentPlan, setCurrentPlan] = useState(null)
  const [journalConfig, setJournalConfig] = useState(null)

  const [isLiked, setIsLiked] = useState(false)
  const [selectedMood, setSelectedMood] = useState(null)
  const [showAllActivity, setShowAllActivity] = useState(false)

  // Moved fetchDailyVerse and fetchCurrentPlan outside useEffect for better structure
  const fetchDailyVerse = async () => {
    setLoadingVerse(true)
    try {
      const data = await adminService.getDailyContent(new Date().toISOString().split('T')[0])
      if (data && data.length > 0) {
        setDailyVerse({
          text: data[0].verse_text,
          reference: data[0].reference,
          version: data[0].translation || 'KJV',
          confession: data[0].confession_text
        })
      } else {
        setDailyVerse(null)
      }
    } catch (error) {
      console.error('Error fetching daily verse:', error)
      setDailyVerse(null)
    } finally {
      setLoadingVerse(false)
    }
  }

  const fetchCurrentPlan = async () => {
    if (!user) return

    try {
      // 1. Find the most recently active plan
      const { data: latestProgress, error: progressError } = await supabase
        .from('user_plan_progress')
        .select('plan_id')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (progressError) {
        console.error('Error fetching plan progress:', progressError)
        return
      }

      if (latestProgress) {
        // 2. Get plan details
        const { data: plan } = await supabase
          .from('reading_plans')
          .select('*')
          .eq('id', latestProgress.plan_id)
          .single()

        // 3. Get progress count
        const { count } = await supabase
          .from('user_plan_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('plan_id', latestProgress.plan_id)

        if (plan) {
          setCurrentPlan({
            ...plan,
            completedDays: count || 0
          })
        }
      }
    } catch (error) {
      console.error('Error fetching current plan:', error)
    }
  }

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')

    if (user) {
      updateAndFetchStreak()
      fetchRecentActivity()
      fetchCurrentPlan()
    }
    fetchDailyVerse()
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    onNavigate('landing')
  }

  const [streak, setStreak] = useState(0)
  const [recentActivity, setRecentActivity] = useState([])

  const updateAndFetchStreak = async () => {
    if (!user) return

    try {
      // Call the RPC function to update streak logic
      const { data: streakData, error: streakError } = await supabase.rpc('update_streak')

      if (streakError) {
        console.error('Error updating streak:', streakError)
        // Fallback: try to just get the profile if RPC fails
        const { data: profile } = await supabase
          .from('profiles')
          .select('current_streak')
          .eq('id', user.id)
          .single()

        if (profile) setStreak(profile.current_streak)
      } else {
        setStreak(streakData.current_streak)
      }
    } catch (error) {
      console.error('Error in streak logic:', error)
    }
  }

  const fetchRecentActivity = async () => {
    if (!user) return

    try {
      // Fetch recent journal entries
      const { data: journalEntries } = await supabase
        .from('confession_journal')
        .select('id, title, created_at, category')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      // Fetch recent bible bookmarks/highlights (as a proxy for reading)
      const { data: bibleActivity } = await supabase
        .from('bible_bookmarks')
        .select('id, book, chapter, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      // Combine and sort
      const combined = [
        ...(journalEntries?.map(e => ({
          type: 'confession',
          title: e.title || 'Journal Entry',
          time: new Date(e.created_at),
          id: e.id
        })) || []),
        ...(bibleActivity?.map(e => ({
          type: 'reading',
          title: `${e.book} ${e.chapter}`,
          time: new Date(e.created_at),
          id: e.id
        })) || [])
      ].sort((a, b) => b.time - a.time).slice(0, 5)

      // Format time for display
      const formatted = combined.map(item => {
        const diff = (new Date() - item.time) / 1000 / 60 // minutes
        let timeString = ''
        if (diff < 60) timeString = `${Math.floor(diff)} mins ago`
        else if (diff < 1440) timeString = `${Math.floor(diff / 60)} hours ago`
        else timeString = `${Math.floor(diff / 1440)} days ago`

        return { ...item, time: timeString }
      })

      setRecentActivity(formatted)
    } catch (error) {
      console.error('Error fetching activity:', error)
    }
  }

  const handleShare = async () => {
    const text = `✨ *Verse of the Day* ✨\n"${dailyVerse.text}" - ${dailyVerse.reference}\n\n💭 *Confession* 💭\n${dailyVerse.confession}\n\n📲 *Shared via SpeakLife App*\n${window.location.origin}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Scripture & Confession - SpeakLife',
          text,
          url: window.location.origin
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    }
  };



  return (
    <div className="min-h-screen bg-[#FDFCF8] text-gray-900 font-sans pb-24 md:pb-0">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 border-r border-gray-100 bg-white/50 backdrop-blur-xl z-30">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-gray-900/10">SL</div>
            <span className="font-bold text-xl tracking-tight text-gray-900">SpeakLife</span>
          </div>

          <nav className="space-y-2">
            <button onClick={() => setActiveTab('home')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'home' ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Home size={20} />
              <span className="font-medium">Home</span>
            </button>
            <button onClick={() => { setActiveTab('bible'); setBibleReaderConfig(null) }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'bible' ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
              <BookOpen size={20} />
              <span className="font-medium">Bible</span>
            </button>
            <button onClick={() => setActiveTab('journal')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'journal' ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
              <PenTool size={20} />
              <span className="font-medium">Journal</span>
            </button>
            <button onClick={() => setActiveTab('community')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'community' ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Users size={20} />
              <span className="font-medium">Community</span>
            </button>
            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
              <User size={20} />
              <span className="font-medium">Profile</span>
            </button>

          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {userProfile?.username ? userProfile.username : (user?.user_metadata?.full_name || 'User')}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-[#FDFCF8]/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg">SL</div>
          <span className="font-bold text-lg text-gray-900">SpeakLife</span>
        </div>
        <button onClick={() => setShowMobileMenu(true)} className="p-2 -mr-2 text-gray-600">
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 bg-white animate-fade-in">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg">SL</div>
                <span className="font-bold text-lg text-gray-900">SpeakLife</span>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="space-y-4">
              <button onClick={() => { setActiveTab('home'); setShowMobileMenu(false) }} className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-2xl font-bold text-gray-900">
                <Home size={24} /> Home
              </button>
              <button onClick={() => { setActiveTab('bible'); setShowMobileMenu(false); setBibleReaderConfig(null) }} className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-2xl font-bold text-gray-900">
                <BookOpen size={24} /> Bible
              </button>
              <button onClick={() => { setActiveTab('journal'); setShowMobileMenu(false) }} className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-2xl font-bold text-gray-900">
                <PenTool size={24} /> Journal
              </button>
              <button onClick={() => { setActiveTab('community'); setShowMobileMenu(false) }} className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-2xl font-bold text-gray-900">
                <Users size={24} /> Community
              </button>

              <button onClick={handleSignOut} className="w-full flex items-center gap-4 p-4 bg-red-50 text-red-600 rounded-2xl font-bold mt-8">
                <LogOut size={24} /> Sign Out
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="md:pl-64 min-h-screen">
        <div className="max-w-5xl mx-auto p-6 md:p-12">

          {activeTab === 'home' && (
            <div className="space-y-8 animate-fade-in-up">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-1">
                    {greeting}, {userProfile?.username ? userProfile.username : (user?.user_metadata?.full_name?.split(' ')[0] || 'Friend')}
                  </h1>
                  <p className="text-gray-500">Ready to speak life today?</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-3 bg-white border border-gray-100 rounded-full text-gray-400 hover:text-gray-900 hover:border-gray-300 transition-all">
                    <Search size={20} />
                  </button>
                  <NotificationInbox />
                </div>
              </div>

              {/* Daily Verse Card */}
              {/* Daily Verse Card */}
              {loadingVerse ? (
                <div className="relative overflow-hidden bg-gray-100 rounded-3xl p-8 h-64 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
                  <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
              ) : dailyVerse ? (
                <div className="relative overflow-hidden bg-gray-900 rounded-3xl p-8 text-white shadow-xl group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-sm border border-white/10">
                        Verse of the Day
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={handleShare}
                          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
                        >
                          <Share2 size={18} />
                        </button>
                        <button
                          onClick={() => setIsLiked(!isLiked)}
                          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
                        >
                          <Heart size={18} className={isLiked ? "fill-red-500 text-red-500" : ""} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-2xl md:text-3xl font-serif font-medium leading-relaxed mb-4">
                        "{dailyVerse.text}"
                      </h3>
                      <p className="text-white/60 font-medium tracking-wide flex items-center gap-2 mb-6">
                        {dailyVerse.reference}
                        {!dailyVerse.reference.includes('(') && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-white/40" />
                            {dailyVerse.version}
                          </>
                        )}
                      </p>

                      <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                        <p className="text-sm font-medium text-white/90 mb-2 flex items-center gap-2">
                          <Sparkles size={14} className="text-yellow-400" />
                          Daily Confession
                        </p>
                        <p className="text-lg font-bold leading-relaxed">
                          "{dailyVerse.confession}"
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => {
                          const cleanRef = dailyVerse.reference.replace(/\s*\(.*?\)\s*/g, '').trim();
                          const match = cleanRef.match(/^((?:[123]\s)?[a-zA-Z\s\.]+)\s+([\d,\-\s:]+)$/);

                          if (match) {
                            const book = match[1].trim();
                            const numbersPart = match[2];
                            let chapter = 1;

                            if (numbersPart.includes(':')) {
                              chapter = parseInt(numbersPart.split(':')[0]);
                            } else {
                              const nums = numbersPart.match(/\d+/);
                              if (nums) chapter = parseInt(nums[0]);
                            }

                            setBibleReaderConfig({ book, chapter, fromTab: 'home' });
                            setActiveTab('bible');
                          } else {
                            toast.error('Could not open chapter');
                          }
                        }}
                        className="flex-1 bg-white text-gray-900 py-3.5 px-6 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <BookOpen size={18} />
                        Read Chapter
                      </button>
                      <button
                        onClick={() => {
                          setJournalConfig({
                            title: `Reflection on ${dailyVerse.reference}`,
                            content: `Verse: "${dailyVerse.text}"\n\nConfession: ${dailyVerse.confession || ''}\n\nMy thoughts: `,
                            category: 'confession'
                          });
                          setActiveTab('journal');
                        }}
                        className="flex-1 bg-white/10 text-white py-3.5 px-6 rounded-xl font-bold hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10 flex items-center justify-center gap-2"
                      >
                        <PenTool size={18} />
                        Journal This
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden bg-gray-50 rounded-3xl p-8 text-center border border-gray-100 border-dashed">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                      <Calendar size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Verse for Today</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Check back later for today's spiritual nourishment, or explore the Bible tab.
                    </p>
                    <button
                      onClick={() => setActiveTab('bible')}
                      className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
                    >
                      Open Bible
                    </button>
                  </div>
                </div>
              )}



              {/* Stats & Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Streak Card */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-3xl border border-orange-100/50 shadow-sm hover:shadow-lg hover:shadow-orange-500/5 hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3.5 bg-white text-orange-500 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300 ring-1 ring-orange-100">
                      <Calendar size={24} className="fill-orange-500/20" />
                    </div>
                    <span className="text-3xl font-black text-gray-900 tracking-tight">{streak}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Day Streak</h3>
                  <p className="text-sm text-gray-500 mt-1 font-medium">Keep the fire burning!</p>
                </div>

                {/* Quick Action: New Confession */}
                <button onClick={() => setActiveTab('journal')} className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-6 rounded-3xl border border-purple-100/50 shadow-sm hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300 text-left group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3.5 bg-white text-purple-600 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300 ring-1 ring-purple-100">
                        <PenTool size={24} className="fill-purple-600/20" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                        <ArrowRight size={16} className="text-purple-400 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">New Confession</h3>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Speak life over your day</p>
                  </div>
                </button>

                {/* Quick Action: Bible Plan */}
                <button onClick={() => setActiveTab('plans')} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100/50 shadow-sm hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 text-left group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

                  {currentPlan ? (
                    <div className="relative z-10 w-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3.5 bg-white text-blue-600 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300 ring-1 ring-blue-100">
                          <BookOpen size={24} className="fill-blue-600/20" />
                        </div>
                        <span className="text-xs font-bold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-full border border-blue-200">
                          {currentPlan.duration_days > 0
                            ? Math.round((currentPlan.completedDays / currentPlan.duration_days) * 100)
                            : 0}%
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg truncate pr-2">{currentPlan.title}</h3>
                      <div className="w-full bg-blue-200/50 rounded-full h-2 mt-3 mb-1 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${currentPlan.duration_days > 0
                              ? Math.min(100, (currentPlan.completedDays / currentPlan.duration_days) * 100)
                              : 0}%`
                          }}
                        />
                      </div>
                      <p className="text-sm text-blue-600/80 font-medium flex items-center gap-1 mt-2 group-hover:translate-x-1 transition-transform">
                        Continue Reading <ArrowRight size={14} />
                      </p>
                    </div>
                  ) : (
                    <div className="relative z-10 w-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3.5 bg-white text-blue-600 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300 ring-1 ring-blue-100">
                          <BookOpen size={24} className="fill-blue-600/20" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                          <ArrowRight size={16} className="text-blue-400 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">Reading Plans</h3>
                      <p className="text-sm text-gray-500 mt-1 font-medium">Start a new journey</p>
                    </div>
                  )}
                </button>
              </div>

              {/* Recent Activity */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-gray-900">Recent Activity</h2>
                  {recentActivity.length > 3 && (
                    <button
                      onClick={() => setShowAllActivity(!showAllActivity)}
                      className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      {showAllActivity ? 'Show Less' : 'View All'}
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity
                      .slice(0, showAllActivity ? undefined : 3)
                      .map((activity, i) => (
                        <div key={i} className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 cursor-default animate-fade-in">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${activity.type === 'reading' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' :
                            activity.type === 'confession' ? 'bg-purple-50 text-purple-600 group-hover:bg-purple-100' :
                              'bg-orange-50 text-orange-600 group-hover:bg-orange-100'
                            }`}>
                            {activity.type === 'reading' ? <BookOpen size={20} className="fill-current opacity-20" /> :
                              activity.type === 'confession' ? <PenTool size={20} className="fill-current opacity-20" /> :
                                <Calendar size={20} className="fill-current opacity-20" />}
                            <div className="absolute">
                              {activity.type === 'reading' ? <BookOpen size={20} /> :
                                activity.type === 'confession' ? <PenTool size={20} /> :
                                  <Calendar size={20} />}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors">{activity.title}</h4>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mt-0.5">{activity.time}</p>
                          </div>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 group-hover:bg-gray-50 group-hover:text-gray-600 transition-all">
                            <ChevronRight size={18} />
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-gray-300">
                        <Calendar size={20} />
                      </div>
                      <p className="text-gray-500 font-medium">No recent activity</p>
                      <p className="text-xs text-gray-400 mt-1">Your journey begins today!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bible' && (
            <div className="animate-fade-in-up">
              <BibleReader
                externalConfig={bibleReaderConfig}
                onExternalComplete={bibleReaderConfig?.onComplete}
                onBack={() => {
                  if (bibleReaderConfig?.fromTab) {
                    setActiveTab(bibleReaderConfig.fromTab)
                  } else {
                    // Default fallback if no fromTab is set
                    setActiveTab('home')
                  }
                  setBibleReaderConfig(null) // Clear config when going back
                }}
              />
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="animate-fade-in-up">
              <BiblePlans
                onStartReading={(reference, planId, dayId, devotionalContent, dayNumber) => {
                  // Parse reference (e.g., "Proverbs 1", "1 John 1", "Genesis 1-3", "Genesis 1, 2, 3", "Gen. 1")
                  // Matches: Book (group 1), Numbers part (group 2)
                  const match = reference.match(/^((?:[123]\s)?[a-zA-Z\s\.]+)\s+([\d,\-\s:]+)$/);

                  let book = '';
                  let startChapter = 1;
                  let endChapter = 1;
                  let targetVerse = null;

                  if (match) {
                    book = match[1].trim();
                    const numbersPart = match[2];

                    if (numbersPart.includes(':')) {
                      // Handle verse reference (e.g., "3:16" or "3:16-18")
                      const parts = numbersPart.split(':');
                      startChapter = parseInt(parts[0]);
                      endChapter = startChapter; // Assume single chapter for verse references

                      // Extract first verse number for scrolling
                      const verseMatch = parts[1].match(/(\d+)/);
                      if (verseMatch) {
                        targetVerse = parseInt(verseMatch[1]);
                      }
                    } else {
                      // Handle chapter range (e.g., "1" or "1-3")
                      const numbers = numbersPart.match(/\d+/g)?.map(Number) || [1];
                      if (numbers.length > 0) {
                        startChapter = Math.min(...numbers);
                        endChapter = Math.max(...numbers);
                      }
                    }
                  } else {
                    // Fallback logic
                    const lastSpaceIndex = reference.lastIndexOf(' ');
                    if (lastSpaceIndex > 0) {
                      book = reference.substring(0, lastSpaceIndex).trim();
                      const possibleNumbers = reference.substring(lastSpaceIndex + 1).match(/\d+/g)?.map(Number);
                      if (possibleNumbers && possibleNumbers.length > 0) {
                        startChapter = Math.min(...possibleNumbers);
                        endChapter = Math.max(...possibleNumbers);
                      }
                    } else {
                      book = reference;
                    }
                  }

                  setBibleReaderConfig({
                    book: book,
                    chapter: startChapter,
                    endChapter: endChapter,
                    targetVerse: targetVerse,
                    devotionalContent,
                    dayNumber: dayNumber,
                    fromTab: 'plans', // Added: track source
                    onComplete: async () => {
                      try {
                        // Mark as complete in DB
                        const { error } = await supabase
                          .from('user_plan_progress')
                          .insert({
                            user_id: user.id,
                            plan_id: planId,
                            day_id: dayId
                          })

                        if (error && error.code !== '23505') throw error // Ignore duplicate error

                        // Show success and go back to plans
                        toast.success('Great job! Day completed.', {
                          description: 'Keep up the good work!',
                          duration: 3000,
                        })
                        setActiveTab('plans')
                        setBibleReaderConfig(null)
                      } catch (err) {
                        console.error('Error completing plan day:', err)
                      }
                    }
                  })
                  setActiveTab('bible')
                }}
                onBack={() => setActiveTab('home')}
              />
            </div>
          )}

          {activeTab === 'journal' && (
            <div className="animate-fade-in-up">
              <ConfessionJournal initialData={journalConfig} />
            </div>
          )}

          {activeTab === 'community' && (
            <div className="animate-fade-in-up">
              <CommunityChat />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="animate-fade-in-up">
              <UserProfile />
            </div>
          )}





        </div>
      </main >

      {/* Push Notification Manager */}
      <PushNotificationManager />

      {/* Mobile Bottom Nav */}
      < div className="md:hidden fixed bottom-6 left-6 right-6 bg-[#1a1b1e]/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 z-50 border border-white/10" >
        <div className="flex justify-between items-center px-6 py-4">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'home' ? 'text-white scale-110' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} className={activeTab === 'home' ? 'fill-white/10' : ''} />
          </button>

          <button
            onClick={() => { setActiveTab('bible'); setBibleReaderConfig(null) }}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'bible' ? 'text-white scale-110' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <BookOpen size={24} strokeWidth={activeTab === 'bible' ? 2.5 : 2} className={activeTab === 'bible' ? 'fill-white/10' : ''} />
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'journal' ? 'text-white scale-110' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <PenTool size={24} strokeWidth={activeTab === 'journal' ? 2.5 : 2} className={activeTab === 'journal' ? 'fill-white/10' : ''} />
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'community' ? 'text-white scale-110' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Users size={24} strokeWidth={activeTab === 'community' ? 2.5 : 2} className={activeTab === 'community' ? 'fill-white/10' : ''} />
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'profile' ? 'text-white scale-110' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} className={activeTab === 'profile' ? 'fill-white/10' : ''} />
          </button>
        </div>
      </div >



      <style jsx="true">{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  )
}

export default UserDashboard