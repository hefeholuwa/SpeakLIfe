// Test AI Generation Service
import { AIGenerationService } from './src/services/aiGenerationService.js'

async function testAIGeneration() {
  console.log('🧪 Testing AI Generation Service...')
  
  try {
    const aiService = new AIGenerationService()
    
    // Check if API key is configured
    console.log('🔑 API Key configured:', !!aiService.apiKey)
    console.log('🔑 API Key length:', aiService.apiKey ? aiService.apiKey.length : 0)
    
    // Test daily verse generation
    console.log('📖 Testing daily verse generation...')
    const verse = await aiService.generateDailyVerse()
    console.log('✅ Daily verse generated:', verse)
    
    // Test confession generation
    console.log('🙏 Testing confession generation...')
    const confession = await aiService.generateConfessionForVerse(verse)
    console.log('✅ Confession generated:', confession)
    
    console.log('🎉 All tests passed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

testAIGeneration()