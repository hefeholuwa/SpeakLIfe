// Admin Service
// Handles all admin operations including content management, cache operations, and system monitoring

import { supabase } from '../supabaseClient.jsx'
import aiGenerationService from './aiGenerationService.js'

class AdminService {
  constructor() {
    this.logs = []
    this.maxLogs = 1000
  }

  // Logging system
  addLog(message, type = 'info', data = null) {
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      message,
      type,
      data,
      time: new Date()
    }

    this.logs.unshift(logEntry)

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
    }

    return logEntry
  }

  getLogs(filter = 'all', searchTerm = '') {
    let filteredLogs = this.logs

    if (filter !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.type === filter)
    }

    if (searchTerm) {
      filteredLogs = filteredLogs.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filteredLogs
  }

  clearLogs() {
    this.logs = []
    this.addLog('Logs cleared', 'info')
  }

  // System Statistics
  async getSystemStats() {
    try {
      this.addLog('Loading system statistics...', 'info')

      const [
        { count: dailyVerseCount },
        { count: topicVerseCount },
        { count: topicConfessionCount },
        { count: bookmarkCount },
        { count: highlightCount },
        { count: userCount }
      ] = await Promise.all([
        supabase.from('daily_verses').select('*', { count: 'exact', head: true }),
        supabase.from('topic_verses').select('*', { count: 'exact', head: true }),
        supabase.from('topic_confessions').select('*', { count: 'exact', head: true }),
        supabase.from('bible_bookmarks').select('*', { count: 'exact', head: true }),
        supabase.from('bible_highlights').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ])

      const totalVerses = (dailyVerseCount || 0) + (topicVerseCount || 0)
      const totalConfessions = topicConfessionCount || 0

      const stats = {
        totalUsers: userCount || 0,
        totalVerses: totalVerses,
        totalConfessions: totalConfessions,
        totalBookmarks: bookmarkCount || 0,
        totalHighlights: highlightCount || 0,
        lastUpdated: new Date().toISOString()
      }

      this.addLog(`System stats loaded: ${stats.totalUsers} users, ${stats.totalVerses} verses, ${stats.totalConfessions} confessions`, 'success')
      return stats
    } catch (error) {
      this.addLog(`Error loading system stats: ${error.message}`, 'error')
      throw error
    }
  }

  // Get system logs
  getSystemLogs() {
    return this.getLogs()
  }

  // Get topic verses
  async getTopicVerses(topicId) {
    try {
      const { data, error } = await supabase
        .from('topic_verses')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      this.addLog(`Error fetching topic verses: ${error.message}`, 'error')
      return []
    }
  }

  // Get topic confessions
  async getTopicConfessions(topicId) {
    try {
      const { data, error } = await supabase
        .from('topic_confessions')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      this.addLog(`Error fetching topic confessions: ${error.message}`, 'error')
      return []
    }
  }

  // Content Management
  async createDailyContent(content) {
    try {
      this.addLog(`Creating daily content for ${content.date}...`, 'info')

      const { data, error } = await supabase
        .from('daily_verses')
        .insert({
          date: content.date,
          verse_text: content.verse_text || content.verse,
          confession_text: content.confession_text || content.confession,
          reference: `${content.reference} (${content.translation || 'KJV'})`
        })
        .select()

      if (error) throw error

      this.addLog(`Daily content created successfully for ${content.date}`, 'success')
      return data[0]
    } catch (error) {
      this.addLog(`Error creating daily content: ${error.message}`, 'error')
      throw error
    }
  }

  async updateDailyContent(id, updates) {
    try {
      this.addLog(`Updating daily content ${id}...`, 'info')

      const { data, error } = await supabase
        .from('daily_verses')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error

      this.addLog(`Daily content updated successfully`, 'success')
      return data[0]
    } catch (error) {
      this.addLog(`Error updating daily content: ${error.message}`, 'error')
      throw error
    }
  }

  async deleteDailyContent(id) {
    try {
      this.addLog(`Deleting daily content ${id}...`, 'info')

      const { error } = await supabase
        .from('daily_verses')
        .delete()
        .eq('id', id)

      if (error) throw error

      this.addLog(`Daily content deleted successfully`, 'success')
      return true
    } catch (error) {
      this.addLog(`Error deleting daily content: ${error.message}`, 'error')
      throw error
    }
  }

  async getDailyContent(date = null) {
    try {
      this.addLog(`Loading daily content${date ? ` for ${date}` : ''}...`, 'info')

      let query = supabase.from('daily_verses').select('*')

      if (date) {
        query = query.eq('date', date)
      } else {
        query = query.order('date', { ascending: false }).limit(10)
      }

      const { data, error } = await query

      if (error) throw error

      this.addLog(`Daily content loaded: ${data.length} entries`, 'success')
      return data
    } catch (error) {
      this.addLog(`Error loading daily content: ${error.message}`, 'error')
      throw error
    }
  }

  // Cache Management
  getCacheInfo() {
    try {
      this.addLog('Analyzing cache...', 'info')

      const cacheInfo = {
        localStorage: this.analyzeLocalStorage(),
        sessionStorage: this.analyzeSessionStorage(),
        memory: this.analyzeMemoryCache(),
        lastAnalyzed: new Date().toISOString()
      }

      this.addLog(`Cache analysis complete: ${cacheInfo.localStorage.size} localStorage items`, 'success')
      return cacheInfo
    } catch (error) {
      this.addLog(`Error analyzing cache: ${error.message}`, 'error')
      throw error
    }
  }

  analyzeLocalStorage() {
    const items = []
    const size = localStorage.length

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      const value = localStorage.getItem(key)
      items.push({
        key,
        size: value ? value.length : 0,
        type: this.getCacheType(key)
      })
    }

    return {
      size,
      items,
      totalSize: items.reduce((sum, item) => sum + item.size, 0)
    }
  }

  analyzeSessionStorage() {
    const items = []
    const size = sessionStorage.length

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      const value = sessionStorage.getItem(key)
      items.push({
        key,
        size: value ? value.length : 0,
        type: this.getCacheType(key)
      })
    }

    return {
      size,
      items,
      totalSize: items.reduce((sum, item) => sum + item.size, 0)
    }
  }

  analyzeMemoryCache() {
    // This would analyze any in-memory caches
    // For now, return a mock structure
    return {
      size: 0,
      items: [],
      totalSize: 0
    }
  }

  getCacheType(key) {
    if (key.includes('daily') || key.includes('verse')) return 'daily-content'
    if (key.includes('bible') || key.includes('chapter')) return 'bible-content'
    if (key.includes('user') || key.includes('auth')) return 'user-data'
    if (key.includes('cache')) return 'general-cache'
    return 'unknown'
  }

  async clearCache(type = 'all') {
    try {
      this.addLog(`Clearing cache (type: ${type})...`, 'warning')

      let clearedItems = 0

      if (type === 'all' || type === 'localStorage') {
        // Clear specific cache items
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (
            key.includes('cache') ||
            key.includes('daily') ||
            key.includes('bible') ||
            key.includes('user')
          )) {
            keysToRemove.push(key)
          }
        }

        keysToRemove.forEach(key => {
          localStorage.removeItem(key)
          clearedItems++
        })
      }

      if (type === 'all' || type === 'sessionStorage') {
        sessionStorage.clear()
        clearedItems += sessionStorage.length
      }

      this.addLog(`Cache cleared: ${clearedItems} items removed`, 'success')
      return { clearedItems, type }
    } catch (error) {
      this.addLog(`Error clearing cache: ${error.message}`, 'error')
      throw error
    }
  }

  // Topics Management
  async getTopics() {
    try {
      this.addLog('Fetching topics...', 'info')
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('title', { ascending: true })

      if (error) throw error
      this.addLog(`Fetched ${data.length} topics`, 'success')
      return data
    } catch (error) {
      this.addLog(`Error fetching topics: ${error.message}`, 'error')
      throw error
    }
  }

  async createTopic(topic) {
    try {
      this.addLog(`Creating topic "${topic.title}"...`, 'info')
      const { data, error } = await supabase
        .from('topics')
        .insert([{
          title: topic.title,
          icon: topic.icon,
          color: topic.color || '#6366f1',
          description: topic.description,
          category: topic.category || 'General',
          is_featured: topic.is_featured || false,
          usage_count: parseInt(topic.usage_count) || 0,
          popularity_score: parseFloat(topic.popularity_score) || 0.0
        }])
        .select()

      if (error) throw error
      this.addLog(`Topic "${topic.title}" created successfully`, 'success')
      return data[0]
    } catch (error) {
      this.addLog(`Error creating topic: ${error.message}`, 'error')
      throw error
    }
  }

  async updateTopic(id, updates) {
    try {
      this.addLog(`Updating topic ${id}...`, 'info')
      const { data, error } = await supabase
        .from('topics')
        .update({
          title: updates.title,
          icon: updates.icon,
          color: updates.color,
          description: updates.description,
          category: updates.category,
          is_featured: updates.is_featured,
          usage_count: parseInt(updates.usage_count) || 0,
          popularity_score: parseFloat(updates.popularity_score) || 0.0
        })
        .eq('id', id)
        .select()

      if (error) throw error
      this.addLog(`Topic updated successfully`, 'success')
      return data[0]
    } catch (error) {
      this.addLog(`Error updating topic: ${error.message}`, 'error')
      throw error
    }
  }

  async deleteTopic(id) {
    try {
      this.addLog(`Deleting topic ${id}...`, 'warning')
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', id)

      if (error) throw error
      this.addLog(`Topic deleted successfully`, 'success')
    } catch (error) {
      this.addLog(`Error deleting topic: ${error.message}`, 'error')
      throw error
    }
  }

  async toggleTopicStatus(id, isActive) {
    try {
      this.addLog(`Toggling topic ${id} status to ${isActive}...`, 'info')
      // Since there's no is_active column, we'll update the usage_count to indicate activity
      const { data, error } = await supabase
        .from('topics')
        .update({
          usage_count: isActive ? 1 : 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error
      this.addLog(`Topic status updated to ${isActive ? 'active' : 'inactive'}`, 'success')
      return data[0]
    } catch (error) {
      this.addLog(`Error toggling topic status: ${error.message}`, 'error')
      throw error
    }
  }

  // Topic Content Management (Verses & Confessions)
  async getTopicContent(topicId) {
    try {
      this.addLog(`Fetching content for topic ${topicId}...`, 'info')

      const [versesResult, confessionsResult] = await Promise.all([
        supabase
          .from('topic_verses')
          .select('*')
          .eq('topic_id', topicId)
          .order('created_at', { ascending: false }),
        supabase
          .from('topic_confessions')
          .select('*')
          .eq('topic_id', topicId)
          .order('created_at', { ascending: false })
      ])

      if (versesResult.error) throw versesResult.error
      if (confessionsResult.error) throw confessionsResult.error

      this.addLog(`Fetched ${versesResult.data.length} verses and ${confessionsResult.data.length} confessions`, 'success')
      return {
        verses: versesResult.data,
        confessions: confessionsResult.data
      }
    } catch (error) {
      this.addLog(`Error fetching topic content: ${error.message}`, 'error')
      throw error
    }
  }

  async addTopicVerse(topicId, verseData) {
    try {
      this.addLog(`Adding verse to topic ${topicId}...`, 'info')

      const { data, error } = await supabase
        .from('topic_verses')
        .insert([{
          topic_id: topicId,
          verse_text: verseData.verse_text,
          reference: verseData.reference,
          book: verseData.book,
          chapter: verseData.chapter,
          verse: verseData.verse,
          translation: verseData.translation || 'KJV',
          is_featured: verseData.is_featured || false
        }])
        .select()

      if (error) {
        this.addLog(`Database error: ${error.message}`, 'error')
        throw error
      }

      this.addLog(`Verse added successfully`, 'success')
      return data[0]
    } catch (error) {
      this.addLog(`Error adding verse: ${error.message}`, 'error')
      throw error
    }
  }

  async addTopicConfession(topicId, confessionData) {
    try {
      this.addLog(`Adding confession to topic ${topicId}...`, 'info')

      const { data, error } = await supabase
        .from('topic_confessions')
        .insert([{
          topic_id: topicId,
          confession_text: confessionData.confession_text,
          title: confessionData.title,
          is_featured: confessionData.is_featured || false
        }])
        .select()

      if (error) {
        this.addLog(`Database error: ${error.message}`, 'error')
        throw error
      }

      this.addLog(`Confession added successfully`, 'success')
      return data[0]
    } catch (error) {
      this.addLog(`Error adding confession: ${error.message}`, 'error')
      throw error
    }
  }

  async createTopicVerse(verseData) {
    try {
      this.addLog(`Creating topic verse...`, 'info')

      // Remove id field to prevent duplicate key constraint violation
      const { id, ...insertData } = verseData

      const { data, error } = await supabase
        .from('topic_verses')
        .insert([insertData])
        .select()

      if (error) throw error
      this.addLog(`Topic verse created successfully`, 'success')
      return data[0]
    } catch (error) {
      this.addLog(`Error creating topic verse: ${error.message}`, 'error')
      throw error
    }
  }

  async updateTopicVerse(verseId, updates) {
    try {
      this.addLog(`Updating verse ${verseId}...`, 'info')
      const { data, error } = await supabase
        .from('topic_verses')
        .update(updates)
        .eq('id', verseId)
        .select()

      if (error) throw error
      this.addLog(`Verse updated successfully`, 'success')
      return data[0]
    } catch (error) {
      this.addLog(`Error updating verse: ${error.message}`, 'error')
      throw error
    }
  }

  async createTopicConfession(confessionData) {
    try {
      this.addLog(`Creating topic confession...`, 'info')

      // Remove id field to prevent duplicate key constraint violation
      const { id, ...insertData } = confessionData

      const { data, error } = await supabase
        .from('topic_confessions')
        .insert([insertData])
        .select()

      if (error) throw error
      this.addLog(`Topic confession created successfully`, 'success')
      return data[0]
    } catch (error) {
      this.addLog(`Error creating topic confession: ${error.message}`, 'error')
      throw error
    }
  }

  async updateTopicConfession(confessionId, updates) {
    try {
      this.addLog(`Updating confession ${confessionId}...`, 'info')
      const { data, error } = await supabase
        .from('topic_confessions')
        .update(updates)
        .eq('id', confessionId)
        .select()

      if (error) throw error
      this.addLog(`Confession updated successfully`, 'success')
      return data[0]
    } catch (error) {
      this.addLog(`Error updating confession: ${error.message}`, 'error')
      throw error
    }
  }

  async deleteTopicVerse(verseId) {
    try {
      this.addLog(`Deleting verse ${verseId}...`, 'warning')
      const { error } = await supabase
        .from('topic_verses')
        .delete()
        .eq('id', verseId)

      if (error) throw error
      this.addLog(`Verse deleted successfully`, 'success')
    } catch (error) {
      this.addLog(`Error deleting verse: ${error.message}`, 'error')
      throw error
    }
  }

  async deleteTopicConfession(confessionId) {
    try {
      this.addLog(`Deleting confession ${confessionId}...`, 'warning')
      const { error } = await supabase
        .from('topic_confessions')
        .delete()
        .eq('id', confessionId)

      if (error) throw error
      this.addLog(`Confession deleted successfully`, 'success')
    } catch (error) {
      this.addLog(`Error deleting confession: ${error.message}`, 'error')
      throw error
    }
  }

  // --- Topic View Tracking ---
  async trackTopicView(topicId, userId = null) {
    try {
      this.addLog(`Tracking view for topic ${topicId}...`, 'info')

      const { error } = await supabase.rpc('increment_topic_view', {
        topic_uuid: topicId,
        user_uuid: userId
      })

      if (error) throw error
      this.addLog(`Topic view tracked successfully`, 'success')
    } catch (error) {
      this.addLog(`Error tracking topic view: ${error.message}`, 'error')
      throw error
    }
  }

  async getTopicDailyViews(topicId) {
    try {
      this.addLog(`Getting daily views for topic ${topicId}...`, 'info')

      const { data, error } = await supabase.rpc('get_topic_daily_views', {
        topic_uuid: topicId
      })

      if (error) throw error
      this.addLog(`Retrieved ${data || 0} daily views`, 'success')
      return data || 0
    } catch (error) {
      this.addLog(`Error getting daily views: ${error.message}`, 'error')
      throw error
    }
  }

  async getTopicViewsWithCounts() {
    try {
      this.addLog('Getting topics with daily view counts...', 'info')

      const { data: topics, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .order('title', { ascending: true })

      if (topicsError) throw topicsError

      // Get daily views for each topic
      const topicsWithViews = await Promise.all(
        topics.map(async (topic) => {
          try {
            const dailyViews = await this.getTopicDailyViews(topic.id)
            return {
              ...topic,
              daily_views: dailyViews
            }
          } catch (error) {
            this.addLog(`Error getting views for topic ${topic.title}: ${error.message}`, 'error')
            return {
              ...topic,
              daily_views: 0
            }
          }
        })
      )

      this.addLog(`Retrieved ${topicsWithViews.length} topics with view counts`, 'success')
      return topicsWithViews
    } catch (error) {
      this.addLog(`Error getting topics with view counts: ${error.message}`, 'error')
      throw error
    }
  }

  async getViewAnalytics() {
    try {
      this.addLog('Getting view analytics...', 'info')

      // Get total daily views across all topics
      const { data: totalViews, error: totalError } = await supabase
        .from('topic_views')
        .select('view_count')
        .eq('view_date', new Date().toISOString().split('T')[0])

      if (totalError) throw totalError

      const totalDailyViews = totalViews?.reduce((sum, view) => sum + view.view_count, 0) || 0

      // Get top topics by views today
      const { data: topTopics, error: topTopicsError } = await supabase
        .from('topic_views')
        .select(`
          topic_id,
          view_count,
          topics!inner(title, icon, color)
        `)
        .eq('view_date', new Date().toISOString().split('T')[0])
        .order('view_count', { ascending: false })
        .limit(5)

      if (topTopicsError) throw topTopicsError

      // Get view trends for last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: trendData, error: trendError } = await supabase
        .from('topic_views')
        .select('view_date, view_count')
        .gte('view_date', sevenDaysAgo.toISOString().split('T')[0])
        .order('view_date', { ascending: true })

      if (trendError) throw trendError

      // Process trend data
      const dailyTrends = {}
      trendData?.forEach(view => {
        const date = view.view_date
        dailyTrends[date] = (dailyTrends[date] || 0) + view.view_count
      })

      const analytics = {
        totalDailyViews,
        topTopics: topTopics?.map(topic => ({
          id: topic.topic_id,
          title: topic.topics.title,
          icon: topic.topics.icon,
          color: topic.topics.color,
          views: topic.view_count
        })) || [],
        trends: Object.entries(dailyTrends).map(([date, views]) => ({
          date,
          views
        }))
      }

      this.addLog(`Retrieved analytics: ${totalDailyViews} total views today`, 'success')
      return analytics
    } catch (error) {
      this.addLog(`Error getting view analytics: ${error.message}`, 'error')
      throw error
    }
  }

  async getTopicViewHistory(topicId, days = 7) {
    try {
      this.addLog(`Getting view history for topic ${topicId}...`, 'info')

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('topic_views')
        .select('view_date, view_count, user_id')
        .eq('topic_id', topicId)
        .gte('view_date', startDate.toISOString().split('T')[0])
        .order('view_date', { ascending: true })

      if (error) throw error

      // Process data by date
      const dailyData = {}
      data?.forEach(view => {
        const date = view.view_date
        if (!dailyData[date]) {
          dailyData[date] = { date, totalViews: 0, uniqueUsers: new Set() }
        }
        dailyData[date].totalViews += view.view_count
        if (view.user_id) {
          dailyData[date].uniqueUsers.add(view.user_id)
        }
      })

      const history = Object.values(dailyData).map(day => ({
        date: day.date,
        totalViews: day.totalViews,
        uniqueUsers: day.uniqueUsers.size
      }))

      this.addLog(`Retrieved ${history.length} days of history for topic`, 'success')
      return history
    } catch (error) {
      this.addLog(`Error getting topic view history: ${error.message}`, 'error')
      throw error
    }
  }

  // --- AI Content Generation ---
  async generateDailyContentPreview() {
    try {
      this.addLog('🤖 Generating daily content preview with AI...', 'info')

      const aiContent = await aiGenerationService.generateDailyContent()

      this.addLog(`✅ AI generated daily content preview: ${aiContent.verse.reference}`, 'success')
      return aiContent
    } catch (error) {
      this.addLog(`❌ AI generation failed: ${error.message}`, 'error')

      // Fallback to default content
      this.addLog('🔄 Using fallback content...', 'warning')
      const fallbackContent = aiGenerationService.getFallbackContent()

      this.addLog('✅ Fallback content preview created', 'success')
      return fallbackContent
    }
  }

  async saveDailyContent(previewContent) {
    try {
      this.addLog('💾 Saving daily content to database...', 'info')

      const { data, error } = await supabase
        .from('daily_verses')
        .insert([{
          date: new Date().toISOString().split('T')[0],
          verse_text: previewContent.verse.verse_text,
          confession_text: previewContent.confession.confession_text,
          reference: `${previewContent.verse.reference} (${previewContent.verse.translation || 'KJV'})`
        }])
        .select()

      if (error) throw error

      this.addLog(`✅ Daily content saved: ${previewContent.verse.reference}`, 'success')
      return data[0]
    } catch (error) {
      this.addLog(`❌ Error saving daily content: ${error.message}`, 'error')
      throw error
    }
  }

  async generateDailyContentWithAI() {
    try {
      this.addLog('🤖 Generating daily content with AI...', 'info')

      const aiContent = await aiGenerationService.generateDailyContent()

      // Save to database
      const { data, error } = await supabase
        .from('daily_verses')
        .insert([{
          date: new Date().toISOString().split('T')[0],
          verse_text: aiContent.verse.verse_text,
          confession_text: aiContent.confession.confession_text,
          reference: `${aiContent.verse.reference} (${aiContent.verse.translation || 'KJV'})`
        }])
        .select()

      if (error) throw error

      this.addLog(`✅ AI generated daily content: ${aiContent.verse.reference}`, 'success')
      return data[0]
    } catch (error) {
      this.addLog(`❌ AI generation failed: ${error.message}`, 'error')

      // Fallback to default content
      this.addLog('🔄 Using fallback content...', 'warning')
      const fallbackContent = aiGenerationService.getFallbackContent()

      const { data, error: fallbackError } = await supabase
        .from('daily_verses')
        .insert([{
          date: new Date().toISOString().split('T')[0],
          verse_text: fallbackContent.verse.verse_text,
          confession_text: fallbackContent.confession.confession_text,
          reference: `${fallbackContent.verse.reference} (${fallbackContent.verse.translation || 'KJV'})`
        }])
        .select()

      if (fallbackError) throw fallbackError

      this.addLog('✅ Fallback content created successfully', 'success')
      return data[0]
    }
  }

  async generateTopicContentPreview(topicId, contentType = 'both') {
    try {
      this.addLog(`🤖 Generating AI content preview for topic ${topicId}...`, 'info')

      // Get topic details
      const { data: topic, error: topicError } = await supabase
        .from('topics')
        .select('*')
        .eq('id', topicId)
        .single()

      if (topicError) throw topicError

      const results = { verses: [], confessions: [] }

      // Generate verses if requested
      if (contentType === 'verses' || contentType === 'both') {
        try {
          const aiVerses = await aiGenerationService.generateTopicVerses(topic.title, 3)
          results.verses = aiVerses.map(verse => ({
            ...verse,
            book: verse.book,
            chapter: verse.chapter,
            verse: verse.verse,
            translation: 'NIV',
            is_featured: false
          }))

          this.addLog(`✅ Generated ${results.verses.length} AI verses preview for ${topic.title}`, 'success')
        } catch (error) {
          this.addLog(`❌ AI verse generation failed: ${error.message}`, 'error')
        }
      }

      // Generate confessions if requested
      if (contentType === 'confessions' || contentType === 'both') {
        try {
          const aiConfessions = await aiGenerationService.generateTopicConfessions(topic.title, 3)
          results.confessions = aiConfessions.map(confession => ({
            ...confession,
            is_featured: false
          }))

          this.addLog(`✅ Generated ${results.confessions.length} AI confessions preview for ${topic.title}`, 'success')
        } catch (error) {
          this.addLog(`❌ AI confession generation failed: ${error.message}`, 'error')
        }
      }

      return results
    } catch (error) {
      this.addLog(`❌ AI topic content generation failed: ${error.message}`, 'error')
      throw error
    }
  }

  async saveTopicContent(previewContent) {
    try {
      this.addLog('💾 Saving topic content to database...', 'info')

      const results = { verses: [], confessions: [] }

      // Save verses
      if (previewContent.verses && previewContent.verses.length > 0) {
        for (const verseData of previewContent.verses) {
          const { data, error } = await supabase
            .from('topic_verses')
            .insert([{
              topic_id: previewContent.topicId,
              verse_text: verseData.verse_text,
              reference: `${verseData.reference} (${verseData.translation || 'KJV'})`,
              book: verseData.book,
              chapter: verseData.chapter,
              verse: verseData.verse,
              is_featured: verseData.is_featured || false
            }])
            .select()

          if (!error) {
            results.verses.push(data[0])
          }
        }
      }

      // Save confessions
      if (previewContent.confessions && previewContent.confessions.length > 0) {
        for (const confessionData of previewContent.confessions) {
          const { data, error } = await supabase
            .from('topic_confessions')
            .insert([{
              topic_id: previewContent.topicId,
              confession_text: confessionData.confession_text,
              title: confessionData.title,
              is_featured: confessionData.is_featured || false
            }])
            .select()

          if (!error) {
            results.confessions.push(data[0])
          }
        }
      }

      this.addLog(`✅ Topic content saved: ${results.verses.length} verses, ${results.confessions.length} confessions`, 'success')
      return results
    } catch (error) {
      this.addLog(`❌ Error saving topic content: ${error.message}`, 'error')
      throw error
    }
  }

  async generateTopicContentWithAI(topicId, contentType = 'both') {
    try {
      this.addLog(`🤖 Generating AI content for topic ${topicId}...`, 'info')

      // Get topic details
      const { data: topic, error: topicError } = await supabase
        .from('topics')
        .select('*')
        .eq('id', topicId)
        .single()

      if (topicError) throw topicError

      const results = { verses: [], confessions: [], topicId: topicId }

      // Generate verses if requested
      if (contentType === 'verses' || contentType === 'both') {
        try {
          this.addLog(`🎯 Generating verses for topic: "${topic.title}" (ID: ${topicId})`, 'info')
          const aiVerses = await aiGenerationService.generateTopicVerses(topic.title, 3)

          for (const verseData of aiVerses) {
            // Validate required fields
            if (!verseData.book || !verseData.chapter || !verseData.verse) {
              this.addLog(`❌ Skipping verse with missing fields: ${JSON.stringify(verseData)}`, 'error')
              continue
            }

            // Ensure chapter and verse are numbers
            const chapter = parseInt(verseData.chapter)
            const verse = parseInt(verseData.verse)

            if (isNaN(chapter) || isNaN(verse)) {
              this.addLog(`❌ Skipping verse with invalid chapter/verse: ${JSON.stringify(verseData)}`, 'error')
              continue
            }

            // Add to results without saving to database (preview mode)
            results.verses.push({
              verse_text: verseData.verse_text,
              reference: `${verseData.reference} (${verseData.translation || 'KJV'})`,
              book: verseData.book,
              chapter: chapter,
              verse: verse,
              translation: verseData.translation || 'KJV'
            })
          }

          this.addLog(`✅ Generated ${results.verses.length} AI verses for ${topic.title}`, 'success')
        } catch (error) {
          this.addLog(`❌ AI verse generation failed: ${error.message}`, 'error')
        }
      }

      // Generate confessions if requested
      if (contentType === 'confessions' || contentType === 'both') {
        try {
          this.addLog(`🎯 Generating confessions for topic: "${topic.title}" (ID: ${topicId})`, 'info')
          const aiConfessions = await aiGenerationService.generateTopicConfessions(topic.title, 3)

          for (const confessionData of aiConfessions) {
            // Add to results without saving to database (preview mode)
            results.confessions.push({
              confession_text: confessionData.confession_text,
              title: confessionData.title,
              is_featured: false
            })
          }

          this.addLog(`✅ Generated ${results.confessions.length} AI confessions for ${topic.title}`, 'success')
        } catch (error) {
          this.addLog(`❌ AI confession generation failed: ${error.message}`, 'error')
        }
      }

      return results
    } catch (error) {
      this.addLog(`❌ AI topic content generation failed: ${error.message}`, 'error')
      throw error
    }
  }

  async testAIConnection() {
    try {
      this.addLog('🤖 Testing AI connection...', 'info')
      const result = await aiGenerationService.testAIConnection()

      if (result.success) {
        this.addLog('✅ AI connection successful', 'success')
        return { success: true, data: result.data }
      } else {
        this.addLog(`❌ AI connection failed: ${result.error}`, 'error')
        return { success: false, error: result.error }
      }
    } catch (error) {
      this.addLog(`❌ AI test failed: ${error.message}`, 'error')
      return { success: false, error: error.message }
    }
  }

  // Populate Default Topics
  async populateDefaultTopics() {
    try {
      this.addLog('Populating default topics...', 'info')

      const defaultTopics = [
        {
          title: 'Faith',
          description: 'Believe and receive',
          icon: '✨',
          color: '#f59e0b',
          verses: [
            {
              verse_text: 'Now faith is confidence in what we hope for and assurance about what we do not see.',
              reference: 'Hebrews 11:1',
              book: 'Hebrews',
              chapter: 11,
              verse: 1,
              translation: 'NIV'
            }
          ],
          confessions: [
            {
              title: 'Confession of Faith',
              confession_text: 'I confess that I walk by faith and not by sight. I believe in God\'s promises and trust in His perfect plan for my life.'
            }
          ]
        },
        {
          title: 'Peace',
          description: 'God\'s protection',
          icon: '🛡️',
          color: '#3b82f6',
          verses: [
            {
              verse_text: 'And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
              reference: 'Philippians 4:7',
              book: 'Philippians',
              chapter: 4,
              verse: 7,
              translation: 'NIV'
            }
          ],
          confessions: [
            {
              title: 'Confession of Peace',
              confession_text: 'I confess that the peace of God guards my heart and mind. I am not anxious about anything, but in every situation, I present my requests to God.'
            }
          ]
        },
        {
          title: 'Love',
          description: 'Unconditional love',
          icon: '❤️',
          color: '#ef4444',
          verses: [
            {
              verse_text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
              reference: 'John 3:16',
              book: 'John',
              chapter: 3,
              verse: 16,
              translation: 'NIV'
            }
          ],
          confessions: [
            {
              title: 'Confession of Love',
              confession_text: 'I confess that I am loved by God unconditionally. His love for me is perfect and never fails, and I am called to love others as He loves me.'
            }
          ]
        },
        {
          title: 'Wisdom',
          description: 'Divine understanding',
          icon: '💡',
          color: '#f59e0b',
          verses: [
            {
              verse_text: 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.',
              reference: 'James 1:5',
              book: 'James',
              chapter: 1,
              verse: 5,
              translation: 'NIV'
            }
          ],
          confessions: [
            {
              title: 'Confession of Wisdom',
              confession_text: 'I confess that I have the mind of Christ and access to divine wisdom. God gives me understanding and guides my decisions.'
            }
          ]
        },
        {
          title: 'Prosperity',
          description: 'Abundant blessings',
          icon: '💰',
          color: '#10b981',
          verses: [
            {
              verse_text: 'The Lord will open the heavens, the storehouse of his bounty, to send rain on your land in season and to bless all the work of your hands.',
              reference: 'Deuteronomy 28:12',
              book: 'Deuteronomy',
              chapter: 28,
              verse: 12,
              translation: 'NIV'
            }
          ],
          confessions: [
            {
              title: 'Confession of Prosperity',
              confession_text: 'I confess that God supplies all my needs according to His riches in glory. I am blessed to be a blessing to others.'
            }
          ]
        },
        {
          title: 'Relationships',
          description: 'Godly connections',
          icon: '👥',
          color: '#8b5cf6',
          verses: [
            {
              verse_text: 'Two are better than one, because they have a good return for their labor: If either of them falls down, one can help the other up.',
              reference: 'Ecclesiastes 4:9-10',
              book: 'Ecclesiastes',
              chapter: 4,
              verse: 9,
              translation: 'NIV'
            }
          ],
          confessions: [
            {
              title: 'Confession of Relationships',
              confession_text: 'I confess that I am surrounded by godly relationships. God has placed the right people in my life to encourage and support me.'
            }
          ]
        }
      ]

      const results = []
      for (const topicData of defaultTopics) {
        try {
          // Create topic
          const { data: topic, error: topicError } = await supabase
            .from('topics')
            .insert([{
              title: topicData.title,
              description: topicData.description,
              icon: topicData.icon,
              color: topicData.color,
              usage_count: 0,
              popularity_score: 0.0,
              ai_generated: false
            }])
            .select()

          if (topicError) {
            if (topicError.code === '23505') { // Unique constraint violation
              this.addLog(`Topic "${topicData.title}" already exists, skipping...`, 'warning')
              continue
            }
            throw topicError
          }

          const createdTopic = topic[0]
          this.addLog(`Created topic: ${createdTopic.title}`, 'success')

          // Add verses
          for (const verseData of topicData.verses) {
            try {
              await this.addTopicVerse(createdTopic.id, verseData)
            } catch (error) {
              this.addLog(`Error adding verse to ${createdTopic.title}: ${error.message}`, 'error')
            }
          }

          // Add confessions
          for (const confessionData of topicData.confessions) {
            try {
              await this.addTopicConfession(createdTopic.id, confessionData)
            } catch (error) {
              this.addLog(`Error adding confession to ${createdTopic.title}: ${error.message}`, 'error')
            }
          }

          results.push({ success: true, topic: createdTopic.title })
        } catch (error) {
          this.addLog(`Error creating topic ${topicData.title}: ${error.message}`, 'error')
          results.push({ success: false, topic: topicData.title, error: error.message })
        }
      }

      this.addLog(`Default topics population complete: ${results.filter(r => r.success).length}/${results.length} successful`, 'success')
      return results
    } catch (error) {
      this.addLog(`Error populating default topics: ${error.message}`, 'error')
      throw error
    }
  }

  // Test Data Generation
  async generateTestUsers(count = 5) {
    try {
      this.addLog(`Generating ${count} test users...`, 'info')

      // Note: User creation requires admin privileges and cannot be done from client side
      this.addLog('⚠️ User creation requires admin privileges. This feature is not available from the client side.', 'warning')

      const results = []
      for (let i = 1; i <= count; i++) {
        results.push({
          success: false,
          email: `testuser${i}@example.com`,
          error: 'User creation requires admin privileges'
        })
      }

      this.addLog(`Test user generation: 0/${count} successful (requires admin privileges)`, 'warning')
      return results
    } catch (error) {
      this.addLog(`Error generating test users: ${error.message}`, 'error')
      throw error
    }
  }

  async generateTestVerses(count = 7) {
    try {
      this.addLog(`Generating ${count} test verses...`, 'info')

      const testVerses = [
        {
          verse: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
          confession: 'I confess that I am loved by God and have eternal life through Jesus Christ.',
          reference: 'John 3:16'
        },
        {
          verse: 'I can do all this through him who gives me strength.',
          confession: 'I confess that I have strength through Christ to overcome any challenge.',
          reference: 'Philippians 4:13'
        },
        {
          verse: 'The Lord is my shepherd, I lack nothing.',
          confession: 'I confess that the Lord provides for all my needs.',
          reference: 'Psalm 23:1'
        },
        {
          verse: 'Trust in the Lord with all your heart and lean not on your own understanding.',
          confession: 'I confess that I trust in the Lord completely and seek His guidance.',
          reference: 'Proverbs 3:5'
        },
        {
          verse: 'And we know that in all things God works for the good of those who love him.',
          confession: 'I confess that God is working all things for my good.',
          reference: 'Romans 8:28'
        },
        {
          verse: 'Be still, and know that I am God.',
          confession: 'I confess that I find peace in God\'s presence.',
          reference: 'Psalm 46:10'
        },
        {
          verse: 'I have been crucified with Christ and I no longer live, but Christ lives in me.',
          confession: 'I confess that I live by faith in the Son of God who loved me.',
          reference: 'Galatians 2:20'
        }
      ]

      const results = []
      for (let i = 0; i < count; i++) {
        const verse = testVerses[i % testVerses.length]
        const date = new Date()
        date.setDate(date.getDate() + i)

        try {
          const { data, error } = await supabase
            .from('daily_verses')
            .insert({
              date: date.toISOString().split('T')[0],
              verse_text: verse.verse,
              confession_text: verse.confession,
              reference: verse.reference
            })

          if (error) throw error
          results.push({ success: true, date: date.toISOString().split('T')[0] })
          this.addLog(`Created test verse for ${date.toISOString().split('T')[0]}`, 'success')
        } catch (error) {
          results.push({ success: false, date: date.toISOString().split('T')[0], error: error.message })
          this.addLog(`Failed to create verse for ${date.toISOString().split('T')[0]}: ${error.message}`, 'error')
        }
      }

      this.addLog(`Test verse generation complete: ${results.filter(r => r.success).length}/${count} successful`, 'success')
      return results
    } catch (error) {
      this.addLog(`Error generating test verses: ${error.message}`, 'error')
      throw error
    }
  }

  // Note: generateTestConfessions removed for privacy - user confession journals are private

  // System Health Monitoring
  async checkSystemHealth() {
    try {
      this.addLog('Checking system health...', 'info')

      const health = {
        database: await this.checkDatabaseHealth(),
        cache: await this.checkCacheHealth(),
        api: await this.checkApiHealth(),
        timestamp: new Date().toISOString()
      }

      const overallHealth = Object.values(health).every(check =>
        typeof check === 'object' ? check.status === 'healthy' : true
      ) ? 'healthy' : 'unhealthy'

      this.addLog(`System health check complete: ${overallHealth}`, overallHealth === 'healthy' ? 'success' : 'warning')
      return { ...health, overall: overallHealth }
    } catch (error) {
      this.addLog(`Error checking system health: ${error.message}`, 'error')
      throw error
    }
  }

  async checkDatabaseHealth() {
    try {
      const { data, error } = await supabase
        .from('daily_verses')
        .select('count')
        .limit(1)

      if (error) throw error

      return { status: 'healthy', responseTime: Date.now() }
    } catch (error) {
      return { status: 'unhealthy', error: error.message }
    }
  }

  async checkCacheHealth() {
    try {
      const cacheInfo = this.getCacheInfo()
      const isHealthy = cacheInfo.localStorage.size < 1000 // Arbitrary limit

      return {
        status: isHealthy ? 'healthy' : 'warning',
        size: cacheInfo.localStorage.size,
        totalSize: cacheInfo.localStorage.totalSize
      }
    } catch (error) {
      return { status: 'unhealthy', error: error.message }
    }
  }

  async checkApiHealth() {
    try {
      // Check if we can make a simple API call
      const { data, error } = await supabase
        .from('daily_verses')
        .select('id')
        .limit(1)

      if (error) throw error

      return { status: 'healthy', responseTime: Date.now() }
    } catch (error) {
      return { status: 'unhealthy', error: error.message }
    }
  }

  // Utility Methods
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  formatDate(date) {
    return new Date(date).toLocaleString()
  }

  getLogStats() {
    const stats = {
      total: this.logs.length,
      byType: {},
      last24Hours: 0
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    this.logs.forEach(log => {
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1
      if (new Date(log.timestamp) > oneDayAgo) {
        stats.last24Hours++
      }
    })

    return stats
  }

  // Get all existing verses to check for duplicates
  async getAllExistingVerses() {
    try {
      this.addLog('Fetching existing verses for duplicate check...', 'info')

      const { data: dailyVerses, error: dailyError } = await supabase
        .from('daily_verses')
        .select('verse_text, reference')

      if (dailyError) throw dailyError

      const { data: topicVerses, error: topicError } = await supabase
        .from('topic_verses')
        .select('verse_text, reference, book, chapter, verse')

      if (topicError) throw topicError

      const allVerses = [...(dailyVerses || []), ...(topicVerses || [])]
      this.addLog(`Found ${allVerses.length} existing verses`, 'info')
      return allVerses
    } catch (error) {
      this.addLog(`Error fetching existing verses: ${error.message}`, 'error')
      return []
    }
  }

  // Get all existing confessions to check for duplicates
  async getAllExistingConfessions() {
    try {
      this.addLog('Fetching existing confessions for duplicate check...', 'info')

      const { data: topicConfessions, error: topicError } = await supabase
        .from('topic_confessions')
        .select('title, confession_text')

      if (topicError) throw topicError

      this.addLog(`Found ${topicConfessions?.length || 0} existing confessions`, 'info')
      return topicConfessions || []
    } catch (error) {
      this.addLog(`Error fetching existing confessions: ${error.message}`, 'error')
      return []
    }
  }

  // Track topic usage (increment view count)
  async trackTopicUsage(topicId) {
    try {
      this.addLog(`Tracking usage for topic ${topicId}...`, 'info')

      const { data, error } = await supabase
        .from('topics')
        .select('usage_count')
        .eq('id', topicId)
        .single()

      if (error) throw error

      const currentCount = data?.usage_count || 0
      const newCount = currentCount + 1

      const { error: updateError } = await supabase
        .from('topics')
        .update({ usage_count: newCount })
        .eq('id', topicId)

      if (updateError) throw updateError

      this.addLog(`Topic usage updated: ${newCount} views`, 'success')
      return newCount
    } catch (error) {
      this.addLog(`Error tracking topic usage: ${error.message}`, 'error')
      throw error
    }
  }

  // Get content counts for a specific topic
  async getTopicContentCounts(topicId) {
    try {
      this.addLog(`Getting content counts for topic ${topicId}...`, 'info')

      const [
        { count: verseCount },
        { count: confessionCount }
      ] = await Promise.all([
        supabase.from('topic_verses').select('*', { count: 'exact', head: true }).eq('topic_id', topicId),
        supabase.from('topic_confessions').select('*', { count: 'exact', head: true }).eq('topic_id', topicId)
      ])

      const counts = {
        verses: verseCount || 0,
        confessions: confessionCount || 0,
        total: (verseCount || 0) + (confessionCount || 0)
      }

      this.addLog(`Topic ${topicId} content: ${counts.verses} verses, ${counts.confessions} confessions`, 'info')
      return counts
    } catch (error) {
      this.addLog(`Error getting topic content counts: ${error.message}`, 'error')
      return { verses: 0, confessions: 0, total: 0 }
    }
  }

  // Get content counts for all topics
  async getAllTopicsWithCounts() {
    try {
      this.addLog('Getting all topics with content counts...', 'info')

      const { data: topics, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .order('created_at', { ascending: false })

      if (topicsError) throw topicsError

      // Get counts for each topic
      const topicsWithCounts = await Promise.all(
        topics.map(async (topic) => {
          const counts = await this.getTopicContentCounts(topic.id)
          return {
            ...topic,
            verse_count: counts.verses,
            confession_count: counts.confessions,
            total_content: counts.total
          }
        })
      )

      this.addLog(`Loaded ${topicsWithCounts.length} topics with content counts`, 'success')
      return topicsWithCounts
    } catch (error) {
      this.addLog(`Error getting topics with counts: ${error.message}`, 'error')
      return []
    }
  }

  // User Management Functions
  async getAllUsers() {
    try {
      this.addLog('Fetching all users...', 'info')

      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          avatar_url,
          created_at,
          updated_at,
          streak_count,
          total_confessions,
          spiritual_maturity_level,
          confession_style,
          preferred_ai_model,
          ai_interaction_count,
          ai_satisfaction_score,
          last_ai_interaction,
          spiritual_focus,
          timezone,
          ai_preferences,
          last_confession_date,
          preferred_confession_times,
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      this.addLog(`Loaded ${users?.length || 0} users`, 'success')
      return users || []
    } catch (error) {
      this.addLog(`Error fetching users: ${error.message}`, 'error')
      return []
    }
  }

  async getUserStats() {
    try {
      this.addLog('Getting user statistics...', 'info')

      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          created_at,
          updated_at,
          last_confession_date,
          total_confessions,
          streak_count
        `)

      if (error) throw error

      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      // Simple active users based on recent confession activity
      const activeUsers = users?.filter(u => {
        return u.last_confession_date && new Date(u.last_confession_date) > oneDayAgo;
      }) || []

      const stats = {
        totalUsers: users?.length || 0,
        activeUsers: activeUsers.length,
        newUsersToday: users?.filter(u => new Date(u.created_at) > oneDayAgo).length || 0,
        newUsersThisWeek: users?.filter(u => new Date(u.created_at) > oneWeekAgo).length || 0,
        newUsersThisMonth: users?.filter(u => new Date(u.created_at) > oneMonthAgo).length || 0,
        totalConfessions: users?.reduce((sum, u) => sum + (u.total_confessions || 0), 0) || 0,
        totalStreaks: users?.reduce((sum, u) => sum + (u.streak_count || 0), 0) || 0,
        avgStreak: users?.length > 0 ? users.reduce((sum, u) => sum + (u.streak_count || 0), 0) / users.length : 0
      }

      this.addLog(`User stats: ${stats.totalUsers} total, ${stats.activeUsers} active`, 'success')
      return stats
    } catch (error) {
      this.addLog(`Error getting user stats: ${error.message}`, 'error')
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsersToday: 0,
        newUsersThisWeek: 0,
        newUsersThisMonth: 0,
        totalConfessions: 0,
        totalStreaks: 0,
        avgStreak: 0
      }
    }
  }

  async updateUserStatus(userId, updates) {
    try {
      this.addLog(`Updating user ${userId}...`, 'info')

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()

      if (error) throw error

      this.addLog(`User ${userId} updated successfully`, 'success')
      return data[0]
    } catch (error) {
      this.addLog(`Error updating user: ${error.message}`, 'error')
      throw error
    }
  }

  async deleteUser(userId) {
    try {
      this.addLog(`Soft deleting user ${userId}...`, 'warning')

      // Soft delete by setting deleted_at timestamp
      const { data, error } = await supabase
        .from('users')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', userId)
        .select()

      if (error) throw error

      this.addLog(`User ${userId} soft deleted successfully`, 'success')
      return data[0]
    } catch (error) {
      this.addLog(`Error deleting user: ${error.message}`, 'error')
      throw error
    }
  }

  // Get the next available date for daily content
  async getNextAvailableDate() {
    try {
      const { data, error } = await supabase
        .from('daily_verses')
        .select('date')
        .order('date', { ascending: false })
        .limit(1)

      if (error) throw error

      if (data && data.length > 0) {
        const lastDate = new Date(data[0].date)
        const nextDate = new Date(lastDate)
        nextDate.setDate(lastDate.getDate() + 1)
        return nextDate.toISOString().split('T')[0]
      }

      // If no content exists, return today
      return new Date().toISOString().split('T')[0]
    } catch (error) {
      console.error('Error getting next available date:', error)
      return new Date().toISOString().split('T')[0]
    }
  }

  // Generate daily content with AI
  async generateDailyContent() {
    try {
      this.addLog('Starting AI content generation...', 'info')

      // Get the next available date
      const targetDate = await this.getNextAvailableDate()
      this.addLog(`Generating content for date: ${targetDate}`, 'info')

      const aiContent = await aiGenerationService.generateDailyContent()

      if (aiContent && aiContent.verse && aiContent.confession) {
        // Check for duplicates before saving
        this.addLog('Checking for duplicate content...', 'info')

        const verseText = aiContent.verse.verse_text || aiContent.verse.text || ''
        const confessionText = aiContent.confession.confession_text || aiContent.confession.text || ''

        // Check if verse already exists
        const { data: existingVerses, error: verseError } = await supabase
          .from('daily_verses')
          .select('verse_text')
          .eq('verse_text', verseText)

        if (verseError) {
          console.error('Error checking verse duplicates:', verseError)
        } else if (existingVerses && existingVerses.length > 0) {
          this.addLog('Duplicate verse detected, using fallback content', 'warning')
          const fallbackContent = this.getFallbackDailyContent()
          const contentData = {
            date: targetDate,
            verse_text: fallbackContent.verse_text,
            reference: fallbackContent.reference,
            confession_text: fallbackContent.confession_text,
            translation: fallbackContent.translation
          }
          await this.createDailyContent(contentData)
          this.addLog('Fallback content saved successfully', 'success')
          return contentData
        }

        // Check if confession already exists
        const { data: existingConfessions, error: confessionError } = await supabase
          .from('daily_verses')
          .select('confession_text')
          .eq('confession_text', confessionText)

        if (confessionError) {
          console.error('Error checking confession duplicates:', confessionError)
        } else if (existingConfessions && existingConfessions.length > 0) {
          this.addLog('Duplicate confession detected, using fallback content', 'warning')
          const fallbackContent = this.getFallbackDailyContent()
          const contentData = {
            date: targetDate,
            verse_text: fallbackContent.verse_text,
            reference: fallbackContent.reference,
            confession_text: fallbackContent.confession_text,
            translation: fallbackContent.translation
          }
          await this.createDailyContent(contentData)
          this.addLog('Fallback content saved successfully', 'success')
          return contentData
        }

        // No duplicates found, save the generated content
        const contentData = {
          date: targetDate,
          verse_text: verseText,
          reference: aiContent.verse.reference || '',
          confession_text: confessionText,
          translation: aiContent.verse.translation || 'KJV'
        }

        // Validate required fields
        if (!contentData.verse_text || !contentData.reference) {
          throw new Error('AI generated content is missing required fields (verse_text or reference)')
        }

        await this.createDailyContent(contentData)
        this.addLog('AI content generated and saved successfully', 'success')
        return contentData
      } else {
        console.error('❌ AI content structure issue:', aiContent)
        this.addLog('AI generation failed, using fallback content', 'warning')

        // Use fallback content
        const fallbackContent = this.getFallbackDailyContent()
        const contentData = {
          date: targetDate,
          verse_text: fallbackContent.verse_text,
          reference: fallbackContent.reference,
          confession_text: fallbackContent.confession_text,
          translation: fallbackContent.translation
        }

        await this.createDailyContent(contentData)
        this.addLog('Fallback content saved successfully', 'success')
        return contentData
      }
    } catch (error) {
      this.addLog(`Error generating daily content: ${error.message}`, 'error')

      // Try fallback content as last resort
      try {
        this.addLog('Attempting fallback content generation', 'info')
        const targetDate = await this.getNextAvailableDate()
        const fallbackContent = this.getFallbackDailyContent()
        const contentData = {
          date: targetDate,
          verse_text: fallbackContent.verse_text,
          reference: fallbackContent.reference,
          confession_text: fallbackContent.confession_text,
          translation: fallbackContent.translation
        }

        await this.createDailyContent(contentData)
        this.addLog('Fallback content saved successfully', 'success')
        return contentData
      } catch (fallbackError) {
        this.addLog(`Fallback content also failed: ${fallbackError.message}`, 'error')
        throw error
      }
    }
  }

  // Fallback content when AI generation fails
  getFallbackDailyContent() {
    const fallbackVerses = [
      {
        verse_text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
        reference: "Jeremiah 29:11",
        translation: "NIV"
      },
      {
        verse_text: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.",
        reference: "Isaiah 40:31",
        translation: "KJV"
      },
      {
        verse_text: "I can do all things through Christ who strengthens me.",
        reference: "Philippians 4:13",
        translation: "NKJV"
      },
      {
        verse_text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
        reference: "Romans 8:28",
        translation: "KJV"
      },
      {
        verse_text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
        reference: "Proverbs 3:5-6",
        translation: "NIV"
      }
    ]

    const fallbackConfessions = [
      "I declare that God's plans for me are good, and I walk in His perfect will for my life.",
      "I confess that I am strengthened by the Lord and I soar above every challenge.",
      "I believe that through Christ, I can accomplish all things according to His purpose.",
      "I declare that all things are working together for my good because I love God.",
      "I confess that I trust in the Lord completely and He directs my paths."
    ]

    const randomVerse = fallbackVerses[Math.floor(Math.random() * fallbackVerses.length)]
    const randomConfession = fallbackConfessions[Math.floor(Math.random() * fallbackConfessions.length)]

    return {
      verse_text: randomVerse.verse_text,
      reference: randomVerse.reference,
      confession_text: randomConfession,
      translation: randomVerse.translation
    }
  }
}

// Create singleton instance
const adminService = new AdminService()

export default adminService
