import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { supabase } from '../supabaseClient.jsx'
import adminService from '../services/adminService.js'

const TopicLibrary = ({ onNavigate }) => {
  const [topics, setTopics] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTopics()
  }, [])

  const loadTopics = async () => {
    try {
      // Get topics with daily view counts
      const topicsWithViews = await adminService.getTopicViewsWithCounts()
      setTopics(topicsWithViews)
    } catch (error) {
      console.error('Error loading topics:', error)
      // Fallback to default topics if database fails
      setTopics([
        { 
          title: "Faith", 
          icon: "✨", 
          color: "#f59e0b",
          daily_views: 0,
          description: "Believe and receive"
        },
        { 
          title: "Peace", 
          icon: "🛡️", 
          color: "#3b82f6",
          daily_views: 0,
          description: "God's protection"
        },
        { 
          title: "Love", 
          icon: "❤️", 
          color: "#ef4444",
          daily_views: 0,
          description: "Unconditional love"
        },
        { 
          title: "Wisdom", 
          icon: "💡", 
          color: "#f59e0b",
          daily_views: 0,
          description: "Divine understanding"
        },
        { 
          title: "Prosperity", 
          icon: "💰", 
          color: "#10b981",
          daily_views: 0,
          description: "Abundant blessings"
        },
        { 
          title: "Relationships", 
          icon: "👥", 
          color: "#8b5cf6",
          daily_views: 0,
          description: "Godly connections"
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)]"></div>
      
      <Card className="relative p-8 sm:p-12 border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
        {/* Premium Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12">
          <div className="flex items-center gap-6 mb-6 lg:mb-0">
            <div className="relative">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-2xl">
                <span className="text-white text-3xl">📚</span>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
                Explore Topics
              </h2>
              <p className="text-lg text-gray-600 mt-2">Discover spiritual themes and deepen your faith</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="lg" 
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <span className="mr-2">✨</span>
            View All
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-pink-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <span className="mt-4 text-lg text-gray-600 font-medium">Loading spiritual topics...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {topics.map((topic, index) => (
              <Card 
                key={topic.id || topic.name}
                onClick={() => {
                  // Navigate to topic detail page using custom routing
                  window.history.pushState({}, '', `/topic/${topic.id}`)
                  window.dispatchEvent(new PopStateEvent('popstate'))
                }}
                className="group relative p-8 cursor-pointer bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 rounded-3xl overflow-hidden"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Premium Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="relative z-10 space-y-6">
                  {/* Premium Icon */}
                  <div className="relative">
                    <div 
                      className="w-20 h-20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-2xl"
                      style={{ 
                        background: `linear-gradient(135deg, ${topic.color}15, ${topic.color}30)`,
                        boxShadow: `0 20px 40px ${topic.color}20`
                      }}
                    >
                      <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{topic.icon}</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                  </div>
                  
                  {/* Premium Content */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">
                        {topic.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-base">
                        {topic.description}
                      </p>
                    </div>
                    
                    {/* Premium Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-purple-600">
                          {topic.daily_views || 0} today
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Explore</span>
                        <div className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300">→</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              </Card>
            ))}
          </div>
        )}
      </Card>
      
      <style jsx>{`
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

export default TopicLibrary