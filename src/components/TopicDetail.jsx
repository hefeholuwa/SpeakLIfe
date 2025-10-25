import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ArrowLeft, Heart, Share2, BookOpen, MessageCircle, Star } from 'lucide-react'
import { supabase } from '../supabaseClient.jsx'
import adminService from '../services/adminService.js'

const TopicDetail = () => {
  const [topicId, setTopicId] = useState(null)
  const [topic, setTopic] = useState(null)
  const [verses, setVerses] = useState([])
  const [confessions, setConfessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('verses') // 'verses' or 'confessions'

  useEffect(() => {
    // Extract topicId from URL
    const path = window.location.pathname
    const topicIdFromUrl = path.split('/topic/')[1]
    if (topicIdFromUrl) {
      setTopicId(topicIdFromUrl)
      loadTopicData(topicIdFromUrl)
    }
  }, [])

  const loadTopicData = async (id) => {
    try {
      setIsLoading(true)
      
      // Track the view first
      try {
        const { data: { user } } = await supabase.auth.getUser()
        await adminService.trackTopicView(id, user?.id || null)
      } catch (error) {
      }
      
      // Load topic details
      const { data: topicData, error: topicError } = await supabase
        .from('topics')
        .select('*')
        .eq('id', id)
        .single()

      if (topicError) throw topicError
      setTopic(topicData)

      // Load topic content
      const [versesResult, confessionsResult] = await Promise.all([
        supabase
          .from('topic_verses')
          .select('*')
          .eq('topic_id', id)
          .order('created_at', { ascending: false }),
        supabase
          .from('topic_confessions')
          .select('*')
          .eq('topic_id', id)
          .order('created_at', { ascending: false })
      ])

      if (versesResult.error) throw versesResult.error
      if (confessionsResult.error) throw confessionsResult.error

      setVerses(versesResult.data || [])
      setConfessions(confessionsResult.data || [])
    } catch (error) {
      console.error('Error loading topic data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveToFavorites = async (content, type) => {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          content_type: type,
          content_id: content.id,
          content_text: type === 'verse' ? content.verse_text : content.confession_text,
          reference: content.reference || content.title
        })

      if (error) throw error
      // Show success message
    } catch (error) {
      console.error('Error saving to favorites:', error)
    }
  }

  const handleShare = async (content, type) => {
    try {
      const shareData = {
        title: `${topic?.title} - ${type === 'verse' ? content.reference : content.title}`,
        text: type === 'verse' ? content.verse_text : content.confession_text,
        url: window.location.href
      }

      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}`)
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading topic content...</p>
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Topic Not Found</h1>
            <Button onClick={() => {
              window.history.pushState({}, '', '/dashboard')
              window.dispatchEvent(new PopStateEvent('popstate'))
            }} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.1),transparent_50%)]"></div>
      
      {/* Mobile-Responsive Header */}
      <div className="relative bg-white/80 backdrop-blur-sm shadow-2xl border-b border-white/20">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Button
              onClick={() => {
                window.history.pushState({}, '', '/dashboard')
                window.dispatchEvent(new PopStateEvent('popstate'))
              }}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
            
            <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto">
              <div className="relative flex-shrink-0">
                <div 
                  className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br flex items-center justify-center shadow-2xl"
                  style={{ 
                    background: `linear-gradient(135deg, ${topic.color}20, ${topic.color}40)`,
                    boxShadow: `0 20px 40px ${topic.color}20`
                  }}
                >
                  <span className="text-2xl sm:text-3xl lg:text-4xl">{topic.icon}</span>
                </div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
              </div>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent truncate">
                  {topic.title}
                </h1>
                <p className="text-sm sm:text-base lg:text-xl text-gray-600 mt-1 sm:mt-2 line-clamp-2">{topic.description}</p>
              </div>
            </div>
          </div>

          {/* Mobile-Responsive Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-8">
            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 sm:px-6 py-3 rounded-xl sm:rounded-2xl shadow-lg">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{verses.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Verses</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 sm:px-6 py-3 rounded-xl sm:rounded-2xl shadow-lg">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{confessions.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Confessions</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 sm:px-6 py-3 rounded-xl sm:rounded-2xl shadow-lg">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{topic.daily_views || 0}</div>
                <div className="text-xs sm:text-sm text-gray-600">Today</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Responsive Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-2xl rounded-2xl sm:rounded-3xl">
          {/* Mobile-Responsive Tab Navigation */}
          <div className="relative p-4 sm:p-6 lg:p-8 border-b border-gray-100">
            <div className="flex gap-1 sm:gap-2 bg-gradient-to-r from-gray-100 to-gray-50 p-1 sm:p-2 rounded-xl sm:rounded-2xl w-full sm:w-fit shadow-lg">
              <Button
                onClick={() => setActiveTab('verses')}
                variant={activeTab === 'verses' ? 'default' : 'ghost'}
                size="sm"
                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm ${
                  activeTab === 'verses' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-semibold truncate">Verses ({verses.length})</span>
              </Button>
              <Button
                onClick={() => setActiveTab('confessions')}
                variant={activeTab === 'confessions' ? 'default' : 'ghost'}
                size="sm"
                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm ${
                  activeTab === 'confessions' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-semibold truncate">Confessions ({confessions.length})</span>
              </Button>
            </div>
          </div>

        {/* Mobile-Responsive Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {activeTab === 'verses' && (
            <div className="space-y-3 sm:space-y-4">
              {verses.length === 0 ? (
                <Card className="p-6 sm:p-8 text-center">
                  <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Verses Yet</h3>
                  <p className="text-sm sm:text-base text-gray-600">Verses for this topic will appear here.</p>
                </Card>
              ) : (
                verses.map((verse) => (
                  <Card key={verse.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="flex-1 min-w-0">
                        <Badge variant="outline" className="mb-2 text-xs">{verse.reference}</Badge>
                        <p className="text-sm sm:text-base lg:text-lg text-gray-800 leading-relaxed">{verse.verse_text}</p>
                      </div>
                      <div className="flex items-center gap-2 sm:ml-4 flex-shrink-0">
                        <Button
                          onClick={() => handleSaveToFavorites(verse, 'verse')}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleShare(verse, 'verse')}
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 p-2"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {verse.book} {verse.chapter}:{verse.verse} • {verse.translation}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'confessions' && (
            <div className="space-y-4 sm:space-y-6">
              {confessions.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No confessions yet</h3>
                  <p className="text-sm sm:text-base text-gray-600">Confessions for this topic will appear here when added.</p>
                </div>
              ) : (
                confessions.map((confession, index) => (
                  <div 
                    key={confession.id} 
                    className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        {confession.title && (
                          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <h4 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">{confession.title}</h4>
                            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse flex-shrink-0"></div>
                          </div>
                        )}
                        
                        <blockquote className="text-gray-800 text-sm sm:text-base lg:text-xl leading-relaxed font-medium italic">
                          "{confession.confession_text}"
                        </blockquote>
                      </div>
                      
                      <div className="flex items-center gap-2 sm:ml-6 flex-shrink-0">
                        <Button
                          onClick={() => handleSaveToFavorites(confession, 'confession')}
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                        >
                          <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                        <Button
                          onClick={() => handleShare(confession, 'confession')}
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-300"
                        >
                          <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl sm:rounded-2xl"></div>
                  </div>
                ))
              )}
            </div>
          )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default TopicDetail
