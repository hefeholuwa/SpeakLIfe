import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card } from '../components/ui/card'
import { Lock, Mail, ArrowRight, Loader2, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

const AdminLogin = ({ onNavigate }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // 1. Sign in
            const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (authError) throw authError

            // 2. Check Admin Role
            // Note: 'role' column might not exist in all migrations, relying on 'is_admin'
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single()

            if (profileError) throw profileError

            if (!profile?.is_admin) {
                await supabase.auth.signOut()
                throw new Error('Unauthorized: Admin access required.')
            }

            // 3. Success
            toast.success('Welcome back, Admin!')
            onNavigate('admin')

        } catch (error) {
            console.error('Admin login error:', error)
            toast.error(error.message || 'Failed to login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl mx-auto mb-4">
                        SL
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
                    <p className="text-gray-500">Secure access for administrators only.</p>
                </div>

                <Card className="p-8 border-gray-200 shadow-lg bg-white/80 backdrop-blur-xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@speaklife.com"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin mr-2" size={20} />
                            ) : (
                                <div className="flex items-center">
                                    Access Dashboard <ArrowRight className="ml-2" size={18} />
                                </div>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                        <button
                            onClick={() => onNavigate('landing')}
                            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            ← Back to Main Site
                        </button>
                    </div>
                </Card>

                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <ShieldAlert size={14} />
                    <span>Restricted Area. All activities are logged.</span>
                </div>
            </div>
        </div>
    )
}

export default AdminLogin
