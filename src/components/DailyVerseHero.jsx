import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../supabaseClient.jsx'
import { toast } from 'sonner'

const DailyVerseHero = () => {
  const { user } = useAuth()
  const [dailyVerse, setDailyVerse] = useState(null)
  const [dailyConfession, setDailyConfession] = useState(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState(null)
  // Removed AI generation states - now loading from database

  // Load today's verse and confession on component mount
  useEffect(() => {
    if (!hasLoaded) {
      loadTodaysContent()
    }
  }, []) // Remove hasLoaded dependency to prevent infinite loop

  const loadTodaysContent = async () => {
    if (hasLoaded) return // Prevent multiple calls

    try {
      setIsLoading(true)
      setHasLoaded(true)

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0]

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      )

      const dbPromise = supabase
        .from('daily_verses')
        .select('*')
        .eq('date', today)
        .single()

      const { data, error } = await Promise.race([dbPromise, timeoutPromise])

      if (error) {
        if (error.code === 'PGRST116') {
          // No content found for today
          setDailyVerse(null)
          setDailyConfession(null)
        } else {
          throw error
        }
      } else if (data) {
        // Set the daily verse and confession from database
        // Extract translation from reference if it exists (format: "John 3:16 (KJV)")
        const translationMatch = data.reference.match(/\(([^)]+)\)$/)
        const translation = translationMatch ? translationMatch[1] : null
        const cleanReference = data.reference.replace(/ \(.*\)$/, '')


        setDailyVerse({
          text: data.verse_text,
          reference: cleanReference,
          translation: translation
        })
        setDailyConfession(data.confession_text)
      }

      setIsLoading(false)

    } catch (error) {
      console.error('Error loading content:', error)
      setError('Failed to load content.')
      setIsLoading(false)
    }
  }

  const saveToFavorites = async () => {
    try {
      if (!user) return

      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          verse_text: dailyVerse.text,
          reference: dailyVerse.reference,
          created_at: new Date().toISOString()
        })

      if (!error) {
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 2000)
      }
    } catch (error) {
      console.error('Error saving to favorites:', error)
    }
  }

  const shareVerse = async () => {
    try {
      setIsSharing(true)

      if (navigator.share) {
        await navigator.share({
          title: 'Daily Scripture & Confession - SpeakLife',
          text: `✨ *Verse of the Day* ✨\n"${dailyVerse.text}" - ${dailyVerse.reference}\n\n💭 *Confession* 💭\n${dailyConfession}\n\n📲 *Shared via SpeakLife App*\n${window.location.origin}`,
          url: window.location.origin
        })
      } else {
        // Fallback: copy to clipboard
        const shareText = `✨ *Verse of the Day* ✨\n"${dailyVerse.text}" - ${dailyVerse.reference}\n\n💭 *Confession* 💭\n${dailyConfession}\n\n📲 *Shared via SpeakLife App*\n${window.location.origin}`
        await navigator.clipboard.writeText(shareText)
        toast.success('Copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing verse:', error)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)]"></div>

      <Card className="relative p-4 sm:p-6 border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
        {/* Premium Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6">
          <div className="flex items-center gap-4 mb-4 lg:mb-0">
            <div className="relative">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-2xl">
                <span className="text-white text-2xl">✨</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
                Today's Scripture
              </h2>
              <p className="text-sm text-gray-600 mt-1">Divine Word for Today</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Scripture Section */}
          <Card className="group relative p-4 cursor-pointer bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 rounded-2xl overflow-hidden">
            {/* Premium Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>

            <div className="relative z-10 space-y-4">
              {/* Premium Icon */}
              <div className="relative">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-2xl bg-gradient-to-br from-blue-500 to-purple-500">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">📖</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
              </div>

              {/* Premium Content */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                    Today's Scripture
                  </h3>
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-4 space-y-3">
                      <div className="w-6 h-6 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                      <div className="text-center">
                        <span className="text-gray-600 text-sm font-medium">
                          Loading today's scripture...
                        </span>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="text-center py-4">
                      <div className="text-gray-400 mb-3">
                        <span className="text-2xl">⚠️</span>
                      </div>
                      <p className="text-gray-600 mb-3 text-sm">{error}</p>
                      <Button
                        onClick={() => {
                          setError(null)
                          setIsLoading(true)
                          loadTodaysContent()
                        }}
                        className="bg-purple-500 hover:bg-purple-600 text-white text-sm py-2 px-4"
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : dailyVerse ? (
                    <p className="text-gray-800 text-sm leading-relaxed font-medium">
                      "{dailyVerse.text}"
                    </p>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-gray-400 mb-3">
                        <span className="text-2xl">📖</span>
                      </div>
                      <p className="text-gray-600 text-sm">No verse available for today</p>
                      <p className="text-gray-400 text-xs mt-1">Check back later or contact admin</p>
                    </div>
                  )}
                </div>

                {dailyVerse && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-purple-600">
                        {dailyVerse.reference}
                        {dailyVerse.translation && (
                          <span className="text-gray-500 text-sm ml-2">({dailyVerse.translation})</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Scripture</span>
                      <div className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300">→</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
          </Card>

          {/* Confession Section */}
          <Card className="group relative p-4 cursor-pointer bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 rounded-2xl overflow-hidden">
            {/* Premium Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>

            <div className="relative z-10 space-y-4">
              {/* Premium Icon */}
              <div className="relative">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-2xl bg-gradient-to-br from-pink-500 to-purple-500">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">💭</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
              </div>

              {/* Premium Content */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                    Today's Confession
                  </h3>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-6 h-6 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                      <span className="ml-3 text-gray-600">
                        Loading confession...
                      </span>
                    </div>
                  ) : error ? (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-2">Failed to load confession</p>
                      <Button
                        onClick={() => {
                          setError(null)
                          setIsLoading(true)
                          loadTodaysContent()
                        }}
                        size="sm"
                        variant="outline"
                        className="text-purple-600 border-purple-300 hover:bg-purple-50"
                      >
                        Retry
                      </Button>
                    </div>
                  ) : dailyConfession ? (
                    <p className="text-gray-800 leading-relaxed text-lg">
                      {dailyConfession}
                    </p>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-gray-400 mb-2">
                        <span className="text-2xl">💭</span>
                      </div>
                      <p className="text-gray-600">No confession available for today</p>
                      <p className="text-gray-400 text-sm mt-1">Check back later or contact admin</p>
                    </div>
                  )}
                </div>

                {dailyConfession && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-purple-600">
                        Spiritual Declaration
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Confession</span>
                      <div className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300">→</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
          </Card>
        </div>

        {/* Action Buttons */}
        {dailyVerse && dailyConfession && (
          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              size="sm"
              onClick={saveToFavorites}
              disabled={!user || isSaved}
              variant="outline"
              className="gap-2 bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30 shadow-xl hover:shadow-2xl transition-all duration-200 disabled:opacity-50 text-sm"
            >
              <span className="text-lg">{isSaved ? '✅' : '❤️'}</span>
              <span className="font-semibold">
                {isSaved ? 'Saved!' : 'Save'}
              </span>
            </Button>

            <Button
              size="sm"
              onClick={shareVerse}
              disabled={isSharing}
              variant="outline"
              className="gap-2 bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30 shadow-xl hover:shadow-2xl transition-all duration-200 disabled:opacity-50 text-sm"
            >
              <span className="text-lg">{isSharing ? '⏳' : '📤'}</span>
              <span className="font-semibold">
                {isSharing ? 'Sharing...' : 'Share'}
              </span>
            </Button>
          </div>
        )}
      </Card>

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
      `}</style>
    </div>
  )
}

export default DailyVerseHero