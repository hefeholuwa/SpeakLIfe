import React, { useState, useEffect } from 'react'
import { challengeService } from '../../../services/challengeService'
import aiService from '../../../services/aiGenerationService'
import { Plus, Edit2, Trash2, ChevronRight, Calendar, Lock, Unlock, Save, ArrowLeft, Sparkles, Loader, Users } from 'lucide-react'

const ChallengeManager = () => {
    const [challenges, setChallenges] = useState([])
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState('list') // 'list', 'create', 'edit_days'
    const [selectedChallenge, setSelectedChallenge] = useState(null)
    const [participantCounts, setParticipantCounts] = useState({})

    const [generating, setGenerating] = useState(false)

    // AI Modal State
    const [showAIModal, setShowAIModal] = useState(false)
    const [aiTopic, setAiTopic] = useState('')
    const [aiDuration, setAiDuration] = useState(7)
    const [aiPublish, setAiPublish] = useState(false)


    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration_days: 7,
        category: 'General',
        is_published: false
    })

    useEffect(() => {
        loadChallenges()
    }, [])

    const loadChallenges = async () => {
        try {
            setLoading(true)
            // We need a method to get ALL challenges (even unpublished) for admin
            // For now, using the public one but we might need to adjust RLS or service if admins can't see unpublished via that method
            // Actually, RLS allows admins to see everything, so getPublishedChallenges might filter by is_published=true in the query.
            // I'll use a direct supabase call here or add a method to service. 
            // Let's assume for now we use the service but I'll add a 'getAllChallenges' to service if needed.
            // Wait, the service method 'getPublishedChallenges' has .eq('is_published', true).
            // I'll just use a direct fetch here for simplicity or modify service later.
            // For this MVP, I'll just fetch all.
            const data = await challengeService.getAllChallenges()
            setChallenges(data)

            // Fetch participant counts
            const counts = await challengeService.getParticipantCounts()
            const countsMap = {}
            if (counts) {
                counts.forEach(c => {
                    countsMap[c.challenge_id] = c.count
                })
            }
            setParticipantCounts(countsMap)
        } catch (error) {
            console.error('Error loading challenges:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        try {
            const newChallenge = await challengeService.createChallenge(formData)
            setChallenges([newChallenge, ...challenges])
            setView('list')
            setFormData({ title: '', description: '', duration_days: 7, category: 'General', is_published: false })
        } catch (error) {
            alert('Error creating challenge: ' + error.message)
        }
    }

    const handleAIGenerate = async (e) => {
        e.preventDefault()
        if (!aiTopic.trim()) return

        setGenerating(true)
        try {
            const result = await aiService.generateChallengeContent(aiTopic, aiDuration, 'Beginner')

            // Create the challenge immediately
            const challengeData = {
                title: result.title,
                description: result.description,
                duration_days: result.duration_days || aiDuration,
                category: result.category || 'General',
                is_published: aiPublish
            }

            const newChallenge = await challengeService.createChallenge(challengeData)

            // Add the days
            for (const day of result.days) {
                await challengeService.addChallengeDay({
                    challenge_id: newChallenge.id,
                    day_number: day.day_number,
                    topic: day.topic,
                    content: day.content
                })
            }

            setChallenges([newChallenge, ...challenges])
            setView('list')
            setShowAIModal(false)
            setAiTopic('')
            alert('Challenge generated and created successfully!')
        } catch (error) {
            console.error(error)
            alert('Error generating challenge: ' + error.message)
        } finally {
            setGenerating(false)
        }
    }



    const handleTogglePublish = async (challenge) => {
        try {
            const updated = await challengeService.updateChallenge(challenge.id, {
                is_published: !challenge.is_published
            })
            setChallenges(challenges.map(c => c.id === challenge.id ? updated : c))
            // toast.success(updated.is_published ? 'Challenge published!' : 'Challenge unpublished')
        } catch (error) {
            alert('Error updating status: ' + error.message)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this challenge? This cannot be undone.')) return
        try {
            await challengeService.deleteChallenge(id)
            setChallenges(challenges.filter(c => c.id !== id))
        } catch (error) {
            alert('Error deleting challenge: ' + error.message)
        }
    }

    const openDayEditor = (challenge) => {
        setSelectedChallenge(challenge)
        setView('edit_days')
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Challenge Bootcamps</h2>
                {view === 'list' && (
                    <button
                        onClick={() => setView('create')}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Plus size={20} />
                        New Challenge
                    </button>
                )}
            </div>

            {/* LIST VIEW */}
            {view === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challenges.map(challenge => (
                        <div key={challenge.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-32 bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                                <h3 className="text-white font-bold text-xl px-4 text-center">{challenge.title}</h3>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full uppercase">
                                        {challenge.category}
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar size={12} />
                                        {challenge.duration_days} Days
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Users size={12} />
                                        {participantCounts[challenge.id] || 0} Joined
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <button
                                        onClick={() => handleTogglePublish(challenge)}
                                        className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${challenge.is_published
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                            }`}
                                    >
                                        {challenge.is_published ? <Unlock size={12} /> : <Lock size={12} />}
                                        {challenge.is_published ? 'Published' : 'Draft'}
                                    </button>
                                </div>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{challenge.description}</p>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openDayEditor(challenge)}
                                        className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit2 size={16} />
                                        Manage Content
                                    </button>
                                    <button
                                        onClick={() => handleDelete(challenge.id)}
                                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                        title="Delete Challenge"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {challenges.length === 0 && !loading && (
                        <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-500">No challenges found. Create your first one!</p>
                        </div>
                    )}
                </div>
            )
            }

            {/* CREATE VIEW */}
            {
                view === 'create' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl mx-auto animate-fade-in">
                        <div className="flex items-center gap-4 mb-6">
                            <button onClick={() => setView('list')} className="p-2 hover:bg-gray-100 rounded-full">
                                <ArrowLeft size={20} />
                            </button>
                            <h3 className="text-xl font-bold">Create New Challenge</h3>
                        </div>

                        <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-purple-900">Use AI Assistant</h4>
                                <p className="text-sm text-purple-700">Generate a complete 7-day challenge instantly.</p>
                            </div>
                            <button
                                onClick={() => setShowAIModal(true)}
                                disabled={generating}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <Sparkles size={16} />
                                Generate with AI
                            </button>
                        </div>

                        {/* AI Generation Modal */}
                        {showAIModal && (
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                                <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border-0 p-6 animate-in fade-in zoom-in-95">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-xl flex items-center gap-2 text-gray-900">
                                            <Sparkles className="h-5 w-5 text-purple-600" />
                                            Generate Challenge
                                        </h3>
                                        <button onClick={() => setShowAIModal(false)} disabled={generating} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                            <Trash2 className="h-5 w-5 text-gray-500 rotate-45" />
                                            {/* Using Trash2 rotated as X since X isn't imported, or I can import X. Let's assume X is not imported and use text or existing icon. 
                                                Wait, looking at imports: Plus, Edit2, Trash2, ChevronRight, Calendar, Lock, Unlock, Save, ArrowLeft, Sparkles, Loader.
                                                I don't have 'X'. I'll use a simple SVG or text '✕'.
                                            */}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-500"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </div>

                                    <form onSubmit={handleAIGenerate} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Topic or Theme</label>
                                            <input
                                                required
                                                value={aiTopic}
                                                onChange={e => setAiTopic(e.target.value)}
                                                placeholder="e.g., Overcoming Anxiety, Spiritual Discipline..."
                                                disabled={generating}
                                                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Duration (Days)</label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={aiDuration}
                                                onChange={e => setAiDuration(parseInt(e.target.value))}
                                                disabled={generating}
                                            >
                                                <option value={3}>3 Days</option>
                                                <option value={5}>5 Days</option>
                                                <option value={7}>7 Days</option>
                                                <option value={14}>14 Days</option>
                                                <option value={21}>21 Days</option>
                                                <option value={30}>30 Days</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="aiPublish"
                                                checked={aiPublish}
                                                onChange={e => setAiPublish(e.target.checked)}
                                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                            />
                                            <label htmlFor="aiPublish" className="text-sm text-gray-700 font-medium">Publish immediately?</label>
                                        </div>

                                        <div className="pt-2 flex justify-end gap-3">
                                            <button type="button" onClick={() => setShowAIModal(false)} disabled={generating} className="px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg font-medium transition-colors">
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 rounded-lg font-bold transition-colors flex items-center gap-2"
                                                disabled={generating}
                                            >
                                                {generating ? (
                                                    <>
                                                        <Loader size={16} className="animate-spin" />
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles size={16} />
                                                        Generate Challenge
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or create manually</span>
                            </div>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="e.g., 7 Days of Peace"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none h-24"
                                    placeholder="What is this challenge about?"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="365"
                                        value={formData.duration_days}
                                        onChange={e => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    >
                                        <option>General</option>
                                        <option>Anxiety</option>
                                        <option>Identity</option>
                                        <option>Relationships</option>
                                        <option>Faith</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="publish"
                                    checked={formData.is_published}
                                    onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                />
                                <label htmlFor="publish" className="text-sm text-gray-700">Publish immediately?</label>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors mt-4"
                            >
                                Create Challenge
                            </button>
                        </form>
                    </div>
                )
            }

            {/* EDIT DAYS VIEW */}
            {
                view === 'edit_days' && selectedChallenge && (
                    <ChallengeDayEditor
                        challenge={selectedChallenge}
                        onBack={() => setView('list')}
                    />
                )
            }
        </div >
    )
}

// Sub-component for managing days
const ChallengeDayEditor = ({ challenge, onBack }) => {
    const [days, setDays] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingDay, setEditingDay] = useState(null) // Day number being edited

    useEffect(() => {
        loadDays()
    }, [challenge.id])

    const loadDays = async () => {
        try {
            const details = await challengeService.getChallengeById(challenge.id)
            setDays(details.challenge_days || [])
        } catch (error) {
            console.error('Error loading days:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-xl">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h3 className="font-bold text-gray-900">{challenge.title}</h3>
                        <p className="text-xs text-gray-500">{days.length} / {challenge.duration_days} Days Created</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-1">
                {/* Sidebar: Day List */}
                <div className="w-64 border-r border-gray-100 overflow-y-auto max-h-[600px] p-2 space-y-2">
                    {Array.from({ length: challenge.duration_days }).map((_, i) => {
                        const dayNum = i + 1
                        const existingDay = days.find(d => d.day_number === dayNum)
                        const isActive = editingDay === dayNum

                        return (
                            <button
                                key={dayNum}
                                onClick={() => setEditingDay(dayNum)}
                                className={`w-full text-left p-3 rounded-lg text-sm flex items-center justify-between transition-colors ${isActive
                                    ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                    : 'hover:bg-gray-50 text-gray-600'
                                    }`}
                            >
                                <span className="font-medium">Day {dayNum}</span>
                                {existingDay ? (
                                    <CheckCircle size={14} className="text-green-500" />
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-gray-200" />
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Main Content: Day Form */}
                <div className="flex-1 p-8 bg-gray-50/50">
                    {editingDay ? (
                        <DayForm
                            challengeId={challenge.id}
                            dayNumber={editingDay}
                            existingData={days.find(d => d.day_number === editingDay)}
                            onSave={() => {
                                loadDays()
                                setEditingDay(null)
                            }}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Calendar size={48} className="mb-4 opacity-20" />
                            <p>Select a day from the sidebar to edit content</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const DayForm = ({ challengeId, dayNumber, existingData, onSave }) => {
    const [topic, setTopic] = useState(existingData?.topic || '')
    const [content, setContent] = useState(existingData?.content?.text || '')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        setTopic(existingData?.topic || '')
        setContent(existingData?.content?.text || '')
    }, [existingData, dayNumber])

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            // Simple content structure for now
            const dayData = {
                challenge_id: challengeId,
                day_number: dayNumber,
                topic,
                content: { text: content } // We can expand this structure later
            }

            await challengeService.addChallengeDay(dayData)
            onSave()
        } catch (error) {
            alert('Error saving day: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fade-in">
            <h4 className="font-bold text-lg mb-6">Editing Day {dayNumber}</h4>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Topic / Title</label>
                    <input
                        type="text"
                        required
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="e.g., Letting Go of Control"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content (Confessions/Scripture)</label>
                    <textarea
                        required
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none h-64 font-mono text-sm"
                        placeholder="Enter the confessions and scripture for this day..."
                    />
                    <p className="text-xs text-gray-400 mt-2">Tip: You can paste AI-generated content here.</p>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                    {saving ? 'Saving...' : 'Save Day Content'}
                    <Save size={18} />
                </button>
            </div>
        </form>
    )
}

// Helper icon
const CheckCircle = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
)

export default ChallengeManager
