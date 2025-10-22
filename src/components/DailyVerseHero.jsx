import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../supabaseClient.jsx'

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
      
      // Fetch today's content from database
      const { data, error } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('date', today)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No content found for today
          console.log('No daily content found for today')
          setDailyVerse(null)
          setDailyConfession(null)
        } else {
          throw error
        }
      } else if (data) {
        // Set the daily verse and confession from database
        // Extract translation from reference if it exists (format: "John 3:16 (KJV)")
        console.log('🔍 Raw reference from database:', data.reference)
        const translationMatch = data.reference.match(/\(([^)]+)\)$/)
        const translation = translationMatch ? translationMatch[1] : null
        const cleanReference = data.reference.replace(/ \(.*\)$/, '')
        
        console.log('🔍 Extracted translation:', translation)
        console.log('🔍 Clean reference:', cleanReference)
        
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
          title: 'Daily Scripture - SpeakLife',
          text: `"${dailyVerse.text}" - ${dailyVerse.reference}`,
          url: window.location.origin
        })
      } else {
        // Fallback: copy to clipboard
        const shareText = `"${dailyVerse.text}" - ${dailyVerse.reference}\n\nShared from SpeakLife App`
        await navigator.clipboard.writeText(shareText)
        alert('Verse copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing verse:', error)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20" />
      
      {/* Simplified background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-2 h-2 bg-white/20 rounded-full"></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-white/30 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-white/15 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-1 h-1 bg-white/25 rounded-full"></div>
      </div>
      
      <div className="relative p-8 md:p-12">
        <div className="flex items-center gap-3 mb-8 animate-fade-in">
          <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
            <span className="text-white text-2xl">✨</span>
          </div>
          <div>
            <span className="text-white/90 text-sm font-bold tracking-wider uppercase">
              Today's Scripture
            </span>
            <p className="text-white/70 text-xs">Divine Word for Today</p>
          </div>
        </div>

        <div className="space-y-8 animate-fade-in-up">
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <div className="text-center">
                    <span className="text-white/80 text-lg font-medium">
                      Loading today's scripture...
                    </span>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-white/80 mb-4">
                    <span className="text-4xl">⚠️</span>
                  </div>
                  <p className="text-white/80 mb-4">{error}</p>
                  <Button 
                    onClick={() => {
                      setError(null)
                      setIsLoading(true)
                      loadTodaysContent()
                    }}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    Try Again
                  </Button>
                </div>
              ) : dailyVerse ? (
                <p className="text-white text-xl md:text-2xl leading-relaxed font-medium">
                  "{dailyVerse.text}"
                </p>
              ) : (
                <div className="text-center py-8">
                  <div className="text-white/60 mb-4">
                    <span className="text-4xl">📖</span>
                  </div>
                  <p className="text-white/60 text-lg">No verse available for today</p>
                  <p className="text-white/40 text-sm mt-2">Check back later or contact admin</p>
                </div>
              )}
            </div>
            {dailyVerse && (
              <div className="flex items-center gap-3 text-white/80">
                <div className="p-2 rounded-lg bg-white/20">
                  <span className="text-white text-lg">📖</span>
                </div>
                <span className="font-semibold">
                  {dailyVerse.reference}
                  {dailyVerse.translation && (
                    <span className="text-white/60 text-sm ml-2">({dailyVerse.translation})</span>
                  )}
                </span>
              </div>
            )}
          </div>

          <div className="p-8 rounded-2xl bg-white/95 backdrop-blur-sm shadow-2xl border border-white/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-100">
                <span className="text-purple-600 text-lg">💭</span>
              </div>
              <p className="text-sm text-purple-600 font-bold uppercase tracking-wide">
                Today's Confession
              </p>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                <span className="ml-3 text-purple-600">
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
                <p className="text-gray-500">No confession available for today</p>
              </div>
            )}
          </div>

                 {dailyVerse && dailyConfession && (
                   <div className="flex flex-wrap gap-4">
                     <Button
                       size="lg"
                       onClick={saveToFavorites}
                       disabled={!user || isSaved}
                       variant="outline"
                       className="gap-3 bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30 shadow-xl hover:shadow-2xl transition-all duration-200 disabled:opacity-50"
                     >
                       <span className="text-xl">{isSaved ? '✅' : '❤️'}</span>
                       <span className="font-semibold">
                         {isSaved ? 'Saved!' : 'Save to Favorites'}
                       </span>
                     </Button>

                     <Button
                       size="lg"
                       onClick={shareVerse}
                       disabled={isSharing}
                       variant="outline"
                       className="gap-3 bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30 shadow-xl hover:shadow-2xl transition-all duration-200 disabled:opacity-50"
                     >
                       <span className="text-xl">{isSharing ? '⏳' : '📤'}</span>
                       <span className="font-semibold">
                         {isSharing ? 'Sharing...' : 'Share Verse'}
                       </span>
                     </Button>
                   </div>
                 )}
        </div>
      </div>
    </Card>
  )
}

export default DailyVerseHero