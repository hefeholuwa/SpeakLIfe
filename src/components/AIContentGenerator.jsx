import { useState } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { aiGenerationService } from '../services/aiGenerationService.js'

const AIContentGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState(null)
  const [error, setError] = useState(null)

  const generateDailyContent = async () => {
    try {
      setIsGenerating(true)
      setError(null)
      
      const content = await aiGenerationService.generateDailyContent()
      setGeneratedContent(content)
    } catch (err) {
      setError(err.message)
      console.error('Error generating content:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateReflection = async () => {
    try {
      setIsGenerating(true)
      setError(null)
      
      const reflection = await aiGenerationService.generateDailyReflection()
      setGeneratedContent({ reflection })
    } catch (err) {
      setError(err.message)
      console.error('Error generating reflection:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const generatePersonalizedVerses = async () => {
    try {
      setIsGenerating(true)
      setError(null)
      
      const verses = await aiGenerationService.generatePersonalizedVerses('demo-user-id', 3)
      setGeneratedContent({ verses })
    } catch (err) {
      setError(err.message)
      console.error('Error generating verses:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="p-8 bg-gradient-to-br from-white to-gray-50 border-0 shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
          <span className="text-white text-2xl">🤖</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">AI Content Generator</h2>
          <p className="text-gray-600 text-sm">Generate AI-powered spiritual content</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Generation Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={generateDailyContent}
            disabled={isGenerating}
            className="h-auto p-6 flex-col items-center gap-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:scale-102 transition-all duration-200 shadow-lg hover:shadow-2xl border-0"
          >
            <span className="text-3xl">📖</span>
            <div className="text-center">
              <p className="font-bold text-lg">Daily Verse</p>
              <p className="text-sm opacity-90">Generate today's scripture</p>
            </div>
          </Button>

          <Button
            onClick={generateReflection}
            disabled={isGenerating}
            className="h-auto p-6 flex-col items-center gap-3 bg-gradient-to-br from-green-500 to-teal-600 text-white hover:scale-102 transition-all duration-200 shadow-lg hover:shadow-2xl border-0"
          >
            <span className="text-3xl">💭</span>
            <div className="text-center">
              <p className="font-bold text-lg">Daily Reflection</p>
              <p className="text-sm opacity-90">Generate spiritual reflection</p>
            </div>
          </Button>

          <Button
            onClick={generatePersonalizedVerses}
            disabled={isGenerating}
            className="h-auto p-6 flex-col items-center gap-3 bg-gradient-to-br from-orange-500 to-red-500 text-white hover:scale-102 transition-all duration-200 shadow-lg hover:shadow-2xl border-0"
          >
            <span className="text-3xl">✨</span>
            <div className="text-center">
              <p className="font-bold text-lg">Personalized Verses</p>
              <p className="text-sm opacity-90">Generate custom verses</p>
            </div>
          </Button>
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600 font-medium">Generating AI content...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-red-500 text-xl">⚠️</span>
              <div>
                <p className="text-red-800 font-semibold">Generation Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Generated Content */}
        {generatedContent && !isGenerating && (
          <div className="space-y-6">
            {generatedContent.verse_text && (
              <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Generated Daily Verse</h3>
                <div className="space-y-3">
                  <p className="text-gray-700 text-lg leading-relaxed">
                    "{generatedContent.verse_text}"
                  </p>
                  <p className="text-blue-600 font-semibold">{generatedContent.reference}</p>
                  <div className="p-4 bg-white/50 rounded-lg">
                    <p className="text-gray-700 text-sm font-medium mb-2">Confession:</p>
                    <p className="text-gray-600">{generatedContent.confession_text}</p>
                  </div>
                </div>
              </div>
            )}

            {generatedContent.reflection && (
              <div className="p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl border border-green-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Generated Daily Reflection</h3>
                <p className="text-gray-700 leading-relaxed">{generatedContent.reflection.reflection_text}</p>
              </div>
            )}

            {generatedContent.verses && (
              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Generated Personalized Verses</h3>
                <div className="space-y-4">
                  {generatedContent.verses.map((verse, index) => (
                    <div key={index} className="p-4 bg-white/50 rounded-lg">
                      <p className="text-gray-700 text-lg leading-relaxed mb-2">
                        "{verse.scripture_text}"
                      </p>
                      <p className="text-orange-600 font-semibold mb-2">{verse.reference}</p>
                      <div className="p-3 bg-white/70 rounded">
                        <p className="text-gray-600 text-sm">{verse.confession_text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

export default AIContentGenerator
