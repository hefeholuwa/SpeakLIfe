import { aiGenerationService } from './aiGenerationService.js'
import { supabase } from '../supabaseClient.jsx'

// Daily AI Content Generator
export class DailyAIGenerator {
  constructor() {
    this.isGenerating = false
  }

  // Generate all daily content
  async generateAllDailyContent() {
    if (this.isGenerating) {
      console.log('Daily content generation already in progress')
      return
    }

    try {
      this.isGenerating = true
      console.log('Starting daily AI content generation...')

      // Generate daily verse and confession
      const dailyContent = await aiGenerationService.generateDailyContent()
      console.log('Daily verse and confession generated:', dailyContent)

      // Generate daily reflection
      const dailyReflection = await aiGenerationService.generateDailyReflection()
      console.log('Daily reflection generated:', dailyReflection)

      console.log('Daily AI content generation completed successfully!')
      return {
        dailyContent,
        dailyReflection
      }
    } catch (error) {
      console.error('Error generating daily content:', error)
      throw error
    } finally {
      this.isGenerating = false
    }
  }

  // Check if daily content exists for today
  async checkDailyContentExists() {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data: verseContent } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('date', today)
        .single()

      const { data: reflectionContent } = await supabase
        .from('daily_reflections')
        .select('*')
        .eq('date', today)
        .single()

      return {
        verseExists: !!verseContent,
        reflectionExists: !!reflectionContent,
        verseContent,
        reflectionContent
      }
    } catch (error) {
      console.error('Error checking daily content:', error)
      return {
        verseExists: false,
        reflectionExists: false,
        verseContent: null,
        reflectionContent: null
      }
    }
  }

  // Generate content if missing
  async ensureDailyContent() {
    if (this.isGenerating) {
      console.log('Content generation already in progress, waiting...')
      // Wait for current generation to complete
      while (this.isGenerating) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      // Try to get existing content after generation completes
      const contentStatus = await this.checkDailyContentExists()
      return {
        dailyContent: contentStatus.verseContent,
        dailyReflection: contentStatus.reflectionContent
      }
    }

    try {
      const contentStatus = await this.checkDailyContentExists()
      
      if (!contentStatus.verseExists || !contentStatus.reflectionExists) {
        console.log('Missing daily content, generating...')
        return await this.generateAllDailyContent()
      } else {
        console.log('Daily content already exists for today')
        return {
          dailyContent: contentStatus.verseContent,
          dailyReflection: contentStatus.reflectionContent
        }
      }
    } catch (error) {
      console.error('Error ensuring daily content:', error)
      throw error
    }
  }

  // Schedule daily content generation (for future use)
  scheduleDailyGeneration() {
    // This would typically be handled by a cron job or scheduled function
    // For now, we'll just ensure content exists when the app loads
    console.log('Daily content generation scheduled')
  }
}

// Export singleton instance
export const dailyAIGenerator = new DailyAIGenerator()
