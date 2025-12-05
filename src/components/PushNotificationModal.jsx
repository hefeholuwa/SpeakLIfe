import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import notificationService from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

const PushNotificationModal = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Only show if user is logged in and permission is 'default' (not asked yet)
        // We can also check localStorage to see if they dismissed it recently to avoid spamming
        const hasDismissed = localStorage.getItem('push_prompt_dismissed');

        if (user &&
            'Notification' in window &&
            Notification.permission === 'default' &&
            !hasDismissed) {
            // Show after a small delay to not annoy immediately
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleEnable = async () => {
        const result = await notificationService.subscribeToPush(user.id);
        if (result) {
            setIsOpen(false);
        } else {
            // Permission denied or error
            setIsOpen(false);
        }
    };

    const handleDismiss = () => {
        setIsOpen(false);
        // Don't show again for this session (or forever, depending on preference)
        localStorage.setItem('push_prompt_dismissed', 'true');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl rounded-2xl">
                <DialogHeader className="flex flex-col items-center text-center pb-2">
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                        <Bell className="h-6 w-6 text-purple-600" />
                    </div>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        Don't Miss Out!
                    </DialogTitle>
                    <DialogDescription className="text-center pt-2 text-gray-600">
                        Get instant updates when someone likes your declaration or comments on your post. SpeakLife is better together!
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 py-4">
                    <Button
                        onClick={handleEnable}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-6 rounded-xl shadow-lg shadow-purple-200 transition-all transform hover:scale-[1.02]"
                    >
                        Enable Notifications
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleDismiss}
                        className="text-gray-400 hover:text-gray-600 font-normal"
                    >
                        Maybe Later
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PushNotificationModal;
