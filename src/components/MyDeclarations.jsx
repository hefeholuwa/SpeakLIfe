import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Star, Play, BookOpen, Filter, Search } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import DeclarationBuilder from './DeclarationBuilder'

const MyDeclarations = ({ onStartPractice }) => {
    const { user } = useAuth()
    const [declarations, setDeclarations] = useState([])
    const [lifeAreas, setLifeAreas] = useState([])
    const [loading, setLoading] = useState(true)
    const [showBuilder, setShowBuilder] = useState(false)
    const [editingDeclaration, setEditingDeclaration] = useState(null)
    const [selectedArea, setSelectedArea] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        if (user) {
            fetchData()
        }
    }, [user])

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
                .update({ is_active: false })
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">My Declarations</h1>
                    <p className="text-gray-600 mt-1">
                        {declarations.length} declaration{declarations.length !== 1 ? 's' : ''} created
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingDeclaration(null)
                        setShowBuilder(true)
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                    <Plus size={20} />
                    New Declaration
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search declarations..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                </div>

                {/* Life Area Filter */}
                <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors bg-white"
                >
                    <option value="all">All Areas</option>
                    {lifeAreas.map(area => (
                        <option key={area.id} value={area.id}>
                            {area.icon} {area.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Quick Actions */}
            {declarations.length > 0 && (
                <div className="flex gap-3">
                    <button
                        onClick={() => onStartPractice?.(declarations)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-bold hover:bg-purple-200 transition-colors"
                    >
                        <Play size={18} />
                        Practice All ({declarations.length})
                    </button>
                    {favoriteDeclarations.length > 0 && (
                        <button
                            onClick={() => onStartPractice?.(favoriteDeclarations)}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl font-bold hover:bg-yellow-200 transition-colors"
                        >
                            <Star size={18} className="fill-yellow-600" />
                            Practice Favorites ({favoriteDeclarations.length})
                        </button>
                    )}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading declarations...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && declarations.length === 0 && (
                <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-dashed border-purple-200">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus size={32} className="text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No declarations yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Create your first declaration to start your transformation journey. Speak life over your health, finances, relationships, and more!
                    </p>
                    <button
                        onClick={() => {
                            setEditingDeclaration(null)
                            setShowBuilder(true)
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        <Plus size={20} />
                        Create Your First Declaration
                    </button>
                </div>
            )}

            {/* Declarations List */}
            {!loading && filteredDeclarations.length > 0 && (
                <div className="space-y-6">
                    {/* Favorites */}
                    {favoriteDeclarations.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Star size={20} className="text-yellow-500 fill-yellow-500" />
                                Favorites
                            </h2>
                            <div className="grid gap-4">
                                {favoriteDeclarations.map(declaration => (
                                    <DeclarationCard
                                        key={declaration.id}
                                        declaration={declaration}
                                        onEdit={() => {
                                            setEditingDeclaration(declaration)
                                            setShowBuilder(true)
                                        }}
                                        onDelete={() => handleDelete(declaration)}
                                        onToggleFavorite={() => handleToggleFavorite(declaration)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Regular Declarations */}
                    {regularDeclarations.length > 0 && (
                        <div>
                            {favoriteDeclarations.length > 0 && (
                                <h2 className="text-lg font-bold text-gray-900 mb-3">All Declarations</h2>
                            )}
                            <div className="grid gap-4">
                                {regularDeclarations.map(declaration => (
                                    <DeclarationCard
                                        key={declaration.id}
                                        declaration={declaration}
                                        onEdit={() => {
                                            setEditingDeclaration(declaration)
                                            setShowBuilder(true)
                                        }}
                                        onDelete={() => handleDelete(declaration)}
                                        onToggleFavorite={() => handleToggleFavorite(declaration)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* No Results */}
            {!loading && declarations.length > 0 && filteredDeclarations.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-600">No declarations match your filters</p>
                </div>
            )}

            {/* Declaration Builder Modal */}
            {showBuilder && (
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
            )}
        </div>
    )
}

// Declaration Card Component
const DeclarationCard = ({ declaration, onEdit, onDelete, onToggleFavorite }) => {
    const { user } = useAuth()
    const area = declaration.life_areas
    const [recordingUrl, setRecordingUrl] = useState(null)
    const [loadingRecording, setLoadingRecording] = useState(false)
    const [showRecording, setShowRecording] = useState(false)

    useEffect(() => {
        fetchLatestRecording()
    }, [declaration.id])

    const fetchLatestRecording = async () => {
        try {
            setLoadingRecording(true)
            const { data, error } = await supabase
                .from('session_declarations')
                .select('recording_url')
                .eq('declaration_id', declaration.id)
                .not('recording_url', 'is', null)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
                throw error
            }

            if (data?.recording_url) {
                setRecordingUrl(data.recording_url)
            }
        } catch (error) {
            console.error('Error fetching recording:', error)
        } finally {
            setLoadingRecording(false)
        }
    }

    const handleCardClick = (e) => {
        // Don't expand if clicking on action buttons
        if (e.target.closest('button')) return
        if (recordingUrl) {
            setShowRecording(!showRecording)
        }
    }

    return (
        <div
            className={`group p-6 bg-white rounded-2xl border-2 transition-all cursor-pointer ${showRecording
                    ? 'border-purple-400 shadow-lg'
                    : 'border-gray-100 hover:border-purple-300 hover:shadow-lg'
                }`}
            onClick={handleCardClick}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    {/* Life Area Badge */}
                    <div className="flex items-center gap-2 mb-3">
                        {area && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                                <span className="text-sm">{area.icon}</span>
                                <span className="text-xs font-bold text-gray-700">{area.name}</span>
                            </div>
                        )}

                        {/* Recording Indicator */}
                        {recordingUrl && (
                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 rounded-full">
                                <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs font-bold text-red-700">Recording</span>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{declaration.title}</h3>

                    {/* Declaration Text */}
                    <p className="text-gray-700 leading-relaxed mb-3 italic">
                        "{declaration.declaration_text}"
                    </p>

                    {/* Bible Reference */}
                    {declaration.bible_reference && (
                        <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-xl border border-purple-100">
                            <BookOpen size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-purple-900 mb-1">{declaration.bible_reference}</p>
                                {declaration.bible_verse_text && (
                                    <p className="text-xs text-purple-700 leading-relaxed">
                                        {declaration.bible_verse_text}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Recording Player - Expandable */}
                    {showRecording && recordingUrl && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border-2 border-purple-200 space-y-2">
                            <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                                </svg>
                                Your Recording
                            </p>
                            <audio
                                src={recordingUrl}
                                controls
                                className="w-full"
                                onClick={(e) => e.stopPropagation()} // Prevent card collapse when interacting with player
                            />
                            <p className="text-xs text-gray-500">
                                💡 Click anywhere on the card to {showRecording ? 'hide' : 'show'} the recording
                            </p>
                        </div>
                    )}

                    {/* Click hint */}
                    {recordingUrl && !showRecording && (
                        <p className="text-xs text-purple-600 mt-2">
                            💡 Click to listen to your recording
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onToggleFavorite()
                        }}
                        className="p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                        title={declaration.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        <Star
                            size={18}
                            className={declaration.is_favorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}
                        />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit()
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit2 size={18} className="text-blue-600" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete()
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={18} className="text-red-600" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MyDeclarations
