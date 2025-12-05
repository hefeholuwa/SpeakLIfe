import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Star, Play, BookOpen, Filter, Search, Sparkles, Quote, Volume2, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import DeclarationBuilder from './DeclarationBuilder'

const MyDeclarations = ({ onStartPractice, onShare }) => {
    const { user, userProfile, refreshProfile } = useAuth() // Added userProfile and refreshProfile
    const [declarations, setDeclarations] = useState([])
    const [lifeAreas, setLifeAreas] = useState([])
    const [loading, setLoading] = useState(true)
    const [showBuilder, setShowBuilder] = useState(false)
    const [editingDeclaration, setEditingDeclaration] = useState(null)
    const [selectedArea, setSelectedArea] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [completedIds, setCompletedIds] = useState(new Set())

    // Daily Goal State
    const [showGoalInput, setShowGoalInput] = useState(false)
    const [goalInput, setGoalInput] = useState('')

    // Get the effective target goal
    const targetGoal = userProfile?.daily_declaration_goal || (declarations.length > 0 ? declarations.length : 1)

    // Calculate progress percentage
    const progressPercentage = Math.min((completedIds.size / targetGoal) * 100, 100)

    useEffect(() => {
        if (showGoalInput) {
            setGoalInput(targetGoal.toString())
        }
    }, [showGoalInput, targetGoal])

    useEffect(() => {
        if (user) {
            fetchData()
        }
    }, [user])

    const handleQuickComplete = async (declaration) => {
        if (completedIds.has(declaration.id)) {
            toast.success('Already completed today!')
            return
        }

        try {
            const today = new Date().toISOString().split('T')[0]

            // 1. Create a "Quick Session"
            const { data: session, error: sessionError } = await supabase
                .from('practice_sessions')
                .insert({
                    user_id: user.id,
                    session_date: today,
                    duration_seconds: 5,
                    completed_count: 1
                })
                .select()
                .single()

            if (sessionError) throw sessionError

            // 2. Add declaration to session
            const { error: declError } = await supabase
                .from('session_declarations')
                .insert({
                    session_id: session.id,
                    declaration_id: declaration.id,
                    is_completed: true
                })

            if (declError) throw declError

            // 3. Update local state
            setCompletedIds(prev => {
                const newSet = new Set(prev)
                newSet.add(declaration.id)
                return newSet
            })

            toast.success('Marked as spoken!')
            await refreshProfile()

        } catch (error) {
            console.error('Error quick completing:', error)
            toast.error('Failed to update progress')
        }
    }

    const handleUpdateGoal = async (newGoal) => {
        try {
            const goal = parseInt(newGoal)
            if (isNaN(goal) || goal < 1) {
                toast.error('Please enter a valid number')
                return
            }

            const { error } = await supabase
                .from('profiles')
                .update({ daily_declaration_goal: goal })
                .eq('id', user.id)

            if (error) throw error

            await refreshProfile()
            toast.success('Daily goal updated')
            setShowGoalInput(false)
        } catch (error) {
            console.error('Error updating goal:', error)
            toast.error('Failed to update goal')
        }
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch life areas
            const { data: areasData } = await supabase
                .from('life_areas')
                .select('*')
                .eq('is_active', true)
                .order('sort_order')

            setLifeAreas(areasData || [])

            // Fetch user declarations
            const { data: declData, error } = await supabase
                .from('user_declarations')
                .select(`
          *,
          life_areas (
            id,
            name,
            icon,
            color
          )
        `)
                .eq('user_id', user.id)
                .eq('is_active', true)
                .order('created_at', { ascending: false })

            if (error) throw error
            setDeclarations(declData || [])

            // Fetch today's completions
            const today = new Date().toISOString().split('T')[0]
            const { data: sessionData } = await supabase
                .from('practice_sessions')
                .select(`
                    id,
                    session_declarations (
                        declaration_id
                    )
                `)
                .eq('user_id', user.id)
                .eq('session_date', today)

            const completed = new Set()
            if (sessionData) {
                sessionData.forEach(session => {
                    session.session_declarations?.forEach(sd => {
                        completed.add(sd.declaration_id)
                    })
                })
            }
            setCompletedIds(completed)

        } catch (error) {
            console.error('Error fetching declarations:', error)
            toast.error('Failed to load declarations')
        } finally {
            setLoading(false)
        }
    }

    const handleToggleFavorite = async (declaration) => {
        try {
            const { error } = await supabase
                .from('user_declarations')
                .update({ is_favorite: !declaration.is_favorite })
                .eq('id', declaration.id)
                .eq('user_id', user.id)

            if (error) throw error

            setDeclarations(declarations.map(d =>
                d.id === declaration.id ? { ...d, is_favorite: !d.is_favorite } : d
            ))

            toast.success(declaration.is_favorite ? 'Removed from favorites' : 'Added to favorites')
        } catch (error) {
            console.error('Error toggling favorite:', error)
            toast.error('Failed to update favorite')
        }
    }

    const handleDelete = async (declaration) => {
        if (!confirm(`Delete "${declaration.title}"?`)) return

        try {
            const { error } = await supabase
                .from('user_declarations')
                .delete()
                .eq('id', declaration.id)
                .eq('user_id', user.id)

            if (error) throw error

            setDeclarations(declarations.filter(d => d.id !== declaration.id))
            toast.success('Declaration deleted')
        } catch (error) {
            console.error('Error deleting declaration:', error)
            toast.error('Failed to delete declaration')
        }
    }

    const filteredDeclarations = declarations
        .filter(d => selectedArea === 'all' || d.life_area_id === selectedArea)
        .filter(d =>
            searchQuery === '' ||
            d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.declaration_text.toLowerCase().includes(searchQuery.toLowerCase())
        )

    const favoriteDeclarations = filteredDeclarations.filter(d => d.is_favorite)
    const regularDeclarations = filteredDeclarations.filter(d => !d.is_favorite)

    if (showBuilder) {
        return (
            <DeclarationBuilder
                editDeclaration={editingDeclaration}
                onClose={() => {
                    setShowBuilder(false)
                    setEditingDeclaration(null)
                }}
                onComplete={() => {
                    fetchData()
                }}
            />
        )
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900">My Declarations</h1>
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-100 flex items-center gap-1">
                            <Sparkles size={12} />
                            {declarations.length} Active
                        </span>
                    </div>
                    <p className="text-gray-500">Speak life over your future, health, and family.</p>
                </div>

                {/* Today's Progress Card */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 rounded-2xl shadow-lg flex items-center gap-4 min-w-[200px]">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#4B5563"
                                strokeWidth="4"
                            />
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#10B981"
                                strokeWidth="4"
                                strokeDasharray={`${progressPercentage}, 100`}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <span className="absolute text-xs font-bold">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setShowGoalInput(true)}>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Daily Goal</p>
                            <Edit2 size={12} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {showGoalInput ? (
                            <div className="flex items-center gap-1 mt-1">
                                <span className="font-bold text-lg leading-none">{completedIds.size} / </span>
                                <input
                                    type="number"
                                    className="w-16 bg-gray-700 rounded px-1 py-0.5 text-white text-lg font-bold border border-gray-600 focus:outline-none focus:border-purple-500"
                                    value={goalInput}
                                    onChange={(e) => setGoalInput(e.target.value)}
                                    onBlur={() => {
                                        if (goalInput !== targetGoal.toString()) {
                                            handleUpdateGoal(goalInput)
                                        } else {
                                            setShowGoalInput(false)
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleUpdateGoal(goalInput)
                                        if (e.key === 'Escape') setShowGoalInput(false)
                                    }}
                                    autoFocus
                                />
                            </div>
                        ) : (
                            <p
                                className="font-bold text-lg leading-none mt-1 cursor-pointer hover:text-purple-300 transition-colors"
                                onClick={() => setShowGoalInput(true)}
                                title="Click to set daily goal"
                            >
                                {completedIds.size} / {targetGoal}
                            </p>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => {
                        setEditingDeclaration(null)
                        setShowBuilder(true)
                    }}
                    className="bg-white border-2 border-gray-100 text-gray-900 px-4 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap"
                >
                    <Plus size={20} />
                    New
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search your declarations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 rounded-xl transition-all outline-none text-sm"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <button
                        onClick={() => setSelectedArea('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${selectedArea === 'all'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        All Areas
                    </button>
                    {lifeAreas.map(area => (
                        <button
                            key={area.id}
                            onClick={() => setSelectedArea(area.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${selectedArea === area.id
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <span>{area.icon}</span>
                            {area.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            {declarations.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => onStartPractice?.(declarations)}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all"
                    >
                        <Play size={18} className="fill-white" />
                        Practice All ({declarations.length})
                    </button>
                    {favoriteDeclarations.length > 0 && (
                        <button
                            onClick={() => onStartPractice?.(favoriteDeclarations)}
                            className="flex items-center gap-2 px-5 py-3 bg-white border border-yellow-200 text-yellow-700 rounded-xl font-bold hover:bg-yellow-50 transition-all shadow-sm"
                        >
                            <Star size={18} className="fill-yellow-500 text-yellow-500" />
                            Practice Favorites ({favoriteDeclarations.length})
                        </button>
                    )}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            )}

            {/* Empty State */}
            {!loading && declarations.length === 0 && (
                <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 border-dashed">
                    <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="text-purple-500" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Start Speaking Life</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
                        Your words have power. Create your first declaration to align your heart with God's truth for your life.
                    </p>
                    <button
                        onClick={() => {
                            setEditingDeclaration(null)
                            setShowBuilder(true)
                        }}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20"
                    >
                        <Plus size={20} />
                        Create Declaration
                    </button>
                </div>
            )}

            {/* Declarations Grid */}
            {!loading && filteredDeclarations.length > 0 && (
                <div className="space-y-8">
                    {/* Favorites Section */}
                    {favoriteDeclarations.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Star size={20} className="text-yellow-500 fill-yellow-500" />
                                Favorites
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {favoriteDeclarations.map(declaration => (
                                    <DeclarationCard
                                        key={declaration.id}
                                        declaration={declaration}
                                        isCompleted={completedIds.has(declaration.id)}
                                        onEdit={() => {
                                            setEditingDeclaration(declaration)
                                            setShowBuilder(true)
                                        }}
                                        onDelete={() => handleDelete(declaration)}
                                        onToggleFavorite={() => handleToggleFavorite(declaration)}
                                        onQuickComplete={() => handleQuickComplete(declaration)} // Fixed missing handler reference if any
                                        onShare={onShare}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Declarations Section */}
                    {regularDeclarations.length > 0 && (
                        <div className="space-y-4">
                            {favoriteDeclarations.length > 0 && (
                                <h2 className="text-lg font-bold text-gray-900">All Declarations</h2>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {regularDeclarations.map(declaration => (
                                    <DeclarationCard
                                        key={declaration.id}
                                        declaration={declaration}
                                        isCompleted={completedIds.has(declaration.id)}
                                        onEdit={() => {
                                            setEditingDeclaration(declaration)
                                            setShowBuilder(true)
                                        }}
                                        onDelete={() => handleDelete(declaration)}
                                        onToggleFavorite={() => handleToggleFavorite(declaration)}
                                        onQuickComplete={() => handleQuickComplete(declaration)} // Fixed missing handler reference if any
                                        onShare={onShare}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* No Results */}
            {!loading && declarations.length > 0 && filteredDeclarations.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-3xl">
                    <p className="text-gray-600 font-medium">No declarations match your filters</p>
                    <button
                        onClick={() => { setSearchQuery(''); setSelectedArea('all') }}
                        className="text-purple-600 font-bold text-sm mt-2 hover:underline"
                    >
                        Clear filters
                    </button>
                </div>
            )}
        </div>
    )
}

// Declaration Card Component
const DeclarationCard = ({ declaration, isCompleted, onEdit, onDelete, onToggleFavorite, onQuickComplete, onShare }) => {
    const area = declaration.life_areas
    const [recordingUrl, setRecordingUrl] = useState(null)
    const [showRecording, setShowRecording] = useState(false)

    useEffect(() => {
        fetchLatestRecording()
    }, [declaration, isCompleted])

    const fetchLatestRecording = async () => {
        try {
            const { data, error } = await supabase
                .from('session_declarations')
                .select('recording_url')
                .eq('declaration_id', declaration.id)
                .not('recording_url', 'is', null)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (data?.recording_url) {
                setRecordingUrl(data.recording_url)
            }
        } catch (error) {
            console.error('Error fetching recording:', error)
        }
    }

    return (
        <div
            className={`group p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden cursor-pointer ${isCompleted
                ? 'bg-green-50/50 border-green-200 shadow-sm'
                : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
                }`}
            onClick={(e) => {
                if (!e.target.closest('button') && !e.target.closest('audio')) {
                    if (recordingUrl) setShowRecording(!showRecording)
                }
            }}
        >
            {/* Decorative Background Blur */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-opacity duration-300 ${area ? 'opacity-20' : 'opacity-0'
                }`} style={{ backgroundColor: area?.color || '#E9D5FF' }} />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {/* Quick Complete Checkbox */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onQuickComplete()
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isCompleted
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 scale-110'
                                : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                                }`}
                            title={isCompleted ? "Completed today!" : "Mark as spoken today"}
                        >
                            <Sparkles size={14} className={isCompleted ? "fill-white" : ""} />
                        </button>

                        <div>
                            <h3 className={`font-bold leading-tight line-clamp-1 ${isCompleted ? 'text-green-900' : 'text-gray-900'}`}>
                                {declaration.title}
                            </h3>
                            {area && <p className="text-xs text-gray-500 font-medium">{area.name}</p>}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); onShare(declaration.declaration_text) }}
                            className="p-2 hover:bg-purple-50 rounded-lg text-gray-400 hover:text-purple-600 transition-colors opacity-0 group-hover:opacity-100"
                            title="Share to Community"
                        >
                            <Share2 size={16} />
                        </button>

                        {recordingUrl && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowRecording(!showRecording) }}
                                className={`p-2 rounded-lg transition-colors ${showRecording ? 'bg-purple-100 text-purple-600' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}
                                title="Play Recording"
                            >
                                <Play size={16} className="fill-purple-600" />
                            </button>
                        )}

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleFavorite() }}
                                className="p-2 hover:bg-yellow-50 rounded-lg text-gray-400 hover:text-yellow-500 transition-colors"
                            >
                                <Star size={16} className={declaration.is_favorite ? 'fill-yellow-500 text-yellow-500' : ''} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit() }}
                                className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete() }}
                                className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex gap-2 mb-2">
                        <Quote size={14} className="text-purple-300 flex-shrink-0" />
                        <p className="text-gray-600 leading-relaxed text-sm line-clamp-3 italic">
                            {declaration.declaration_text}
                        </p>
                    </div>

                    {declaration.bible_reference && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 rounded-lg border border-purple-100 mt-2">
                            <BookOpen size={12} className="text-purple-600" />
                            <span className="text-xs font-bold text-purple-700">{declaration.bible_reference}</span>
                        </div>
                    )}
                </div>

                {/* Recording Section */}
                {recordingUrl && (
                    <div className={`mt-4 pt-4 border-t border-gray-50 transition-all duration-300 ${showRecording ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                        <div className="bg-purple-50 rounded-xl p-2 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <Volume2 size={14} className="text-purple-600" />
                            </div>
                            <audio src={recordingUrl} controls className="w-full h-8" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyDeclarations
