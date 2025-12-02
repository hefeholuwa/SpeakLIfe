import React, { useState, useEffect } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import {
    Bell,
    Send,
    Users,
    Clock,
    CheckCircle,
    AlertTriangle,
    MessageSquare,
    RefreshCw
} from 'lucide-react'
import adminService from '../../services/adminService'
import { toast } from 'sonner'

const NotificationCenterPanel = () => {
    const [activeTab, setActiveTab] = useState('compose') // 'compose', 'history'
    const [audience, setAudience] = useState('all') // 'all', 'inactive'
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info'
    })
    const [isSending, setIsSending] = useState(false)
    const [history, setHistory] = useState([])
    const [loadingHistory, setLoadingHistory] = useState(false)

    const handleSend = async (e) => {
        e.preventDefault()
        setIsSending(true)
        try {
            if (audience === 'all') {
                await adminService.sendBroadcastNotification(formData.title, formData.message, formData.type)
                toast.success('Broadcast sent to all users!')
            } else {
                const count = await adminService.sendTargetedNotification(formData.title, formData.message, 3)
                toast.success(`Targeted message sent to ${count} inactive users!`)
            }
            setFormData({ title: '', message: '', type: 'info' })
            fetchHistory()
        } catch (error) {
            console.error('Error sending notification:', error)
            toast.error('Failed to send notification')
        } finally {
            setIsSending(false)
        }
    }

    const fetchHistory = async () => {
        setLoadingHistory(true)
        try {
            const data = await adminService.getNotificationHistory()
            setHistory(data || [])
        } catch (error) {
            console.error('Error fetching history:', error)
        } finally {
            setLoadingHistory(false)
        }
    }

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory()
        }
    }, [activeTab])

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Bell className="h-6 w-6 mr-3 text-blue-600" />
                    Notification Center
                </h2>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('compose')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'compose' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        Compose
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        History
                    </button>
                </div>
            </div>

            {activeTab === 'compose' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                            <form onSubmit={handleSend} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div
                                            onClick={() => setAudience('all')}
                                            className={`cursor-pointer p-4 border rounded-xl flex items-center space-x-3 transition-all ${audience === 'all' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <div className={`p-2 rounded-full ${audience === 'all' ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className={`font-medium ${audience === 'all' ? 'text-blue-900' : 'text-gray-900'}`}>All Users</p>
                                                <p className="text-xs text-gray-500">Send to everyone</p>
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => setAudience('inactive')}
                                            className={`cursor-pointer p-4 border rounded-xl flex items-center space-x-3 transition-all ${audience === 'inactive' ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <div className={`p-2 rounded-full ${audience === 'inactive' ? 'bg-amber-200 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                                                <Clock className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className={`font-medium ${audience === 'inactive' ? 'text-amber-900' : 'text-gray-900'}`}>Inactive Users</p>
                                                <p className="text-xs text-gray-500">Not seen in 3+ days</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder={audience === 'all' ? "New Feature Alert! 🚀" : "We miss you! 👋"}
                                        required
                                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <Textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Enter your message here..."
                                        className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="pt-4 flex items-center justify-end">
                                    <Button
                                        type="submit"
                                        disabled={isSending}
                                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md w-full md:w-auto"
                                    >
                                        {isSending ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Send Notification
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl shadow-lg">
                            <h3 className="text-lg font-bold mb-4 flex items-center">
                                <MessageSquare className="h-5 w-5 mr-2" />
                                Preview
                            </h3>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                <div className="flex items-start space-x-3">
                                    <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Bell className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{formData.title || "Notification Title"}</h4>
                                        <p className="text-sm text-gray-300 mt-1">{formData.message || "Your message will appear here..."}</p>
                                        <p className="text-xs text-gray-400 mt-2">Just now</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-4 text-center">
                                This is how the notification will appear in the user's inbox.
                            </p>
                        </Card>

                        <Card className="p-6 bg-blue-50 border border-blue-100 rounded-xl">
                            <h4 className="font-bold text-blue-900 mb-2 flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Best Practices
                            </h4>
                            <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                                <li>Keep titles short and catchy (under 40 chars).</li>
                                <li>Use emojis to increase engagement 🚀.</li>
                                <li>Avoid sending more than 1 broadcast per week.</li>
                                <li>Targeted messages have 3x higher open rates.</li>
                            </ul>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Sent Notifications</h3>
                        <Button onClick={fetchHistory} variant="ghost" size="sm">
                            <RefreshCw className={`h-4 w-4 ${loadingHistory ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>

                    {history.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>No notifications sent yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {history.map((item) => (
                                <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start space-x-3">
                                            <div className={`p-2 rounded-full ${item.is_global ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {item.is_global ? <Users className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{item.title}</h4>
                                                <p className="text-gray-600 mt-1">{item.message}</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_global ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {item.is_global ? 'Broadcast' : 'Targeted'}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(item.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {item.is_global && (
                                            <div className="flex items-center text-green-600 text-sm font-medium">
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Sent
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}
        </div>
    )
}

export default NotificationCenterPanel
