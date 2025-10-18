// Test script for daily content system
import { dailyContentService } from './src/services/dailyContentService.js'

async function testDailyContent() {
  console.log('🧪 Testing Daily Content System...\n')

  try {
    // Test 1: Check if content exists for today
    console.log('1. Checking if daily content exists...')
    const contentExists = await dailyContentService.checkDailyContentExists()
    console.log('Content exists:', contentExists.exists)
    
    if (contentExists.content) {
      console.log('Existing content:', {
        date: contentExists.content.date,
        verse: contentExists.content.verse_text?.substring(0, 50) + '...',
        reference: contentExists.content.reference
      })
    }

    // Test 2: Get today's content
    console.log('\n2. Getting today\'s content...')
    const todaysContent = await dailyContentService.getTodaysContent()
    
    if (todaysContent) {
      console.log('✅ Today\'s content found:')
      console.log('Verse:', todaysContent.verse_text)
      console.log('Reference:', todaysContent.reference)
      console.log('Confession:', todaysContent.confession_text)
    } else {
      console.log('❌ No content found for today')
    }

    // Test 3: Ensure daily content (will generate if needed)
    console.log('\n3. Ensuring daily content exists...')
    const ensuredContent = await dailyContentService.ensureDailyContent()
    
    if (ensuredContent) {
      console.log('✅ Daily content ensured:')
      console.log('Date:', ensuredContent.date)
      console.log('Verse:', ensuredContent.verse_text?.substring(0, 100) + '...')
      console.log('Reference:', ensuredContent.reference)
    } else {
      console.log('❌ Failed to ensure daily content')
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testDailyContent()
