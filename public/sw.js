// Service Worker for SpeakLife App
// Handles background notifications and offline functionality

const CACHE_NAME = 'speaklife-v2';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/sl-icon.ico',
  '/sl-icon.svg',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch((error) => {
        console.error('Service Worker: Fetch failed', error);
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      data = { title: 'SpeakLife', body: event.data.text() };
    }
  }

  const options = {
    body: data.body || 'You have a new notification from SpeakLife',
    icon: '/sl-icon.ico',
    badge: '/sl-icon.ico',
    tag: data.tag || 'speaklife-notification',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      {
        action: 'open',
        title: 'Open App',
        icon: '/sl-icon.ico'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/sl-icon.ico'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'SpeakLife', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else if (event.action === 'read') {
    // Open Bible section
    event.waitUntil(
      clients.openWindow('/#/bible')
    );
  } else if (event.action === 'confess') {
    // Open confession section
    event.waitUntil(
      clients.openWindow('/#/confessions')
    );
  } else if (event.action === 'view') {
    // Open dashboard
    event.waitUntil(
      clients.openWindow('/#/dashboard')
    );
  }
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'confession-sync') {
    event.waitUntil(syncConfessions());
  } else if (event.tag === 'bookmark-sync') {
    event.waitUntil(syncBookmarks());
  } else if (event.tag === 'highlight-sync') {
    event.waitUntil(syncHighlights());
  }
});

// Sync confessions when back online
async function syncConfessions() {
  try {
    // Get pending confessions from IndexedDB
    const pendingConfessions = await getPendingConfessions();
    
    for (const confession of pendingConfessions) {
      try {
        // Send to server
        await fetch('/api/confessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(confession)
        });
        
        // Remove from pending
        await removePendingConfession(confession.id);
      } catch (error) {
        console.error('Failed to sync confession:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Sync bookmarks when back online
async function syncBookmarks() {
  try {
    const pendingBookmarks = await getPendingBookmarks();
    
    for (const bookmark of pendingBookmarks) {
      try {
        await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookmark)
        });
        
        await removePendingBookmark(bookmark.id);
      } catch (error) {
        console.error('Failed to sync bookmark:', error);
      }
    }
  } catch (error) {
    console.error('Bookmark sync failed:', error);
  }
}

// Sync highlights when back online
async function syncHighlights() {
  try {
    const pendingHighlights = await getPendingHighlights();
    
    for (const highlight of pendingHighlights) {
      try {
        await fetch('/api/highlights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(highlight)
        });
        
        await removePendingHighlight(highlight.id);
      } catch (error) {
        console.error('Failed to sync highlight:', error);
      }
    }
  } catch (error) {
    console.error('Highlight sync failed:', error);
  }
}

// IndexedDB helper functions (simplified)
async function getPendingConfessions() {
  // Implementation would use IndexedDB
  return [];
}

async function removePendingConfession(id) {
  // Implementation would use IndexedDB
}

async function getPendingBookmarks() {
  // Implementation would use IndexedDB
  return [];
}

async function removePendingBookmark(id) {
  // Implementation would use IndexedDB
}

async function getPendingHighlights() {
  // Implementation would use IndexedDB
  return [];
}

async function removePendingHighlight(id) {
  // Implementation would use IndexedDB
}

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync', event.tag);
  
  if (event.tag === 'daily-verse-sync') {
    event.waitUntil(syncDailyVerse());
  }
});

async function syncDailyVerse() {
  try {
    // Fetch daily verse and confession
    const response = await fetch('/api/daily-content');
    const data = await response.json();
    
    // Show notification
    await self.registration.showNotification('📖 Daily Verse - SpeakLife', {
      body: `${data.verse}\n\n${data.confession}`,
      icon: '/sl-icon.ico',
      tag: 'daily-verse',
      requireInteraction: true
    });
  } catch (error) {
    console.error('Daily verse sync failed:', error);
  }
}