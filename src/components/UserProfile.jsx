import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { badgeService } from '../services/badgeService';
import {
    User,
    Mail,
    Camera,
    Save,
    Shield,
    LogOut,
    Award,
    Calendar,
    BookOpen,
    PenTool,
    ChevronRight,
    Loader2,
    X,
    ArrowLeft
} from 'lucide-react';

const UserProfile = ({ viewUserId, onBack }) => {
    const { user, userProfile: currentUserProfile, updateProfile, signOut, refreshProfile } = useAuth();
    const isOwnProfile = !viewUserId || (user && viewUserId === user.id);
    const [displayProfile, setDisplayProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        bio: ''
    });
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [badges, setBadges] = useState([]);

    useEffect(() => {
        if (isOwnProfile) {
            if (currentUserProfile) {
                setDisplayProfile(currentUserProfile);
                setFormData({
                    full_name: currentUserProfile.full_name || '',
                    username: currentUserProfile.username || '',
                    bio: currentUserProfile.bio || ''
                });
            } else if (user?.user_metadata) {
                setFormData({
                    full_name: user.user_metadata.full_name || '',
                    username: '',
                    bio: ''
                });
            }
            if (user) loadBadges(user.id);
        } else {
            // Fetch other user's profile
            fetchOtherUserProfile(viewUserId);
        }
    }, [viewUserId, user, currentUserProfile, isOwnProfile]);

    const fetchOtherUserProfile = async (userId) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            setDisplayProfile(data);
            loadBadges(userId);
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Could not load profile');
        } finally {
            setLoading(false);
        }
    };

    const loadBadges = async (userId) => {
        try {
            const userBadges = await badgeService.getUserBadges(userId);
            setBadges(userBadges);
        } catch (error) {
            console.error('Error loading badges:', error);
        }
    };

    // Removed redundant useEffect since logic is merged above

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updates = {
                id: user.id,
                full_name: formData.full_name,
                username: formData.username,
                bio: formData.bio,
                email: user.email, // Required for creating new profile if it doesn't exist
                updated_at: new Date(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) throw error;

            // Also update auth metadata
            await updateProfile({
                data: { full_name: formData.full_name }
            });

            // Refresh global profile state
            await refreshProfile();

            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (error) throw error;

            toast.success('Password updated successfully');
            setShowPrivacyModal(false);
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error(error.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (event) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];

            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                throw new Error('Image must be smaller than 2MB.');
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
                throw new Error('You can only upload image files.');
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const updates = {
                id: user.id,
                avatar_url: publicUrl,
                updated_at: new Date(),
            };

            const { error: updateError } = await supabase.from('profiles').upsert(updates);

            if (updateError) throw updateError;

            // Update local state immediately
            await updateProfile({
                data: { ...user.user_metadata } // Trigger a refresh
            });

            toast.success('Avatar updated!');
        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error(error.message || 'Error uploading avatar');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                {!isOwnProfile && (
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                )}
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">
                        {isOwnProfile ? 'My Profile' : (displayProfile?.username || 'Profile')}
                    </h1>
                    <p className="text-gray-500">
                        {isOwnProfile ? 'Manage your account and view your progress.' : 'View community member profile.'}
                    </p>
                </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                            {displayProfile?.avatar_url ? (
                                <img
                                    src={displayProfile.avatar_url}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-4xl font-bold text-gray-300">
                                    {displayProfile?.full_name?.[0]?.toUpperCase() || 'U'}
                                </span>
                            )}
                        </div>
                        {isOwnProfile && (
                            <>
                                <label className="absolute bottom-0 right-0 bg-gray-900 text-white p-2.5 rounded-full cursor-pointer hover:bg-gray-800 transition-colors shadow-lg" htmlFor="avatar-upload">
                                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                                </label>
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </>
                        )}
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                            {displayProfile?.username || displayProfile?.full_name || 'User'}
                        </h2>
                        <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2 mb-2">
                            {isOwnProfile && <Mail size={16} />}
                            {isOwnProfile && user?.email}
                        </p>
                        {displayProfile?.bio && (
                            <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto md:mx-0">
                                {displayProfile.bio}
                            </p>
                        )}
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-bold border border-purple-100 flex items-center gap-1">
                                <Award size={12} />
                                {displayProfile?.current_streak || 0} Day Streak
                            </span>
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
                                Free Plan
                            </span>
                            {displayProfile?.is_admin && (
                                <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-bold border border-gray-800 flex items-center gap-1">
                                    <Shield size={12} />
                                    Admin
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {isOwnProfile && (
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 focus:ring-0 rounded-xl transition-all font-medium"
                                        placeholder="Your Name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Username</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 focus:ring-0 rounded-xl transition-all font-medium"
                                        placeholder="username"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Bio</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 focus:ring-0 rounded-xl transition-all font-medium min-h-[100px] resize-none"
                                placeholder="Tell us a bit about your spiritual journey..."
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-gray-900/20"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}
            </div>



            {/* Badges Section */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Badges & Achievements</h3>
                    <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                        {badges.length} Earned
                    </span>
                </div>
                <div className="p-6">
                    {badges.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {badges.map(badge => (
                                <div key={badge.id} className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-2xl">
                                        {/* Map icon name to emoji or Lucide icon */}
                                        {badge.icon_name === 'Trophy' ? '🏆' :
                                            badge.icon_name === 'Star' ? '⭐' :
                                                badge.icon_name === 'Flame' ? '🔥' :
                                                    badge.icon_name === 'Footprints' ? '👣' :
                                                        badge.icon_name === 'Scroll' ? '📜' :
                                                            badge.icon_name === 'HandsPraying' ? '🙏' : '🏅'}
                                    </div>
                                    <h4 className="font-bold text-gray-900 text-sm">{badge.name}</h4>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{badge.description}</p>
                                    <span className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wide">
                                        {new Date(badge.awarded_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                                <Award size={24} />
                            </div>
                            <p className="font-medium">No badges yet</p>
                            <p className="text-xs mt-1">Complete challenges to earn them!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Account Actions */}
            {isOwnProfile && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900">Account Settings</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        <button
                            onClick={() => setShowPrivacyModal(true)}
                            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Privacy & Security</p>
                                    <p className="text-sm text-gray-500">Manage your password and security settings</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-gray-300" />
                        </button>
                        <button
                            onClick={signOut}
                            className="w-full flex items-center justify-between p-6 hover:bg-red-50 transition-colors text-left group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                                    <LogOut size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-red-600">Sign Out</p>
                                    <p className="text-sm text-red-400">Log out of your account on this device</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-red-200 group-hover:text-red-300" />
                        </button>
                    </div>
                </div>
            )}
            {/* Privacy Section (Inline) */}
            {showPrivacyModal && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-4 animate-fade-in-up">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Shield size={18} className="text-purple-600" />
                            Change Password
                        </h3>
                        <button
                            onClick={() => setShowPrivacyModal(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 focus:ring-0 rounded-xl transition-all font-medium"
                                    placeholder="Min. 6 characters"
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 focus:ring-0 rounded-xl transition-all font-medium"
                                    placeholder="Re-enter new password"
                                    minLength={6}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
