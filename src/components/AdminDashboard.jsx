import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.jsx'

const AdminDashboard = ({ onNavigate }) => {
  const [topics, setTopics] = useState([])
  const [verses, setVerses] = useState([])
  const [dailyContent, setDailyContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [topicsRes, versesRes, dailyRes] = await Promise.all([
        supabase.from('topics').select('*').order('title'),
        supabase.from('verses').select('*').order('created_at', { ascending: false }),
        supabase.from('daily_content').select('*').order('created_at', { ascending: false })
      ])

      if (topicsRes.error) throw topicsRes.error
      if (versesRes.error) throw versesRes.error
      if (dailyRes.error) throw dailyRes.error

      setTopics(topicsRes.data)
      setVerses(versesRes.data)
      setDailyContent(dailyRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'topics', label: 'Topics', icon: '📚' },
    { id: 'verses', label: 'Verses', icon: '📖' },
    { id: 'daily', label: 'Daily Content', icon: '📅' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">SpeakLife Administration</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('landing')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Back to App
            </button>
          </div>
        </div>
                </div>

      {/* Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          </div>
        </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">📚</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Topics</p>
                  <p className="text-2xl font-bold text-gray-900">{topics.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">📖</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Verses</p>
                  <p className="text-2xl font-bold text-gray-900">{verses.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">📅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Daily Content</p>
                  <p className="text-2xl font-bold text-gray-900">{dailyContent.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Users</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Topics Management</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topics.map((topic) => (
                  <div key={topic.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">{topic.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      Created: {new Date(topic.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'verses' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Verses Management</h3>
              </div>
              <div className="p-6">
              <div className="space-y-4">
                {verses.slice(0, 10).map((verse) => (
                  <div key={verse.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">{verse.reference}</h4>
                    <p className="text-sm text-gray-600 mt-1">{verse.text}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      Created: {new Date(verse.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'daily' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Daily Content Management</h3>
            </div>
              <div className="p-6">
              <div className="space-y-4">
                {dailyContent.slice(0, 10).map((content) => (
                  <div key={content.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">Daily Content</h4>
                    <p className="text-sm text-gray-600 mt-1">{content.verse_text}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      Created: {new Date(content.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
                  </div>
              </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
