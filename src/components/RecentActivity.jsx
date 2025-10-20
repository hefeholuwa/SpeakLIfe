import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { ScrollArea } from './ui/scroll-area'
import { supabase } from '../supabaseClient.jsx'

const RecentActivity = () => {
  const [confessions, setConfessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUserConfessions()
  }, [])

  const loadUserConfessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('confession_journal')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'confession')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      setConfessions(data || [])
    } catch (error) {
      console.error('Error loading user confessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString()
  }

  const getGradient = (index) => {
    const gradients = [
      'from-green-400 to-emerald-500',
      'from-blue-400 to-cyan-500',
      'from-purple-400 to-pink-500',
      'from-orange-400 to-red-500',
      'from-indigo-400 to-purple-500',
      'from-pink-400 to-rose-500',
      'from-teal-400 to-cyan-500',
      'from-yellow-400 to-orange-500'
    ]
    return gradients[index % gradients.length]
  }
  return (
    <Card className="p-8 bg-gradient-to-br from-white to-gray-50 border-0 shadow-2xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
          <span className="text-white text-2xl">💬</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Recent Confessions</h2>
          <p className="text-gray-600">Your spiritual declarations</p>
        </div>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading your confessions...</span>
          </div>
        ) : confessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No confessions yet</h3>
            <p className="text-gray-600">Start writing your spiritual confessions in your journal</p>
          </div>
        ) : (
          <div className="space-y-6">
            {confessions.map((confession, index) => (
              <div 
                key={confession.id}
                className="group p-6 rounded-2xl bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getGradient(index)}`}></div>
                    <p className="font-bold text-lg text-purple-600">{confession.title || 'Personal Confession'}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="text-lg">🕐</span>
                    {formatTimeAgo(confession.created_at)}
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed text-base">
                  {confession.content}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getGradient(index)}`}></div>
                      <span className="text-sm text-gray-500">Personal Declaration</span>
                    </div>
                    {confession.mood && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {confession.mood}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  )
}

export default RecentActivity