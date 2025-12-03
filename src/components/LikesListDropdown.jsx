import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { X, Heart } from 'lucide-react';

const LikesListDropdown = ({ postId, onClose, onProfileClick }) => {
    const [likers, setLikers] = useState([]);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchLikers();

        // Close on click outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [postId]);

    const fetchLikers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('community_likes')
                .select(`
                    user_id,
                    created_at,
                    profiles (id, full_name, username, avatar_url, is_admin)
                `)
                .eq('post_id', postId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLikers(data || []);
        } catch (error) {
            console.error('Error fetching likers:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            ref={dropdownRef}
            className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
        >
            {/* Header */}
            <div className="p-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Heart size={12} className="text-red-500 fill-current" />
                    Liked by
                </h3>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400"
                >
                    <X size={14} />
                </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-60 p-1">
                {loading ? (
                    <div className="flex justify-center py-6">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    </div>
                ) : likers.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-sm italic">
                        No likes yet.
                    </div>
                ) : (
                    <div className="space-y-0.5">
                        {likers.map((like) => (
                            <div
                                key={like.user_id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onProfileClick(like.user_id, e);
                                }}
                                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                                    {like.profiles?.avatar_url ? (
                                        <img src={like.profiles.avatar_url} alt={like.profiles.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-bold text-gray-400 text-xs">
                                            {like.profiles?.full_name?.[0] || '?'}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-purple-600 transition-colors">
                                        {like.profiles?.username || like.profiles?.full_name || 'Anonymous'}
                                    </h4>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LikesListDropdown;
