import { supabase } from '../supabaseClient.jsx'
import { aiGenerationService } from './aiGenerationService.js'

class DailyScheduler {
  constructor() {
    this.isRunning = false
    this.scheduleInterval = null
    this.lastGenerationDate = null
  }

  // Start the daily scheduler
  start() {
    if (this.isRunning) return
    
    this.isRunning = true
    console.log('🚀 Daily scheduler started')
    
    // Check every hour if it's time to generate
    this.scheduleInterval = setInterval(() => {
      this.checkAndGenerate()
    }, 60 * 60 * 1000) // Check every hour
    
    // Also check immediately
    this.checkAndGenerate()
  }

  // Stop the scheduler
  stop() {
    if (this.scheduleInterval) {
      clearInterval(this.scheduleInterval)
      this.scheduleInterval = null
    }
    this.isRunning = false
    console.log('⏹️ Daily scheduler stopped')
  }

  // Check if it's time to generate and do it
  async checkAndGenerate() {
    const now = new Date()
    const currentHour = now.getHours()
    const today = now.toISOString().split('T')[0]
    
    // Only generate between 6-8 AM
    if (currentHour >= 6 && currentHour <= 8) {
      // Check if we already generated today
      if (this.lastGenerationDate === today) {
        return
      }
      
      try {
        console.log('🕐 7 AM detected - Starting automated generation...')
        await this.generateTodaysContent()
        this.lastGenerationDate = today
        console.log('✅ Daily content generated successfully')
      } catch (error) {
        console.error('❌ Automated generation failed:', error)
      }
    }
  }

  // Generate today's content
  async generateTodaysContent() {
    try {
      // Check if content already exists
      const { data: existingContent } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .single()

      if (existingContent) {
        console.log('📅 Content already exists for today')
        return existingContent
      }

      console.log('🤖 Generating new daily content...')
      
      // Generate content using AI
      const content = await aiGenerationService.generateDailyContent()
      
      console.log('💾 Saving to database...')
      
      // Save to database
      const { data, error } = await supabase
        .from('daily_verses')
        .upsert({
          date: new Date().toISOString().split('T')[0],
          verse_text: content.verse_text,
          reference: content.reference,
          confession_text: content.confession_text,
          generated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      console.log('✅ Daily content saved successfully')
      return data
      
    } catch (error) {
      console.error('❌ Error generating daily content:', error)
      throw error
    }
  }

  // Get today's content (instant)
  async getTodaysContent() {
    try {
      const { data, error } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching today\'s content:', error)
      return null
    }
  }

  // Force generate content (for testing)
  async forceGenerate() {
    console.log('🔄 Force generating content...')
    this.lastGenerationDate = null
    return await this.generateTodaysContent()
  }

  // Get next generation time
  getNextGenerationTime() {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(7, 0, 0, 0)
    return tomorrow
  }
}

// Create singleton instance
export const dailyScheduler = new DailyScheduler()

// Auto-start scheduler when module loads
if (typeof window !== 'undefined') {
  dailyScheduler.start()
}
