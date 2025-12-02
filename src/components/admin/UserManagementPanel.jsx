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
    X,
    ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'

const UserManagementPanel = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUser, setSelectedUser] = useState(null)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [activePlan, setActivePlan] = useState(null)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [])

    useEffect(() => {
        if (selectedUser) {
            fetchUserActivePlan(selectedUser.id)
        } else {
            setActivePlan(null)
        }
    }, [selectedUser])

    const fetchUserActivePlan = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('user_plan_progress')
                .select(`
                    plan_id,
                    completed_at,
                    reading_plans (
                        title
                    )
                `)
                .eq('user_id', userId)
                .order('completed_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (error) throw error

            if (data && data.reading_plans) {
                setActivePlan(data.reading_plans.title)
            } else {
                setActivePlan(null)
            }
        } catch (error) {
            console.error('Error fetching user active plan:', error)
            setActivePlan(null)
        }
    }

    const fetchUsers = async () => {
        try {
            setLoading(true)
            console.log('Fetching users...')
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('updated_at', { ascending: false })

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

    const updateUserRole = async (userId, newRole) => {
        try {
            setActionLoading(true)
            const { error } = await supabase
                .from('profiles')
                .update({ is_admin: newRole === 'admin' }) // Only update is_admin
                .eq('id', userId)

            if (error) throw error

            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole, is_admin: newRole === 'admin' } : u))
            if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, role: newRole, is_admin: newRole === 'admin' })

            toast.success(`User role updated to ${newRole}`)
        } catch (error) {
            console.error('Error updating role:', error)
            toast.error('Failed to update user role')
        } finally {
            setActionLoading(false)
        }
    }

    const isUserOnline = (lastSeen) => {
        if (!lastSeen) return false
        const lastSeenDate = new Date(lastSeen)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
        return lastSeenDate > fiveMinutesAgo
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
            ) : selectedUser ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-right-4">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-xl">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)} className="gap-2">
                                <ArrowLeft size={16} /> Back to List
                            </Button>
                            <div className="h-6 w-px bg-gray-200"></div>
                            <h3 className="text-xl font-bold text-gray-900">User Profile</h3>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Header Info */}
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-3xl shrink-0">
                                {selectedUser.avatar_url ? (
                                    <img src={selectedUser.avatar_url} alt={selectedUser.full_name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    (selectedUser.full_name?.[0] || selectedUser.email?.[0] || 'U').toUpperCase()
                                )}
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-gray-900">{selectedUser.full_name || 'Unnamed User'}</h2>
                                <p className="text-gray-500 flex items-center gap-2 mt-2 text-lg">
                                    <Mail size={18} /> {selectedUser.email}
                                </p>
                                <div className="flex items-center gap-3 mt-4">
                                    <Badge variant={selectedUser.is_admin ? 'default' : 'secondary'} className={selectedUser.is_admin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}>
                                        {selectedUser.is_admin ? 'Admin' : 'User'}
                                    </Badge>
                                    <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">ID: {selectedUser.id}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-2 text-gray-500 mb-2 text-xs font-bold uppercase tracking-wider">
                                    <Award size={14} /> Streak
                                </div>
                                <div className="text-3xl font-black text-gray-900">{selectedUser.current_streak || 0}</div>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-2 text-gray-500 mb-2 text-xs font-bold uppercase tracking-wider">
                                    <Calendar size={14} /> Joined
                                </div>
                                <div className="text-lg font-bold text-gray-900">{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}</div>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-2 text-gray-500 mb-2 text-xs font-bold uppercase tracking-wider">
                                    <Clock size={14} /> Last Active
                                </div>
                                <div className="text-lg font-bold text-gray-900">
                                    {selectedUser.last_seen_at ? new Date(selectedUser.last_seen_at).toLocaleDateString() : 'Never'}
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-2 text-gray-500 mb-2 text-xs font-bold uppercase tracking-wider">
                                    <BookOpen size={14} /> Plan
                                </div>
                                <div className="text-sm font-bold text-gray-900 truncate">
                                    {activePlan || 'None'}
                                </div>
                            </div>
                        </div>

                        {/* Admin Actions */}
                        <div className="pt-8 border-t border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                                <Shield size={20} /> Admin Actions
                            </h4>
                            <div className="flex flex-wrap gap-4">
                                {!selectedUser.is_admin && (
                                    <Button
                                        onClick={() => updateUserRole(selectedUser.id, 'admin')}
                                        disabled={actionLoading}
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                    >
                                        Promote to Admin
                                    </Button>
                                )}
                                {selectedUser.is_admin && (
                                    <Button
                                        onClick={() => updateUserRole(selectedUser.id, 'user')}
                                        disabled={actionLoading}
                                        variant="outline"
                                        className="border-gray-200 text-gray-700 hover:bg-gray-50"
                                    >
                                        Demote to User
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
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
                                    filteredUsers.map((user) => {
                                        const online = isUserOnline(user.last_seen_at)
                                        return (
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
                                                    <Badge variant={user.is_admin ? 'default' : 'secondary'} className={user.is_admin ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-gray-100 text-gray-600'}>
                                                        {user.is_admin ? 'Admin' : 'User'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                        <span className={`text-sm ${online ? 'text-green-600' : 'text-gray-600'}`}>{online ? 'Online' : 'Offline'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                                                        View Details
                                                    </Button>
                                                </td>
                                            </tr>
                                        )
                                    })
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
        </div>
    )
}

export default UserManagementPanel
