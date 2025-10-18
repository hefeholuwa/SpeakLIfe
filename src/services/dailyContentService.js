import { supabase } from '../supabaseClient.jsx'
import { aiGenerationService } from './aiGenerationService.js'

/**
 * Daily Content Service
 * Handles generation and retrieval of daily AI content
 */
export class DailyContentService {
  constructor() {
    this.isGenerating = false
  }

  /**
   * Check if daily content exists for today
   */
  async checkDailyContentExists(date = new Date().toISOString().split('T')[0]) {
    try {
      const { data, error } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('date', date)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking daily content:', error)
        // If it's a 406 error, the table might not exist or have RLS issues
        if (error.code === 'PGRST406') {
          console.log('Table access issue detected. Please run the fix_daily_verses_table.sql script.')
        }
        return { exists: false, content: null }
      }

      return {
        exists: !!data,
        content: data
      }
    } catch (error) {
      console.error('Error checking daily content:', error)
      return { exists: false, content: null }
    }
  }

  /**
   * Get today's content from database
   */
  async getTodaysContent() {
    try {
      const { data, error } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .single()

      if (error) {
        console.error('Error fetching today\'s content:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching today\'s content:', error)
      return null
    }
  }

  /**
   * Generate and save daily content
   */
  async generateDailyContent() {
    if (this.isGenerating) {
      console.log('Daily content generation already in progress...')
      return await this.getTodaysContent()
    }

    try {
      this.isGenerating = true
      console.log('Starting daily content generation...')

      // Check if content already exists
      const existingContent = await this.checkDailyContentExists()
      if (existingContent.exists) {
        console.log('Daily content already exists for today')
        return existingContent.content
      }

      // Generate new content using AI
      console.log('Generating new daily content...')
      let dailyContent
      
      try {
        dailyContent = await aiGenerationService.generateDailyContent()
        
        if (!dailyContent) {
          throw new Error('Failed to generate daily content')
        }
      } catch (aiError) {
        console.error('AI generation failed:', aiError)
        throw new Error('Failed to generate daily content. Please try again later.')
      }

      // Save to database using upsert to handle duplicates
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('daily_verses')
        .upsert({
          date: today,
          verse_text: dailyContent.verse_text,
          reference: dailyContent.reference,
          confession_text: dailyContent.confession_text
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving daily content:', error)
        throw error
      }

      console.log('Daily content generated and saved successfully!')
      return data

    } catch (error) {
      console.error('Error generating daily content:', error)
      throw error
    } finally {
      this.isGenerating = false
    }
  }

  /**
   * Ensure daily content exists (generate if needed)
   */
  async ensureDailyContent() {
    try {
      // First check if content exists
      const existingContent = await this.checkDailyContentExists()
      
      if (existingContent.exists) {
        console.log('Daily content already exists, returning existing content')
        return existingContent.content
      }

      // Generate new content if it doesn't exist
      console.log('No daily content found, generating new content...')
      return await this.generateDailyContent()

    } catch (error) {
      console.error('Error ensuring daily content:', error)
      throw error
    }
  }

  /**
   * Get content for a specific date
   */
  async getContentForDate(date) {
    try {
      const { data, error } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('date', date)
        .single()

      if (error) {
        console.error('Error fetching content for date:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching content for date:', error)
      return null
    }
  }

  /**
   * Get content history (last 30 days)
   */
  async getContentHistory(limit = 30) {
    try {
      const { data, error } = await supabase
        .from('daily_verses')
        .select('*')
        .order('date', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching content history:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching content history:', error)
      return []
    }
  }

  /**
   * Manual trigger for daily content generation (admin use)
   */
  async forceGenerateDailyContent() {
    try {
      console.log('Force generating daily content...')
      
      // Generate new content
      const dailyContent = await aiGenerationService.generateDailyContent()
      
      if (!dailyContent) {
        throw new Error('Failed to generate daily content')
      }

      // Check if content already exists for today
      const today = new Date().toISOString().split('T')[0]
      const existingContent = await this.checkDailyContentExists(today)
      
      if (existingContent.exists) {
        // Update existing content
        const { data, error } = await supabase
          .from('daily_verses')
          .update({
            verse_text: dailyContent.verse_text,
            reference: dailyContent.reference,
            confession_text: dailyContent.confession_text,
            updated_at: new Date().toISOString()
          })
          .eq('date', today)
          .select()
          .single()

        if (error) throw error
        console.log('Daily content updated successfully!')
        return data
      } else {
        // Insert new content
        const { data, error } = await supabase
          .from('daily_verses')
          .insert({
            date: today,
            verse_text: dailyContent.verse_text,
            reference: dailyContent.reference,
            confession_text: dailyContent.confession_text
          })
          .select()
          .single()

        if (error) throw error
        console.log('Daily content created successfully!')
        return data
      }

    } catch (error) {
      console.error('Error force generating daily content:', error)
      throw error
    }
  }
}

// Export singleton instance
export const dailyContentService = new DailyContentService()
