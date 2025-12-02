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
const VAPID_PUBLIC_KEY = 'BHUarl8psRYk5RQ5RxGlM1Yi8v7gcuT3hup7uzmVlcyLtjIh2vGpLxxAudFPHCf7Kt8cxZpjp4tbe56kvRyOhqM';

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
    console.log('🔔 Starting subscription process...');

    if (!('serviceWorker' in navigator)) {
        console.error('❌ Service Worker not supported');
        return false;
    }
    if (!('PushManager' in window)) {
        console.error('❌ PushManager not supported');
        return false;
    }

    try {
        // 1. Wait for Service Worker Ready (with timeout)
        console.log('⏳ Waiting for Service Worker ready...');

        const swReadyPromise = navigator.serviceWorker.ready;
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Service Worker ready timeout')), 5000)
        );

        const registration = await Promise.race([swReadyPromise, timeoutPromise]);
        console.log('✅ Service Worker is ready:', registration.scope);

        let subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            console.log('✅ Already subscribed in browser:', subscription.endpoint);
        } else {
            // 3. Subscribe if not exists
            console.log('🔑 Converting VAPID key...');
            const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

            console.log('📡 Requesting push subscription...');
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });
            console.log('✅ Got new subscription endpoint:', subscription.endpoint);
        }

        // 4. Save to database (ALWAYS)
        console.log('💾 Saving to database...');
        const { keys } = subscription.toJSON();

        const { error } = await supabase
            .from('push_subscriptions')
            .upsert({
                user_id: userId,
                endpoint: subscription.endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
                user_agent: navigator.userAgent
            }, { onConflict: 'endpoint' });

        if (error) {
            console.error('❌ Database Error:', error.message);
            return `Database Error: ${error.message}`;
        }

        console.log('✅ Successfully subscribed!');
        return true;

    } catch (error) {
        console.error('❌ Subscription failed:', error);

        if (error.message === 'Service Worker ready timeout') {
            console.error('💡 Tip: Try reloading the page. The Service Worker might not be active yet.');
            return 'Service Worker timeout. Reload page.';
        }

        return `Error: ${error.message}`;
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
