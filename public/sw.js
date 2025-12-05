const CACHE_NAME = 'speaklife-v3';
const STATIC_CACHE = 'speaklife-static-v2';
const DYNAMIC_CACHE = 'speaklife-dynamic-v2';

// Assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/offline.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[Service Worker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch((error) => {
                console.error('[Service Worker] Cache failed:', error);
            })
    );

    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
                    .map((name) => {
                        console.log('[Service Worker] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );

    return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 1. Handle Supabase API requests - Network Only
    if (url.hostname.includes('supabase.co')) {
        return; // Let browser handle it (no caching)
    }

    // 2. Handle Navigation requests (HTML) - Network First with timeout, then Cache, then Offline
    if (request.mode === 'navigate') {
        event.respondWith(
            Promise.race([
                fetch(request),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Network timeout')), 2000)
                )
            ])
                .catch(() => {
                    return caches.match('/index.html')
                        .then((response) => {
                            if (response) return response;
                            return caches.match('/offline.html');
                        });
                })
        );
        return;
    }

    // 3. Handle Static Assets (JS, CSS, Images) - Stale-While-Revalidate
    // This means serve from cache immediately, but update cache in background
    if (request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'image') {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                const fetchPromise = fetch(request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(DYNAMIC_CACHE).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return networkResponse;
                });
                return cachedResponse || fetchPromise;
            })
        );
        return;
    }

    // 4. Default Strategy - Cache First, Fallback to Network
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request)
                    .then((response) => {
                        // Don't cache if not a success response or cross-origin
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // If image fails, return placeholder?
                        // For now just fail
                    });
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);

    if (event.tag === 'sync-data') {
        event.waitUntil(syncOfflineData());
    }
});

async function syncOfflineData() {
    // Implement your sync logic here
    console.log('[Service Worker] Syncing offline data...');
}

// Push notifications
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.message || data.body,
            icon: '/sl-icon.ico',
            badge: '/sl-icon.ico',
            data: {
                url: data.action_url || data.url || '/',
                ...data.metadata
            },
            // Actions like "Reply" can be added here
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'SpeakLife', options)
        );
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Check if there is already a window open with this URL
                for (let client of windowClients) {
                    // Check base URL match
                    const clientUrl = new URL(client.url);
                    if (clientUrl.pathname === targetUrl || (targetUrl === '/community' && clientUrl.pathname.includes('community'))) {
                        return client.focus().then(c => {
                            // Send message to client to navigate within SPA
                            c.postMessage({ type: 'NAVIGATE', url: targetUrl, metadata: event.notification.data });
                            return c;
                        });
                    }
                }
                // If no window is open, open a new one
                return clients.openWindow(targetUrl);
            })
    );
});
