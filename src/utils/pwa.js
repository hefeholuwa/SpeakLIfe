// Service Worker Registration
export function registerServiceWorker(onUpdate) {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('✅ Service Worker registered successfully:', registration.scope);

                    // Check for updates periodically
                    setInterval(() => {
                        registration.update();
                    }, 60000); // Check every minute

                    // Listen for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;

                        newWorker?.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New service worker available
                                if (onUpdate) {
                                    onUpdate(registration);
                                }
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.error('❌ Service Worker registration failed:', error);
                });
        });
    }
}

// Request notification permission
export async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
        return permission === 'granted';
    }
    return false;
}

// Show install prompt
let deferredPrompt;

export function setupInstallPrompt(onInstallReady) {
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();

        // Store the event for later use
        deferredPrompt = e;

        // Notify the app that install is available
        if (onInstallReady) {
            onInstallReady(showInstallPrompt);
        }

        console.log('💡 Install prompt is ready');
    });

    // Track if app was successfully installed
    window.addEventListener('appinstalled', () => {
        console.log('✅ PWA was installed');
        deferredPrompt = null;
    });
}

export async function showInstallPrompt() {
    if (!deferredPrompt) {
        console.log('Install prompt not available');
        return false;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response to install prompt: ${outcome}`);

    // Clear the deferred prompt
    deferredPrompt = null;

    return outcome === 'accepted';
}

// Check if app is installed
export function isAppInstalled() {
    // Check if running in standalone mode
    return window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
}

// VAPID Public Key
const VAPID_PUBLIC_KEY = 'BI2P8Xe2ybnaqVQIcXdxltkv0RZ6I9_0JGIlQbngRzHuj7bVRjUxYazTB6qLnkjJ1qKPf6MXvowqAsVFh3YOERo';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export async function subscribeToPushNotifications(userId, supabase) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push notifications not supported');
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;

        // Check if already subscribed
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
            console.log('Already subscribed to push notifications');
            return true;
        }

        const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        console.log('🔑 VAPID Key length:', convertedVapidKey.length); // Should be 65

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
        });

        console.log('✅ Got subscription endpoint:', subscription.endpoint);

        // Save to database
        const { keys } = subscription.toJSON();

        const { error } = await supabase
            .from('push_subscriptions')
            .insert({
                user_id: userId,
                endpoint: subscription.endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
                user_agent: navigator.userAgent
            });

        if (error) {
            console.error('Error saving subscription:', error);
            // Optional: Unsubscribe if DB save fails to keep state in sync
            // await subscription.unsubscribe();
            return false;
        }

        console.log('✅ Subscribed to push notifications!');
        return true;

    } catch (error) {
        console.error('❌ Failed to subscribe to push notifications:', error);

        if (error.name === 'NotAllowedError') {
            console.error('Permission denied by user.');
        } else if (error.message.includes('push service error')) {
            console.error('Push service error. This often happens in private/incognito windows, or if the browser push service is blocked.');
        }

        return false;
    }
}

// Get install instructions based on device
export function getInstallInstructions() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
        return {
            platform: 'iOS',
            steps: [
                'Tap the Share button (square with arrow)',
                'Scroll down and tap "Add to Home Screen"',
                'Tap "Add" in the top right corner'
            ]
        };
    }

    if (isAndroid) {
        return {
            platform: 'Android',
            steps: [
                'Tap the menu button (three dots)',
                'Tap "Install app" or "Add to Home screen"',
                'Tap "Install" to confirm'
            ]
        };
    }

    return {
        platform: 'Desktop',
        steps: [
            'Click the install icon in the address bar',
            'Or click the menu and select "Install SpeakLife"'
        ]
    };
}
