import { supabase } from '../supabaseClient.jsx'
import { dailyScheduler } from './dailyScheduler.js'

class InstantContentLoader {
  constructor() {
    this.cache = new Map()
    this.isLoading = false
  }

  // Get today's content instantly (with caching)
  async getTodaysContent() {
    const today = new Date().toISOString().split('T')[0]
    
    // Check cache first
    if (this.cache.has(today)) {
      console.log('⚡ Loading from cache')
      return this.cache.get(today)
    }

    try {
      console.log('📡 Fetching from database...')
      const { data, error } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('date', today)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        // Cache the result
        this.cache.set(today, data)
        console.log('✅ Content loaded and cached')
        return data
      }

      // No content found, trigger generation
      console.log('🔄 No content found, triggering generation...')
      return await this.generateAndCache()
      
    } catch (error) {
      console.error('❌ Error loading content:', error)
      return null
    }
  }

  // Generate content and cache it
  async generateAndCache() {
    if (this.isLoading) {
      console.log('⏳ Generation already in progress...')
      return null
    }

    this.isLoading = true
    
    try {
      // Use the scheduler to generate content
      const content = await dailyScheduler.generateTodaysContent()
      
      if (content) {
        const today = new Date().toISOString().split('T')[0]
        this.cache.set(today, content)
        console.log('✅ Content generated and cached')
      }
      
      return content
    } catch (error) {
      console.error('❌ Error generating content:', error)
      return null
    } finally {
      this.isLoading = false
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear()
    console.log('🗑️ Cache cleared')
  }

  // Preload tomorrow's content
  async preloadTomorrow() {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowDate = tomorrow.toISOString().split('T')[0]
    
    try {
      const { data } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('date', tomorrowDate)
        .single()

      if (data) {
        this.cache.set(tomorrowDate, data)
        console.log('📅 Tomorrow\'s content preloaded')
      }
    } catch (error) {
      console.log('📅 No content for tomorrow yet')
    }
  }

  // Get content for specific date
  async getContentForDate(date) {
    if (this.cache.has(date)) {
      return this.cache.get(date)
    }

    try {
      const { data, error } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('date', date)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        this.cache.set(date, data)
      }

      return data
    } catch (error) {
      console.error('Error fetching content for date:', error)
      return null
    }
  }
}

// Create singleton instance
export const instantContentLoader = new InstantContentLoader()
