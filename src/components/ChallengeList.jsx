import React, { useState, useEffect } from 'react'
import { challengeService } from '../services/challengeService'
import { Calendar, ArrowRight, CheckCircle, Lock, Play, Trophy, Users } from 'lucide-react'

const ChallengeList = ({ onSelectChallenge }) => {
    const [challenges, setChallenges] = useState([])
    const [userProgress, setUserProgress] = useState({})
    const [participantCounts, setParticipantCounts] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [allChallenges, myChallenges] = await Promise.all([
                challengeService.getPublishedChallenges(),
                challengeService.getUserChallenges()
            ])

            // Create a map of progress for easy lookup
            const progressMap = {}
            myChallenges.forEach(c => {
                progressMap[c.challenge_id] = c
            })

            // Fetch participant counts
            const counts = await challengeService.getParticipantCounts()
            const countsMap = {}
            if (counts) {
                counts.forEach(c => {
                    countsMap[c.challenge_id] = c.count
                })
            }

            setChallenges(allChallenges)
            setUserProgress(progressMap)
            setParticipantCounts(countsMap)
        } catch (error) {
            console.error('Error loading challenges:', error)
        } finally {
            setLoading(false)
        }
    }

    const [joiningId, setJoiningId] = useState(null)

    const handleJoin = async (challengeId) => {
        try {
            setJoiningId(challengeId)

            // Optimistic Update: Immediately show as joined in UI
            setUserProgress(prev => ({
                ...prev,
                [challengeId]: {
                    challenge_id: challengeId,
                    current_day: 1,
                    is_completed: false
                }
            }))

            await challengeService.joinChallenge(challengeId)

            // Background refresh to ensure data consistency
            loadData()
        } catch (error) {
            console.error('Error joining challenge:', error)
            // Revert optimistic update on error (optional, or just show toast)
            loadData()
        } finally {
            setJoiningId(null)
        }
    }

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 bg-gray-100 rounded-2xl"></div>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Spiritual Bootcamps</h2>
                    <p className="text-gray-500">Short-term challenges to build long-term habits.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map(challenge => {
                    const progress = userProgress[challenge.id]
                    const isJoined = !!progress
                    const isCompleted = progress?.is_completed

                    return (
                        <div key={challenge.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                            {/* Cover Area */}
                            <div className="h-40 bg-gradient-to-br from-purple-600 to-indigo-700 relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/10" />
                                <div className="absolute bottom-0 left-0 p-6">
                                    <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-lg mb-2 inline-block border border-white/10">
                                        {challenge.category || 'General'}
                                    </span>
                                    <h3 className="text-xl font-bold text-white leading-tight">{challenge.title}</h3>
                                </div>
                                {/* Badge Icon */}
                                <div className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
                                    <Trophy size={18} className="text-yellow-300" />
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {challenge.duration_days} Days
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users size={14} />
                                        {participantCounts[challenge.id] || 0} Joined
                                    </span>
                                    {isJoined && (
                                        <span className="flex items-center gap-1 text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                                            <CheckCircle size={12} />
                                            {isCompleted ? 'Completed' : `Day ${progress.current_day}`}
                                        </span>
                                    )}
                                </div>

                                <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-1">
                                    {challenge.description || "Embark on a journey of spiritual growth with this guided challenge."}
                                </p>

                                {isJoined ? (
                                    <button
                                        onClick={() => onSelectChallenge(challenge.id)}
                                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isCompleted ? 'Review Journey' : 'Continue Journey'}
                                        <ArrowRight size={18} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleJoin(challenge.id)}
                                        disabled={joiningId === challenge.id}
                                        className="w-full py-3 bg-purple-50 text-purple-700 rounded-xl font-bold hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {joiningId === challenge.id ? (
                                            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Join Challenge
                                                <PlusIcon />
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {challenges.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-500 font-medium">No challenges available yet.</p>
                    <p className="text-sm text-gray-400">Check back soon for new bootcamps!</p>
                </div>
            )}
        </div>
    )
}

const PlusIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
)

export default ChallengeList
