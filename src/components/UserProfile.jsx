import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
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
    X
} from 'lucide-react';

const UserProfile = () => {
    const { user, userProfile, updateProfile, signOut, refreshProfile } = useAuth();
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

    useEffect(() => {
        if (userProfile) {
            setFormData({
                full_name: userProfile.full_name || '',
                username: userProfile.username || '',
                bio: userProfile.bio || ''
            });
        } else if (user?.user_metadata) {
            setFormData({
                full_name: user.user_metadata.full_name || '',
                username: '',
                bio: ''
            });
        }
    }, [userProfile, user]);

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
            <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">My Profile</h1>
                <p className="text-gray-500">Manage your account and view your progress.</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                            {userProfile?.avatar_url ? (
                                <img
                                    src={userProfile.avatar_url}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-4xl font-bold text-gray-300">
                                    {formData.full_name?.[0]?.toUpperCase() || 'U'}
                                </span>
                            )}
                        </div>
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
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                            {formData.username ? formData.username : (formData.full_name || 'User')}
                        </h2>
                        <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2 mb-2">
                            <Mail size={16} />
                            {user?.email}
                        </p>
                        {formData.bio && (
                            <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto md:mx-0">
                                {formData.bio}
                            </p>
                        )}
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-bold border border-purple-100 flex items-center gap-1">
                                <Award size={12} />
                                {userProfile?.current_streak || 0} Day Streak
                            </span>
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
                                Free Plan
                            </span>
                            {userProfile?.is_admin && (
                                <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-bold border border-gray-800 flex items-center gap-1">
                                    <Shield size={12} />
                                    Admin
                                </span>
                            )}
                        </div>
                    </div>
                </div>

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
            </div>



            {/* Account Actions */}
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
