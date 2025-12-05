import React, { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Clock, Info, AlertTriangle, CheckCircle, MessageCircle, Heart } from 'lucide-react'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import notificationService from '../services/notificationService'
import { useAuth } from '../contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '../supabaseClient'

const NotificationInbox = ({ onNotificationClick }) => {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [pushEnabled, setPushEnabled] = useState(Notification.permission === 'granted')

    const handleEnablePush = async () => {
        const success = await notificationService.subscribeToPush(user.id);
        if (success) {
            setPushEnabled(true);
            // toast.success('Push notifications enabled!'); 
        }
    };


    const fetchNotifications = async () => {
        if (!user) return
        setLoading(true)
        try {
            const data = await notificationService.getUserNotifications(user.id)
            setNotifications(data)
            setUnreadCount(data.filter(n => !n.is_read).length)
        } catch (error) {
            console.error('Failed to fetch notifications', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchNotifications()

            // Realtime subscription
            const subscription = supabase
                .channel(`notifications:${user.id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                }, payload => {
                    setNotifications(prev => [payload.new, ...prev]);
                    setUnreadCount(prev => prev + 1);
                })
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [user])

    const handleMarkAsRead = async (notificationId) => {
        if (!user) return

        // Optimistic update
        setNotifications(prev => prev.map(n =>
            n.id === notificationId ? { ...n, is_read: true } : n
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))

        await notificationService.markAsRead(user.id, notificationId)
    }

    const handleMarkAllAsRead = async () => {
        if (!user) return

        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
        if (unreadIds.length === 0) return

        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)

        await notificationService.markAllAsRead(user.id, unreadIds)
    }

    const getIcon = (type, metadata) => {
        if (metadata?.type === 'like') return <Heart className="h-4 w-4 text-red-500 fill-current" />
        if (metadata?.type === 'comment') return <MessageCircle className="h-4 w-4 text-blue-500 fill-current" />

        switch (type) {
            case 'alert': return <AlertTriangle className="h-4 w-4 text-amber-500" />
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
            default: return <Info className="h-4 w-4 text-blue-500" />
        }
    }

    const handleItemClick = (notification) => {
        if (!notification.is_read) {
            handleMarkAsRead(notification.id);
        }
        setIsOpen(false);
        onNotificationClick?.(notification);
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl hover:bg-purple-100 transition-all duration-300">
                    <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 sm:w-96 bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl rounded-xl sm:rounded-2xl p-0 z-50" align="end">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-blue-600 hover:text-blue-700 h-auto py-1 px-2"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {loading && notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                            <p className="text-sm">Loading...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Bell className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 transition-colors relative group cursor-pointer ${!notification.is_read ? 'bg-blue-50/50' : ''}`}
                                    onClick={() => handleItemClick(notification)}
                                >
                                    <div className="flex gap-3">
                                        <div className={`mt-1 p-1.5 rounded-full flex-shrink-0 ${!notification.is_read ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                                            {getIcon(notification.type, notification.metadata)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                    {notification.title}
                                                </p>
                                                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                                {notification.message}
                                            </p>
                                        </div>
                                        {!notification.is_read && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full hover:bg-blue-100 text-blue-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleMarkAsRead(notification.id)
                                                    }}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {!pushEnabled && (
                    <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                        <Button
                            variant="outline"
                            className="w-full text-xs h-8 gap-2 bg-white hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all shadow-sm"
                            onClick={handleEnablePush}
                        >
                            <Bell className="h-3 w-3" />
                            Enable Push Notifications
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default NotificationInbox
