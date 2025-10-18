import { useState } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { dailyContentService } from '../services/dailyContentService.js'

const AdminDailyContent = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastGenerated, setLastGenerated] = useState(null)
  const [error, setError] = useState(null)

  const handleGenerateDailyContent = async () => {
    try {
      setIsGenerating(true)
      setError(null)
      
      console.log('Generating daily content...')
      const content = await dailyContentService.forceGenerateDailyContent()
      
      setLastGenerated(content)
      console.log('Daily content generated successfully:', content)
      
    } catch (error) {
      console.error('Error generating daily content:', error)
      setError(error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCheckContent = async () => {
    try {
      setError(null)
      const content = await dailyContentService.getTodaysContent()
      
      if (content) {
        setLastGenerated(content)
        console.log('Today\'s content found:', content)
      } else {
        console.log('No content found for today')
        setError('No content found for today')
      }
    } catch (error) {
      console.error('Error checking content:', error)
      setError(error.message)
    }
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Daily Content Admin
          </h2>
          <p className="text-gray-600">
            Manage daily AI-generated verses and confessions
          </p>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={handleGenerateDailyContent}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? 'Generating...' : 'Generate Daily Content'}
          </Button>

          <Button
            onClick={handleCheckContent}
            variant="outline"
          >
            Check Today's Content
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium">Error:</p>
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {lastGenerated && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Generated Content:
            </h3>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Verse:</h4>
              <p className="text-gray-700 mb-2">"{lastGenerated.verse_text}"</p>
              <p className="text-sm text-gray-600">- {lastGenerated.reference}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Confession:</h4>
              <p className="text-gray-700">{lastGenerated.confession_text}</p>
            </div>

            <div className="text-sm text-gray-500">
              Generated on: {new Date(lastGenerated.created_at).toLocaleString()}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500">
          <p><strong>Note:</strong> Daily content is generated once per day and shared by all users.</p>
          <p>If content already exists for today, it will be updated with new AI-generated content.</p>
        </div>
      </div>
    </Card>
  )
}

export default AdminDailyContent
