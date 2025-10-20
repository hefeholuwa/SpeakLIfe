// Test AI Generation Service
import { aiGenerationService } from './src/services/aiGenerationService.js'

console.log('🧪 Testing AI Generation Service...')

try {
  // Force regenerate content for today
  const result = await aiGenerationService.generateDailyContent(true)
  console.log('✅ AI Generation Result:')
  console.log('Verse:', result.verse_text)
  console.log('Reference:', result.reference)
  console.log('Translation:', result.translation)
  console.log('Confession:', result.confession_text)
} catch (error) {
  console.error('❌ AI Generation Error:', error.message)
  console.error('Full error:', error)
}
