import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import {
    Users,
    Search,
    MoreVertical,
    Shield,
    Ban,
    CheckCircle,
    Clock,
    Mail,
    Calendar,
    Award,
    BookOpen,
    Loader2,
    X
} from 'lucide-react'
import { toast } from 'sonner'

const UserManagementPanel = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUser, setSelectedUser] = useState(null)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            console.log('Fetching users...')
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Supabase error fetching users:', error)
                throw error
            }
            console.log('Users fetched:', data)
            setUsers(data || [])
        } catch (error) {
            console.error('Error fetching users:', error)
            toast.error('Failed to load users: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
    }

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const openUserDetails = async (user) => {
        setSelectedUser(user)
        setShowDetailsModal(true)
        // Here you could fetch additional details like reading plan progress if needed
    }

    const updateUserRole = async (userId, newRole) => {
        try {
            setActionLoading(true)
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId)

            if (error) throw error

            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
            if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, role: newRole })

            toast.success(`User role updated to ${newRole}`)
        } catch (error) {
            console.error('Error updating role:', error)
            toast.error('Failed to update user role')
        } finally {
            setActionLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                    <p className="text-gray-500">View and manage registered users.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="pl-10"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-purple-600" size={32} />
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-sm">User</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Role</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Status</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Joined</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                                        {user.avatar_url ? (
                                                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            (user.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{user.full_name || 'Unnamed User'}</div>
                                                        <div className="text-xs text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className={user.role === 'admin' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-gray-100 text-gray-600'}>
                                                    {user.role || 'user'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${user.last_activity_date ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                    <span className="text-sm text-gray-600">{user.last_activity_date ? 'Active' : 'Inactive'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" onClick={() => openUserDetails(user)}>
                                                    View Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No users found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* User Details Modal */}
            {showDetailsModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold text-gray-900">User Profile</h3>
                            <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Header Info */}
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-3xl">
                                    {selectedUser.avatar_url ? (
                                        <img src={selectedUser.avatar_url} alt={selectedUser.full_name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        (selectedUser.full_name?.[0] || selectedUser.email?.[0] || 'U').toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedUser.full_name || 'Unnamed User'}</h2>
                                    <p className="text-gray-500 flex items-center gap-2 mt-1">
                                        <Mail size={16} /> {selectedUser.email}
                                    </p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <Badge className="bg-purple-100 text-purple-700">
                                            {selectedUser.role || 'user'}
                                        </Badge>
                                        <span className="text-xs text-gray-400">ID: {selectedUser.id}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs font-bold uppercase tracking-wider">
                                        <Award size={14} /> Streak
                                    </div>
                                    <div className="text-2xl font-black text-gray-900">{selectedUser.current_streak || 0}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs font-bold uppercase tracking-wider">
                                        <Calendar size={14} /> Joined
                                    </div>
                                    <div className="text-lg font-bold text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString()}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs font-bold uppercase tracking-wider">
                                        <Clock size={14} /> Last Active
                                    </div>
                                    <div className="text-lg font-bold text-gray-900">
                                        {selectedUser.last_activity_date ? new Date(selectedUser.last_activity_date).toLocaleDateString() : 'Never'}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs font-bold uppercase tracking-wider">
                                        <BookOpen size={14} /> Plan
                                    </div>
                                    <div className="text-sm font-bold text-gray-900 truncate">
                                        {/* Placeholder for active plan */}
                                        None
                                    </div>
                                </div>
                            </div>

                            {/* Admin Actions */}
                            <div className="pt-6 border-t border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Shield size={18} /> Admin Actions
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    {selectedUser.role !== 'admin' && (
                                        <Button
                                            onClick={() => updateUserRole(selectedUser.id, 'admin')}
                                            disabled={actionLoading}
                                            variant="outline"
                                            className="border-purple-200 text-purple-700 hover:bg-purple-50"
                                        >
                                            Promote to Admin
                                        </Button>
                                    )}
                                    {selectedUser.role === 'admin' && (
                                        <Button
                                            onClick={() => updateUserRole(selectedUser.id, 'user')}
                                            disabled={actionLoading}
                                            variant="outline"
                                            className="border-gray-200 text-gray-700 hover:bg-gray-50"
                                        >
                                            Demote to User
                                        </Button>
                                    )}
                                    {/* Add Ban/Reset Password buttons here later */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserManagementPanel
