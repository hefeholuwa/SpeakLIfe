import { supabase } from '../supabaseClient.jsx'

class UserService {
  constructor() {
    this.supabase = supabase
  }

  // Get current user profile
  async getCurrentUserProfile() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        throw new Error('No authenticated user')
      }

      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('[USER ERROR] Error fetching user profile:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('[USER ERROR] Error in getCurrentUserProfile:', error)
      throw error
    }
  }

  // Update user profile
  async updateUserProfile(updates) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        throw new Error('No authenticated user')
      }

      const { data, error } = await this.supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('[USER ERROR] Error updating user profile:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('[USER ERROR] Error in updateUserProfile:', error)
      throw error
    }
  }

  // Update user activity
  async updateUserActivity(activityType, metadata = {}) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        throw new Error('No authenticated user')
      }

      const updateData = {
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Update specific activity tracking based on type
      switch (activityType) {
        case 'bible_reading':
          updateData.last_bible_reading_at = new Date().toISOString()
          updateData.total_bible_reading_time = (metadata.timeSpent || 0) + (metadata.currentTime || 0)
          break
        case 'topic_view':
          updateData.last_topic_viewed_at = new Date().toISOString()
          updateData.total_topic_views = (metadata.currentViews || 0) + 1
          break
        case 'daily_verse_view':
          updateData.last_daily_verse_viewed_at = new Date().toISOString()
          updateData.total_daily_verse_views = (metadata.currentViews || 0) + 1
          break
        case 'reading_plan':
          updateData.last_reading_plan_activity_at = new Date().toISOString()
          updateData.total_reading_plan_sessions = (metadata.currentSessions || 0) + 1
          break
        case 'confession':
          updateData.total_confessions = (metadata.currentConfessions || 0) + 1
          updateData.last_confession_date = new Date().toISOString()
          break
        case 'login':
          updateData.last_login_at = new Date().toISOString()
          updateData.login_count = (metadata.currentLoginCount || 0) + 1
          updateData.is_online = true
          break
        case 'logout':
          updateData.is_online = false
          updateData.total_session_time = (metadata.currentSessionTime || 0) + (metadata.sessionDuration || 0)
          break
      }

      // Update daily/weekly/monthly activity counts
      const today = new Date().toISOString().split('T')[0]
      const currentWeek = this.getWeekNumber(new Date())
      const currentMonth = new Date().getMonth() + 1

      updateData.daily_activity_count = (metadata.dailyCount || 0) + 1
      updateData.weekly_activity_count = (metadata.weeklyCount || 0) + 1
      updateData.monthly_activity_count = (metadata.monthlyCount || 0) + 1

      const { data, error } = await this.supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('[USER ERROR] Error updating user activity:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('[USER ERROR] Error in updateUserActivity:', error)
      throw error
    }
  }

  // Get user engagement score
  async calculateEngagementScore() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        throw new Error('No authenticated user')
      }

      const { data: userData, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        throw error
      }

      // Calculate engagement score based on various factors
      let score = 0
      const maxScore = 100

      // Activity frequency (30 points)
      const daysSinceCreation = Math.max(1, (new Date() - new Date(userData.created_at)) / (1000 * 60 * 60 * 24))
      const dailyActivityRate = userData.daily_activity_count / daysSinceCreation
      score += Math.min(30, dailyActivityRate * 10)

      // Feature usage (40 points)
      const featureScore = 
        (userData.total_bible_reading_time > 0 ? 10 : 0) +
        (userData.total_topic_views > 0 ? 10 : 0) +
        (userData.total_daily_verse_views > 0 ? 10 : 0) +
        (userData.total_confessions > 0 ? 10 : 0)
      score += featureScore

      // Consistency (30 points)
      const streakBonus = Math.min(15, userData.streak_count * 2)
      const loginBonus = Math.min(15, Math.log(userData.login_count + 1) * 5)
      score += streakBonus + loginBonus

      const engagementScore = Math.min(1.0, score / maxScore)

      // Update engagement score
      await this.supabase
        .from('users')
        .update({
          engagement_score: engagementScore,
          last_engagement_calculation_at: new Date().toISOString()
        })
        .eq('id', user.id)

      return engagementScore
    } catch (error) {
      console.error('[USER ERROR] Error calculating engagement score:', error)
      throw error
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        throw new Error('No authenticated user')
      }

      const { data, error } = await this.supabase
        .from('users')
        .select(`
          *,
          user_confessions(count),
          bible_bookmarks(count),
          bible_highlights(count),
          confession_journal(count)
        `)
        .eq('id', user.id)
        .single()

      if (error) {
        throw error
      }

      return {
        profile: data,
        stats: {
          totalConfessions: data.user_confessions?.[0]?.count || 0,
          totalBookmarks: data.bible_bookmarks?.[0]?.count || 0,
          totalHighlights: data.bible_highlights?.[0]?.count || 0,
          totalJournalEntries: data.confession_journal?.[0]?.count || 0,
          engagementScore: data.engagement_score || 0,
          streakCount: data.streak_count || 0,
          loginCount: data.login_count || 0
        }
      }
    } catch (error) {
      console.error('[USER ERROR] Error getting user stats:', error)
      throw error
    }
  }

  // Update user preferences
  async updateUserPreferences(preferences) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        throw new Error('No authenticated user')
      }

      const { data, error } = await this.supabase
        .from('users')
        .update({
          ai_preferences: preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('[USER ERROR] Error updating user preferences:', error)
      throw error
    }
  }

  // Helper function to get week number
  getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  // Create user profile if it doesn't exist (fallback)
  async createUserProfile(userData) {
    try {
      // Use the new simple function instead of direct insert
      const { data, error } = await this.supabase.rpc('create_user_profile', {
        user_id: userData.id,
        user_email: userData.email,
        user_metadata: userData.user_metadata || {}
      })

      if (error) {
        console.error('[USER ERROR] Error creating user profile:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('[USER ERROR] Error in createUserProfile:', error)
      throw error
    }
  }
}

export default new UserService()
