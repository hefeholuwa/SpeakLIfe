import { supabase } from '../supabaseClient.jsx'

export const challengeService = {
    // --- Public / User Methods ---

    /**
     * Fetch all published challenges
     */
    async getPublishedChallenges() {
        const { data, error } = await supabase
            .from('challenges')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    /**
     * Get participant counts for all challenges
     */
    async getParticipantCounts() {
        const { data, error } = await supabase.rpc('get_challenge_participant_counts')
        if (error) {
            console.error('Error fetching participant counts:', error)
            return []
        }
        return data
    },

    /**
     * Fetch ALL challenges (Admin only)
     */
    async getAllChallenges() {
        const { data, error } = await supabase
            .from('challenges')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    /**
     * Get details for a specific challenge, including its days
     */
    async getChallengeById(challengeId) {
        const { data, error } = await supabase
            .from('challenges')
            .select(`
        *,
        challenge_days (
          id,
          day_number,
          topic,
          content
        )
      `)
            .eq('id', challengeId)
            .single()

        if (error) throw error

        // Sort days by day_number
        if (data.challenge_days) {
            data.challenge_days.sort((a, b) => a.day_number - b.day_number)
        }

        return data
    },

    /**
     * Get a user's progress for a specific challenge
     */
    async getUserProgress(challengeId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data, error } = await supabase
            .from('user_challenges')
            .select('*')
            .eq('user_id', user.id)
            .eq('challenge_id', challengeId)
            .maybeSingle()

        if (error) throw error
        return data
    },

    /**
     * Get all challenges a user has joined
     */
    async getUserChallenges() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const { data, error } = await supabase
            .from('user_challenges')
            .select(`
        *,
        challenges (
          title,
          duration_days,
          cover_image_url,
          badge_icon
        )
      `)
            .eq('user_id', user.id)

        if (error) throw error
        return data
    },

    /**
     * Join a challenge
     */
    async joinChallenge(challengeId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('user_challenges')
            .insert([
                { user_id: user.id, challenge_id: challengeId, current_day: 1 }
            ])
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Mark a day as complete and unlock the next day
     */
    async completeDay(challengeId, dayNumber) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        // 1. Get current progress
        const { data: progress, error: fetchError } = await supabase
            .from('user_challenges')
            .select('*')
            .eq('user_id', user.id)
            .eq('challenge_id', challengeId)
            .single()

        if (fetchError) throw fetchError

        // 2. Calculate updates
        const updates = {
            last_completed_at: new Date().toISOString()
        }

        // Only advance current_day if they just finished their current day
        // (Prevent double-advancing if they replay an old day)
        if (progress.current_day === dayNumber) {
            // Check if this was the last day
            const { data: challenge } = await supabase
                .from('challenges')
                .select('duration_days')
                .eq('id', challengeId)
                .single()

            if (challenge && dayNumber >= challenge.duration_days) {
                updates.is_completed = true
                updates.current_day = challenge.duration_days // Stay on max
            } else {
                updates.current_day = dayNumber + 1
            }
        }

        // 3. Update record
        const { data, error } = await supabase
            .from('user_challenges')
            .update(updates)
            .eq('id', progress.id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // --- Admin Methods ---

    /**
     * Create a new challenge container
     */
    async createChallenge(challengeData) {
        const { data, error } = await supabase
            .from('challenges')
            .insert([challengeData])
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Add a day's content to a challenge
     */
    async addChallengeDay(dayData) {
        const { data, error } = await supabase
            .from('challenge_days')
            .insert([dayData])
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Update a challenge
     */
    async updateChallenge(id, updates) {
        const { data, error } = await supabase
            .from('challenges')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Delete a challenge
     */
    async deleteChallenge(id) {
        const { error } = await supabase
            .from('challenges')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }
}
