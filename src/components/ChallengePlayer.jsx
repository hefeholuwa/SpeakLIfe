import React, { useState, useEffect } from 'react'
import { challengeService } from '../services/challengeService'
import { ArrowLeft, CheckCircle, Lock, Play, Star, Calendar, ArrowRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { badgeService } from '../services/badgeService'
import { toast } from 'sonner'

const ChallengePlayer = ({ challengeId, onBack }) => {
    const [challenge, setChallenge] = useState(null)
    const [progress, setProgress] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeDay, setActiveDay] = useState(null) // The day object currently being viewed/played

    useEffect(() => {
        loadData()
    }, [challengeId])

    const loadData = async () => {
        try {
            setLoading(true)
            const [details, userProg] = await Promise.all([
                challengeService.getChallengeById(challengeId),
                challengeService.getUserProgress(challengeId)
            ])
            setChallenge(details)
            setProgress(userProg)
        } catch (error) {
            console.error('Error loading challenge details:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDayClick = (day) => {
        // Only allow clicking if unlocked
        if (day.day_number <= progress.current_day || progress.is_completed) {
            setActiveDay(day)
        }
    }

    const handleCompleteDay = async () => {
        // Optimistic update
        const previousProgress = { ...progress }
        const isLastDay = activeDay.day_number >= challenge.duration_days

        // Calculate new state locally
        const newProgress = {
            ...progress,
            current_day: isLastDay ? progress.current_day : activeDay.day_number + 1,
            is_completed: isLastDay ? true : progress.is_completed,
            last_completed_at: new Date().toISOString()
        }

        // Apply updates immediately
        setProgress(newProgress)
        setActiveDay(null)

        try {
            await challengeService.completeDay(challengeId, activeDay.day_number)

            // Check for badges
            const newBadge = await badgeService.checkChallengeDayCompletion()
            if (newBadge) {
                toast.success(
                    <div className="flex flex-col gap-1">
                        <span className="font-bold text-lg">Badge Unlocked! 🏆</span>
                        <span>You earned the "{newBadge.name}" badge!</span>
                    </div>,
                    { duration: 5000 }
                )
            }

            // Sync with server to ensure consistency
            const serverProgress = await challengeService.getUserProgress(challengeId)
            setProgress(serverProgress)

            // Check for full completion badge
            if (isLastDay) {
                const completionBadge = await badgeService.checkChallengeCompletion(challenge.title)
                if (completionBadge) {
                    setTimeout(() => {
                        toast.success(
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-lg">Challenge Champion! 🌟</span>
                                <span>You earned the "{completionBadge.name}" badge!</span>
                            </div>,
                            { duration: 5000 }
                        )
                    }, 2000) // Delay slightly so it doesn't overlap too much
                }
            }

        } catch (error) {
            console.error('Error completing day:', error)
            // Revert on error
            setProgress(previousProgress)
            alert('Failed to save progress. Please check your connection.')
        }
    }

    if (loading) return <div className="p-12 text-center">Loading your journey...</div>
    if (!challenge) return <div className="p-12 text-center">Challenge not found</div>

    // If a day is active, show the content player
    if (activeDay) {
        return (
            <div className="max-w-3xl mx-auto">
                <button onClick={() => setActiveDay(null)} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft size={20} />
                    Back to Timeline
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-purple-600 p-8 text-white text-center">
                        <h2 className="text-2xl font-bold mb-2">Day {activeDay.day_number}</h2>
                        <p className="opacity-90 text-lg">{activeDay.topic}</p>
                    </div>

                    <div className="p-8 md:p-12 space-y-8">
                        {/* Content Display */}
                        <div className="prose prose-lg mx-auto text-gray-700">
                            {activeDay.content?.text ? (
                                <div className="whitespace-pre-wrap font-serif text-xl leading-relaxed">
                                    <ReactMarkdown>
                                        {activeDay.content.text}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No content for this day yet.</p>
                            )}
                        </div>

                        {/* Complete Button */}
                        <div className="pt-8 border-t border-gray-100 flex justify-center">
                            <button
                                onClick={handleCompleteDay}
                                className="px-8 py-4 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-gray-800 hover:scale-105 transition-all shadow-lg flex items-center gap-3"
                            >
                                <CheckCircle size={24} />
                                Complete Day {activeDay.day_number}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Timeline View
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-gray-900">{challenge.title}</h1>
                    <p className="text-gray-500 flex items-center gap-2">
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide">
                            {progress.is_completed ? 'Completed' : 'In Progress'}
                        </span>
                        <span>•</span>
                        <span>Day {progress.current_day} of {challenge.duration_days}</span>
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                    className="bg-purple-600 h-full transition-all duration-1000 ease-out"
                    style={{ width: `${(progress.current_day / challenge.duration_days) * 100}%` }}
                />
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenge.challenge_days?.map((day) => {
                    const isUnlocked = day.day_number <= progress.current_day || progress.is_completed
                    const isCompleted = day.day_number < progress.current_day || progress.is_completed
                    const isCurrent = day.day_number === progress.current_day && !progress.is_completed

                    return (
                        <button
                            key={day.id}
                            disabled={!isUnlocked}
                            onClick={() => handleDayClick(day)}
                            className={`relative p-6 rounded-2xl border text-left transition-all duration-300 group ${isCurrent
                                ? 'bg-white border-purple-500 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500'
                                : isUnlocked
                                    ? 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-md'
                                    : 'bg-gray-50 border-gray-100 opacity-70 cursor-not-allowed'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <span className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-purple-600' : 'text-gray-400'
                                    }`}>
                                    Day {day.day_number}
                                </span>
                                {isCompleted ? (
                                    <CheckCircle size={20} className="text-green-500" />
                                ) : isUnlocked ? (
                                    <Play size={20} className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <Lock size={18} className="text-gray-300" />
                                )}
                            </div>

                            <h3 className={`font-bold text-lg ${isUnlocked ? 'text-gray-900' : 'text-gray-400'}`}>
                                {day.topic || `Day ${day.day_number}`}
                            </h3>

                            {isCurrent && (
                                <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-purple-600">
                                    Start Session <ArrowRight size={14} />
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default ChallengePlayer
