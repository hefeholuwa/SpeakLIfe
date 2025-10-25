import React, { useState } from 'react'
import aiGenerationService from '../services/aiGenerationService.js'

const AITest = () => {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }])
  }

  const testAIGeneration = async () => {
    setIsLoading(true)
    addLog('🧪 Starting AI Generation Test...', 'info')
    
    try {
      // Check API key
      addLog(`🔑 API Key configured: ${!!aiGenerationService.apiKey}`, aiGenerationService.apiKey ? 'success' : 'error')
      addLog(`🔑 API Key length: ${aiGenerationService.apiKey ? aiGenerationService.apiKey.length : 0}`, 'info')
      
      if (!aiGenerationService.apiKey) {
        addLog('❌ No API key found. Check your .env file.', 'error')
        return
      }
      
      // Test daily verse generation
      addLog('📖 Testing daily verse generation...', 'info')
      const verse = await aiGenerationService.generateDailyVerse()
      addLog(`✅ Daily verse generated: ${verse.verse_text}`, 'success')
      addLog(`📖 Reference: ${verse.reference}`, 'info')
      
      // Test confession generation
      addLog('🙏 Testing confession generation...', 'info')
      const confession = await aiGenerationService.generateConfessionForVerse(verse)
      addLog(`✅ Confession generated: ${confession.confession_text}`, 'success')
      
      addLog('🎉 All tests passed!', 'success')
      
    } catch (error) {
      addLog(`❌ Test failed: ${error.message}`, 'error')
      console.error('Full error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">AI Generation Test</h2>
      
      <div className="mb-4">
        <button
          onClick={testAIGeneration}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test AI Generation'}
        </button>
        
        <button
          onClick={clearLogs}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Clear Logs
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-gray-500">No logs yet. Click "Test AI Generation" to start.</p>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded ${
                log.type === 'error' ? 'bg-red-100 text-red-800' :
                log.type === 'success' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}
            >
              <span className="text-sm text-gray-500">[{log.timestamp}]</span> {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AITest
