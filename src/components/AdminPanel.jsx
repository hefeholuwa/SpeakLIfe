import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.jsx'
import adminService from '../services/adminService.js'

const AdminPanel = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [todaysContent, setTodaysContent] = useState(null)
  const [nextGeneration, setNextGeneration] = useState(null)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    loadTodaysContent()
    updateNextGeneration()
  }, [])

  const loadTodaysContent = async () => {
    try {
      const content = await adminService.getDailyContent()
      setTodaysContent(content[0] || null)
    } catch (error) {
      addLog('Error loading content: ' + error.message)
    }
  }

  const updateNextGeneration = () => {
    // Set next generation to tomorrow at 6 AM
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(6, 0, 0, 0)
    setNextGeneration(tomorrow)
  }

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const handleForceGenerate = async () => {
    setIsGenerating(true)
    addLog('Starting manual generation...')
    
    try {
      // Create a sample daily content
      const sampleContent = {
        date: new Date().toISOString().split('T')[0],
        verse: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
        confession: 'I confess that I am loved by God and have eternal life through Jesus Christ.',
        reference: 'John 3:16'
      }
      
      const content = await adminService.createDailyContent(sampleContent)
      if (content) {
        addLog('✅ Content generated successfully')
        setTodaysContent(content)
      } else {
        addLog('❌ Generation failed')
      }
    } catch (error) {
      addLog('❌ Error: ' + error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClearCache = async () => {
    try {
      await adminService.clearCache()
      addLog('🗑️ Cache cleared')
    } catch (error) {
      addLog('❌ Error clearing cache: ' + error.message)
    }
  }

  const handlePreloadTomorrow = async () => {
    addLog('📅 Preloading tomorrow\'s content...')
    try {
      const tomorrowContent = {
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        verse: 'I can do all this through him who gives me strength.',
        confession: 'I confess that I have strength through Christ to overcome any challenge.',
        reference: 'Philippians 4:13'
      }
      
      await adminService.createDailyContent(tomorrowContent)
      addLog('✅ Tomorrow\'s content preloaded')
    } catch (error) {
      addLog('❌ Error preloading content: ' + error.message)
    }
  }

  const handleAddTestConfession = async () => {
    addLog('📝 Adding test confession...')
    try {
      const { error } = await supabase
        .from('user_confessions')
        .insert({
          user_id: null, // Demo user
          note: 'Test confession for demo purposes',
          confessed_at: new Date().toISOString(),
          ai_suggested: false,
          personalization_factors: {}
        })

      if (error) {
        addLog('❌ Error adding test confession: ' + error.message)
      } else {
        addLog('✅ Test confession added successfully')
        // Refresh the content
        loadTodaysContent()
      }
    } catch (error) {
      addLog('❌ Error: ' + error.message)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          🤖 Daily Content Admin Panel
        </h2>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Today's Content</h3>
            <p className="text-sm text-blue-600">
              {todaysContent ? '✅ Available' : '❌ Not Generated'}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Next Generation</h3>
            <p className="text-sm text-green-600">
              {nextGeneration ? nextGeneration.toLocaleString() : 'Calculating...'}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800">Scheduler Status</h3>
            <p className="text-sm text-purple-600">
              ✅ Running
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleForceGenerate}
            disabled={isGenerating}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {isGenerating ? '⏳ Generating...' : '🚀 Force Generate Today'}
          </button>
          
          <button
            onClick={loadTodaysContent}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            🔄 Refresh Content
          </button>
          
          <button
            onClick={handleClearCache}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            🗑️ Clear Cache
          </button>
          
          <button
            onClick={handlePreloadTomorrow}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            📅 Preload Tomorrow
          </button>
          
          <button
            onClick={handleAddTestConfession}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            📝 Add Test Confession
          </button>
        </div>

        {/* Today's Content Display */}
        {todaysContent && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-3">Today's Generated Content:</h3>
            <div className="space-y-3">
              <div>
                <strong>Verse:</strong> {todaysContent.verse_text}
              </div>
              <div>
                <strong>Reference:</strong> {todaysContent.reference}
              </div>
              <div>
                <strong>Confession:</strong> {todaysContent.confession_text}
              </div>
              <div className="text-sm text-gray-600">
                Date: {todaysContent.date}
              </div>
            </div>
          </div>
        )}

        {/* Logs */}
        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
          <h3 className="text-white mb-2">System Logs:</h3>
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
