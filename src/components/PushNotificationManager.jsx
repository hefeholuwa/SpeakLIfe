import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { toast } from 'sonner';
import { subscribeToPushNotifications } from '../utils/pwa';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';

const PushNotificationManager = () => {
    const { user } = useAuth();
    const [permission, setPermission] = useState(Notification.permission);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show if permission is 'default' (not asked yet) or 'granted' but not subscribed
        // Don't show if 'denied'
        if (permission === 'default') {
            // Wait a bit before showing
            const timer = setTimeout(() => setIsVisible(true), 3000);
            return () => clearTimeout(timer);
        }
    }, [permission]);

    const handleEnable = async () => {
        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                toast.promise(
                    subscribeToPushNotifications(user.id, supabase),
                    {
                        loading: 'Enabling notifications...',
                        success: (success) => {
                            if (success) {
                                setIsVisible(false);
                                return 'Notifications enabled! You\'ll receive daily inspiration.';
                            } else {
                                return 'Failed to subscribe. Please try again.';
                            }
                        },
                        error: 'Something went wrong.'
                    }
                );
            } else {
                toast.error('Notifications blocked. Please enable them in browser settings.');
                setIsVisible(false);
            }
        } catch (error) {
            console.error('Error enabling notifications:', error);
        }
    };

    if (!isVisible || permission === 'denied' || permission === 'granted') return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 bg-white rounded-2xl shadow-2xl border border-purple-100 p-4 z-50 animate-fade-in-up">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                    <Bell size={24} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900">Enable Daily Reminders?</h3>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 mb-3">
                        Get your daily verse, confession, and streak reminders delivered to your device.
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsVisible(false)}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                        >
                            Maybe Later
                        </button>
                        <button
                            onClick={handleEnable}
                            className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
                        >
                            Enable
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PushNotificationManager;
