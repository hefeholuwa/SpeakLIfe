import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import {
    MessageCircle,
    Heart,
    Send,
    Filter,
    MoreVertical,
    Trash2,
    Sparkles,
    Users,
    Eye,
    X,
    MessageSquare,
    ArrowLeft,
    ChevronRight,
    Shield
} from 'lucide-react';

const CommunityChat = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState('');
    const [category, setCategory] = useState('general');
    const [filter, setFilter] = useState('all');
    const [submitting, setSubmitting] = useState(false);

    // Comments & Details State
    const [selectedPost, setSelectedPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

    useEffect(() => {
        fetchPosts();

        // Set up real-time subscription for posts
        const postSubscription = supabase
            .channel('community_posts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, payload => {
                if (payload.eventType === 'INSERT') {
                    fetchSinglePost(payload.new.id).then(post => {
                        if (post) setPosts(prev => [post, ...prev]);
                    });
                } else if (payload.eventType === 'DELETE') {
                    setPosts(prev => prev.filter(p => p.id !== payload.old.id));
                    if (selectedPost?.id === payload.old.id) setSelectedPost(null);
                } else if (payload.eventType === 'UPDATE') {
                    setPosts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
                    if (selectedPost?.id === payload.new.id) {
                        setSelectedPost(prev => ({ ...prev, ...payload.new }));
                    }
                }
            })
            .subscribe();

        return () => {
            postSubscription.unsubscribe();
        };
    }, [selectedPost]);

    // Real-time subscription for comments when a post is selected
    useEffect(() => {
        if (!selectedPost) return;

        const commentSubscription = supabase
            .channel(`comments:${selectedPost.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'community_comments',
                filter: `post_id=eq.${selectedPost.id}`
            }, payload => {
                if (payload.eventType === 'INSERT') {
                    fetchSingleComment(payload.new.id).then(comment => {
                        if (comment) {
                            setComments(prev => {
                                // Deduplicate: Don't add if already exists
                                if (prev.some(c => c.id === comment.id)) return prev;
                                return [...prev, comment];
                            });
                        }
                    });
                } else if (payload.eventType === 'DELETE') {
                    setComments(prev => prev.filter(c => c.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            commentSubscription.unsubscribe();
        };
    }, [selectedPost?.id]); // Only re-subscribe if the post ID changes

    const fetchSinglePost = async (id) => {
        const { data } = await supabase
            .from('community_posts')
            .select(`
        *,
        profiles (full_name, avatar_url, username, is_admin),
        community_likes (user_id)
      `)
            .eq('id', id)
            .single();

        if (data) {
            return {
                ...data,
                isLiked: data.community_likes?.some(like => like.user_id === user?.id)
            };
        }
        return null;
    };

    const fetchSingleComment = async (id) => {
        const { data } = await supabase
            .from('community_comments')
            .select(`
                *,
                profiles (full_name, avatar_url, username, is_admin)
            `)
            .eq('id', id)
            .single();
        return data;
    };

    const fetchComments = async (postId) => {
        try {
            setLoadingComments(true);
            const { data, error } = await supabase
                .from('community_comments')
                .select(`
                    *,
                    profiles (full_name, avatar_url, username, is_admin)
                `)
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setComments(data || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
            toast.error('Could not load comments');
        } finally {
            setLoadingComments(false);
        }
    };

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('community_posts')
                .select(`
          *,
          profiles (full_name, avatar_url, username, is_admin),
          community_likes (user_id)
        `)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            const formattedPosts = data.map(post => ({
                ...post,
                isLiked: post.community_likes?.some(like => like.user_id === user?.id)
            }));

            setPosts(formattedPosts);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user || !selectedPost) return;

        try {
            const { data, error } = await supabase
                .from('community_comments')
                .insert({
                    post_id: selectedPost.id,
                    user_id: user.id,
                    content: newComment.trim()
                })
                .select()
                .single();

            if (error) throw error;

            setNewComment('');

            // Immediately fetch details and add to list (optimistic-like)
            if (data) {
                const fullComment = await fetchSingleComment(data.id);
                if (fullComment) {
                    setComments(prev => {
                        if (prev.some(c => c.id === fullComment.id)) return prev;
                        return [...prev, fullComment];
                    });
                }
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            toast.error('Failed to post comment');
        }
    };

    const handleLike = async (postId, currentLikeStatus, e) => {
        e.stopPropagation(); // Prevent opening details
        if (!user) return;

        // Optimistic update
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    isLiked: !currentLikeStatus,
                    likes_count: currentLikeStatus ? p.likes_count - 1 : p.likes_count + 1
                };
            }
            return p;
        }));

        if (selectedPost?.id === postId) {
            setSelectedPost(prev => ({
                ...prev,
                isLiked: !currentLikeStatus,
                likes_count: currentLikeStatus ? prev.likes_count - 1 : prev.likes_count + 1
            }));
        }

        try {
            if (currentLikeStatus) {
                await supabase
                    .from('community_likes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', user.id);
            } else {
                await supabase
                    .from('community_likes')
                    .insert({
                        post_id: postId,
                        user_id: user.id
                    });
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            fetchPosts(); // Revert on error
        }
    };

    const handleDelete = async (postId, e) => {
        e.stopPropagation();
        if (!confirm('Delete this post?')) return;

        try {
            const { error } = await supabase
                .from('community_posts')
                .delete()
                .eq('id', postId);

            if (error) throw error;
            toast.success('Post deleted');
            if (selectedPost?.id === postId) setSelectedPost(null);
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('Failed to delete post');
        }
    };
    const handlePost = async (e) => {
        e.preventDefault();
        if (!newPost.trim() || !user) return;

        try {
            setSubmitting(true);
            const { error } = await supabase
                .from('community_posts')
                .insert({
                    user_id: user.id,
                    content: newPost.trim(),
                    category: category
                });

            if (error) throw error;

            setNewPost('');
            toast.success('Message posted!');
        } catch (error) {
            console.error('Error posting:', error);
            toast.error('Failed to post message');
        } finally {
            setSubmitting(false);
        }
    };
    const handleDeleteComment = async (commentId) => {
        if (!confirm('Delete this comment?')) return;
        try {
            const { error } = await supabase
                .from('community_comments')
                .delete()
                .eq('id', commentId);

            if (error) throw error;
            toast.success('Comment deleted');
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast.error('Failed to delete comment');
        }
    };

    const openPostDetails = async (post) => {
        window.history.pushState({ view: 'postDetails', postId: post.id }, '');
        setSelectedPost(post);
        fetchComments(post.id);

        // Record unique view
        try {
            await supabase.rpc('record_post_view', { post_id_param: post.id });
        } catch (error) {
            console.error('Error recording view:', error);
        }
    };

    // Handle browser back button
    useEffect(() => {
        const handlePopState = (event) => {
            if (selectedPost) {
                setSelectedPost(null);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [selectedPost]);

    const filteredPosts = filter === 'all'
        ? posts
        : posts.filter(p => p.category === filter);

    const categories = [
        { id: 'general', label: 'General', icon: MessageCircle, color: 'text-gray-500', bg: 'bg-gray-100' },
        { id: 'gratitude', label: 'Gratitude', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50' },
        { id: 'testimony', label: 'Testimony', icon: Heart, color: 'text-purple-500', bg: 'bg-purple-50' },
        { id: 'prayer', label: 'Prayer', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    ];

    // Detail View
    if (selectedPost) {
        return (
            <div className="max-w-2xl mx-auto animate-fade-in">
                {/* Detail Header */}
                <div className="flex items-center gap-3 mb-6 sticky top-0 bg-[#FDFCF8] z-10 py-2">
                    <button
                        onClick={() => window.history.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
                    >
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900">Post Details</h2>
                </div>

                {/* Original Post */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-gray-700 font-bold text-lg overflow-hidden">
                            {selectedPost.profiles?.avatar_url ? (
                                <img src={selectedPost.profiles.avatar_url} alt={selectedPost.profiles.username || 'User'} className="w-full h-full object-cover" />
                            ) : (
                                selectedPost.profiles?.full_name?.[0] || 'U'
                            )}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-lg flex items-center gap-1">
                                {selectedPost.profiles?.username || selectedPost.profiles?.full_name || 'Anonymous'}
                                {selectedPost.profiles?.is_admin && (
                                    <Shield size={16} className="text-gray-900 fill-current" />
                                )}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{new Date(selectedPost.created_at).toLocaleString()}</span>
                                {categories.find(c => c.id === selectedPost.category) && (
                                    <>
                                        <span>•</span>
                                        <span className={`flex items-center gap-1 ${categories.find(c => c.id === selectedPost.category).color}`}>
                                            {categories.find(c => c.id === selectedPost.category).label}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap mb-8 font-serif">
                        {selectedPost.content}
                    </p>

                    <div className="flex items-center gap-6 text-gray-500 font-medium border-t border-gray-50 pt-6">
                        <button
                            onClick={(e) => handleLike(selectedPost.id, selectedPost.isLiked, e)}
                            className={`flex items-center gap-2 transition-colors ${selectedPost.isLiked ? 'text-red-500' : 'hover:text-gray-900'}`}
                        >
                            <Heart size={20} className={selectedPost.isLiked ? 'fill-current' : ''} />
                            {selectedPost.likes_count || 0} Likes
                        </button>
                        <span className="flex items-center gap-2">
                            <Eye size={20} />
                            {selectedPost.views || 0} Views
                        </span>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <MessageSquare size={20} />
                            Comments ({comments.length})
                        </h3>
                    </div>

                    <div className="p-6 space-y-6">
                        {loadingComments ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        ) : comments.length > 0 ? (
                            comments.map(comment => (
                                <div key={comment.id} className="flex gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-sm font-bold text-gray-600 overflow-hidden">
                                        {comment.profiles?.avatar_url ? (
                                            <img src={comment.profiles.avatar_url} alt={comment.profiles.username || 'User'} className="w-full h-full object-cover" />
                                        ) : (
                                            comment.profiles?.full_name?.[0] || 'U'
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-gray-900 flex items-center gap-1">
                                                    {comment.profiles?.username || comment.profiles?.full_name || 'Anonymous'}
                                                    {comment.profiles?.is_admin && (
                                                        <Shield size={12} className="text-gray-900 fill-current" />
                                                    )}
                                                </span>
                                                <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-800 leading-relaxed">{comment.content}</p>
                                        </div>
                                        {user?.id === comment.user_id && (
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="text-xs text-gray-400 hover:text-red-500 mt-2 ml-2 font-medium transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-400 italic">No comments yet. Be the first to share your thoughts!</p>
                            </div>
                        )}
                    </div>

                    {/* Comment Input */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100 sticky bottom-0">
                        <form onSubmit={handleComment} className="flex gap-3">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="flex-1 px-4 py-3 rounded-xl border-transparent focus:bg-white focus:border-gray-200 focus:ring-0 transition-all shadow-sm"
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim()}
                                className="bg-gray-900 text-white p-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="max-w-2xl mx-auto space-y-8 relative">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">Community</h1>
                <p className="text-gray-500">Share your journey and encourage others.</p>
            </div>

            {/* Post Input */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <form onSubmit={handlePost}>
                    <textarea
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        placeholder="What are you grateful for today?"
                        className="w-full p-4 bg-gray-50 rounded-2xl border-transparent focus:bg-white focus:border-gray-200 focus:ring-0 transition-all resize-none min-h-[100px] mb-4"
                        maxLength={500}
                    />

                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategory(cat.id)}
                                    className={`flex items-center justify-center md:justify-start gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${category === cat.id
                                        ? `${cat.bg} ${cat.color} ring-2 ring-offset-1 ring-${cat.color.split('-')[1]}-200 shadow-sm`
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-transparent'
                                        }`}
                                >
                                    <cat.icon size={18} />
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end mt-2">
                            <button
                                type="submit"
                                disabled={!newPost.trim() || submitting}
                                className="w-full md:w-auto bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20 active:scale-95"
                            >
                                <Send size={18} />
                                Post Message
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Feed Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    All Posts
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setFilter(cat.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${filter === cat.id ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 border-dashed">
                        <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <h3 className="text-lg font-bold text-gray-900">No posts yet</h3>
                        <p className="text-gray-500 text-sm">Be the first to share something!</p>
                    </div>
                ) : (
                    filteredPosts.map(post => {
                        const catConfig = categories.find(c => c.id === post.category) || categories[0];
                        const isOwner = user?.id === post.user_id;

                        return (
                            <div
                                key={post.id}
                                onClick={() => openPostDetails(post)}
                                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all animate-fade-in cursor-pointer group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-gray-700 font-bold text-sm overflow-hidden">
                                            {post.profiles?.avatar_url ? (
                                                <img src={post.profiles.avatar_url} alt={post.profiles.username || 'User'} className="w-full h-full object-cover" />
                                            ) : (
                                                post.profiles?.full_name?.[0] || 'U'
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1">
                                                {post.profiles?.username || post.profiles?.full_name || 'Anonymous'}
                                                {post.profiles?.is_admin && (
                                                    <Shield size={12} className="text-gray-900 fill-current" />
                                                )}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span className={`flex items-center gap-1 ${catConfig.color}`}>
                                                    <catConfig.icon size={10} />
                                                    {catConfig.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {isOwner && (
                                        <button
                                            onClick={(e) => handleDelete(post.id, e)}
                                            className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                                <p className="text-gray-800 leading-relaxed mb-6 whitespace-pre-wrap line-clamp-3">{post.content}</p>

                                <div className="flex items-center gap-6 border-t border-gray-50 pt-4">
                                    <button
                                        onClick={(e) => handleLike(post.id, post.isLiked, e)}
                                        className={`flex items-center gap-2 text-sm font-bold transition-colors ${post.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        <Heart size={18} className={post.isLiked ? 'fill-current' : ''} />
                                        {post.likes_count || 0}
                                    </button>

                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                                        <MessageSquare size={18} />
                                        {post.comments_count || 0}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-400 ml-auto">
                                        <Eye size={18} />
                                        {post.views || 0}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default CommunityChat;
