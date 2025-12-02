import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
    AlertTriangle,
    CheckCircle,
    Eye,
    EyeOff,
    Trash2,
    MessageSquare,
    Loader2,
    Search,
    Filter
} from 'lucide-react'
import { toast } from 'sonner'

const CommunityModerationPanel = () => {
    const [activeView, setActiveView] = useState('posts') // 'posts', 'comments'
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('reported') // 'reported', 'all', 'hidden'
    const [actionLoading, setActionLoading] = useState(null)

    useEffect(() => {
        fetchContent()
    }, [filter, activeView])

    const fetchContent = async () => {
        try {
            setLoading(true)
            const table = activeView === 'posts' ? 'community_posts' : 'community_comments'

            let query = supabase
                .from(table)
                .select(`
                    *,
                    profiles (full_name, email, avatar_url)
                `)
                .order('created_at', { ascending: false })

            if (filter === 'reported') {
                query = query.gt('reported_count', 0)
            } else if (filter === 'hidden') {
                query = query.eq('is_hidden', true)
            }

            const { data, error } = await query

            if (error) throw error
            setItems(data || [])
        } catch (error) {
            console.error('Error fetching content:', error)
            toast.error('Failed to load content')
        } finally {
            setLoading(false)
        }
    }

    const toggleHide = async (id, currentStatus) => {
        try {
            setActionLoading(id)
            const table = activeView === 'posts' ? 'community_posts' : 'community_comments'
            const { error } = await supabase
                .from(table)
                .update({ is_hidden: !currentStatus })
                .eq('id', id)

            if (error) throw error

            setItems(items.map(item =>
                item.id === id ? { ...item, is_hidden: !currentStatus } : item
            ))
            toast.success(currentStatus ? 'Content visible' : 'Content hidden')
        } catch (error) {
            toast.error('Failed to update content')
        } finally {
            setActionLoading(null)
        }
    }

    const deleteItem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this permanently?')) return

        try {
            setActionLoading(id)
            const table = activeView === 'posts' ? 'community_posts' : 'community_comments'
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', id)

            if (error) throw error

            setItems(items.filter(item => item.id !== id))
            toast.success('Deleted successfully')
        } catch (error) {
            toast.error('Failed to delete')
        } finally {
            setActionLoading(null)
        }
    }

    const dismissReports = async (id) => {
        try {
            setActionLoading(id)
            const table = activeView === 'posts' ? 'community_posts' : 'community_comments'
            const { error } = await supabase
                .from(table)
                .update({ reported_count: 0 })
                .eq('id', id)

            if (error) throw error

            setItems(items.map(item =>
                item.id === id ? { ...item, reported_count: 0 } : item
            ))
            toast.success('Reports dismissed')
        } catch (error) {
            toast.error('Failed to dismiss reports')
        } finally {
            setActionLoading(null)
        }
    }

    const togglePin = async (id, currentStatus) => {
        try {
            setActionLoading(id)
            const { error } = await supabase
                .from('community_posts')
                .update({ is_pinned: !currentStatus })
                .eq('id', id)

            if (error) throw error

            setItems(items.map(item =>
                item.id === id ? { ...item, is_pinned: !currentStatus } : item
            ))
            toast.success(currentStatus ? 'Post unpinned' : 'Post pinned')
        } catch (error) {
            console.error(error)
            toast.error('Failed to update pin status')
        } finally {
            setActionLoading(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Community Moderation</h2>
                    <p className="text-gray-500">Review reported content and manage community safety.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
                        <button
                            onClick={() => setActiveView('posts')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'posts' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Posts
                        </button>
                        <button
                            onClick={() => setActiveView('comments')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'comments' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Comments
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setFilter('reported')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${filter === 'reported' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                    Reported
                </button>
                <button
                    onClick={() => setFilter('hidden')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${filter === 'hidden' ? 'bg-gray-100 text-gray-900 border-gray-300' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                    Hidden
                </button>
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${filter === 'all' ? 'bg-gray-100 text-gray-900 border-gray-300' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                    All {activeView === 'posts' ? 'Posts' : 'Comments'}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-purple-600" size={32} />
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                    <p className="text-gray-500">No {activeView} found matching your filter.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {items.map(item => (
                        <div key={item.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 w-full">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                        {item.profiles?.avatar_url ? (
                                            <img src={item.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-gray-500">
                                                {item.profiles?.full_name?.[0] || '?'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-gray-900">{item.profiles?.full_name || 'Unknown User'}</span>
                                            <span className="text-sm text-gray-500">• {new Date(item.created_at).toLocaleDateString()}</span>
                                            {item.is_hidden && (
                                                <Badge variant="secondary" className="bg-gray-100 text-gray-600">Hidden</Badge>
                                            )}
                                            {item.is_pinned && activeView === 'posts' && (
                                                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100">Pinned</Badge>
                                            )}
                                        </div>
                                        <p className="mt-2 text-gray-800 whitespace-pre-wrap break-words">{item.content}</p>

                                        {item.reported_count > 0 && (
                                            <div className="mt-3 flex items-center gap-2 text-red-600 text-sm font-medium bg-red-50 px-3 py-1 rounded-full w-fit">
                                                <AlertTriangle size={14} />
                                                {item.reported_count} Report{item.reported_count !== 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 shrink-0">
                                    {activeView === 'posts' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => togglePin(item.id, item.is_pinned)}
                                            disabled={actionLoading === item.id}
                                            className={item.is_pinned ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"}
                                            title={item.is_pinned ? "Unpin Post" : "Pin Post"}
                                        >
                                            <Filter size={16} className={item.is_pinned ? "fill-current" : ""} />
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleHide(item.id, item.is_hidden)}
                                        disabled={actionLoading === item.id}
                                        className={item.is_hidden ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-gray-600 hover:text-gray-900"}
                                        title={item.is_hidden ? "Unhide" : "Hide"}
                                    >
                                        {item.is_hidden ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => deleteItem(item.id)}
                                        disabled={actionLoading === item.id}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        title="Delete Permanently"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                    {item.reported_count > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => dismissReports(item.id)}
                                            disabled={actionLoading === item.id}
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs"
                                        >
                                            Dismiss
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default CommunityModerationPanel
