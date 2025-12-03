import { supabase } from '../supabaseClient'

export const badgeService = {
    /**
     * Get all available badges
     */
    async getAllBadges() {
        const { data, error } = await supabase
            .from('badges')
            .select('*')
            .order('name')

        if (error) throw error
        return data
    },

    /**
     * Get badges earned by a user
     */
    async getUserBadges(userId) {
        const { data, error } = await supabase
            .from('user_badges')
            .select(`
                *,
                badge:badges(*)
            `)
            .eq('user_id', userId)

        if (error) throw error
        return data.map(ub => ({
            ...ub.badge,
            awarded_at: ub.awarded_at
        }))
    },

    /**
     * Award a badge to a user if they don't have it yet
     * Returns the badge if newly awarded, null otherwise
     */
    async awardBadge(badgeName) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        // 1. Find the badge ID
        const { data: badge, error: badgeError } = await supabase
            .from('badges')
            .select('id, name, icon_name, description')
            .eq('name', badgeName)
            .maybeSingle()

        if (badgeError || !badge) {
            console.warn(`Badge '${badgeName}' not found or error:`, badgeError)
            return null
        }

        // 2. Award it safely using upsert (idempotent)
        const { data, error } = await supabase
            .from('user_badges')
            .upsert(
                { user_id: user.id, badge_id: badge.id },
                { onConflict: 'user_id, badge_id', ignoreDuplicates: true }
            )
            .select()
            .maybeSingle()

        if (error) {
            console.error('Error awarding badge:', error)
            return null
        }

        // If data is null, it means it was a duplicate (ignored), so we return null (no new badge)
        // If data is present, it's a new badge
        return data ? badge : null
    },

    /**
     * Check for badges related to completing a challenge day
     */
    async checkChallengeDayCompletion() {
        // For MVP, we'll just try to award "First Step"
        // In a real app, we'd check counts, streaks, etc.
        return await this.awardBadge('First Step')
    },

    /**
     * Check for badges related to completing a full challenge
     * Awards a specific badge for the completed challenge
     */
    async checkChallengeCompletion(challengeTitle) {
        // 1. Award the generic "Challenge Champion" badge (first time only)
        await this.awardBadge('Challenge Champion')

        // 2. Award the specific badge for this challenge
        const specificBadgeName = `Completed: ${challengeTitle}`

        // Try to find or create the specific badge
        let { data: badge } = await supabase
            .from('badges')
            .select('id, name, icon_name, description')
            .eq('name', specificBadgeName)
            .maybeSingle()

        if (!badge) {
            // Create it on the fly if it doesn't exist
            const { data: newBadge, error: createError } = await supabase
                .from('badges')
                .insert({
                    name: specificBadgeName,
                    description: `Completed the "${challengeTitle}" bootcamp.`,
                    icon_name: 'Trophy',
                    category: 'Challenge',
                    criteria: { type: 'specific_challenge_complete', challenge_title: challengeTitle }
                })
                .select()
                .single()

            if (!createError) {
                badge = newBadge
            } else {
                console.error('Error creating specific challenge badge:', createError)
            }
        }

        if (badge) {
            return await this.awardBadge(badge.name)
        }

        return null
    }
}
