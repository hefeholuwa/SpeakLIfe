import { useState, useEffect } from 'react'
import { useAI } from '../hooks/useAI.jsx'

const AIPersonalizedVerses = ({ userId }) => {
  const [verses, setVerses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const { getPersonalizedVerses } = useAI()

  useEffect(() => {
    if (userId) {
      loadPersonalizedVerses()
    }
  }, [userId])

  const loadPersonalizedVerses = async () => {
    try {
      setLoading(true)
      const personalizedVerses = await getPersonalizedVerses(userId, 5)
      setVerses(personalizedVerses)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await loadPersonalizedVerses()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading your personalized verses...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-green-600 text-lg">📖</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI Personalized Verses</h3>
        </div>
        <button
          onClick={handleRefresh}
          className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-200 transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-600">⚠️</span>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {verses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📖</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No personalized verses yet</h4>
            <p className="text-gray-600 mb-4">AI is learning your preferences to create personalized content</p>
            <button
              onClick={handleRefresh}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Generate Verses
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {verses.map((verse, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {verse.reference || `Personalized Verse ${index + 1}`}
                  </h4>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      AI Generated
                    </span>
                    <span className="text-xs text-gray-500">{verse.version || 'NIV'}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-gray-400 hover:text-red-500 transition-colors p-1">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button className="text-gray-400 hover:text-blue-600 transition-colors p-1">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-600 mb-2">Scripture</h5>
                  <p className="text-gray-800 leading-relaxed">
                    "{verse.scripture_text}"
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                  <h5 className="text-sm font-medium text-green-800 mb-2">Personalized Confession</h5>
                  <p className="text-green-900 font-medium leading-relaxed">
                    "{verse.confession_text}"
                  </p>
                </div>

                {verse.topic && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Topic:</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {verse.topic}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AIPersonalizedVerses
