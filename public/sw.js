// Service Worker for automated daily content generation
const CACHE_NAME = 'speaklife-v1'
const DAILY_GENERATION_TIME = 7 * 60 * 60 * 1000 // 7 AM in milliseconds

// Install event
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activated')
  event.waitUntil(self.clients.claim())
})

// Background sync for daily generation
self.addEventListener('sync', (event) => {
  if (event.tag === 'daily-generation') {
    console.log('⏰ Daily generation sync triggered')
    event.waitUntil(triggerDailyGeneration())
  }
})

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-content') {
    console.log('📅 Periodic sync for daily content')
    event.waitUntil(triggerDailyGeneration())
  }
})

// Trigger daily generation
async function triggerDailyGeneration() {
  try {
    console.log('🤖 Triggering daily content generation...')
    
    // Send message to main thread to trigger generation
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'TRIGGER_DAILY_GENERATION'
      })
    })
    
    console.log('✅ Daily generation triggered successfully')
  } catch (error) {
    console.error('❌ Error triggering daily generation:', error)
  }
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data.type === 'START_DAILY_SCHEDULER') {
    console.log('📅 Starting daily scheduler in service worker')
    scheduleDailyGeneration()
  }
})

// Schedule daily generation at 7 AM
function scheduleDailyGeneration() {
  const now = new Date()
  const next7AM = new Date(now)
  next7AM.setHours(7, 0, 0, 0)
  
  // If it's already past 7 AM today, schedule for tomorrow
  if (now.getHours() >= 7) {
    next7AM.setDate(next7AM.getDate() + 1)
  }
  
  const timeUntil7AM = next7AM.getTime() - now.getTime()
  
  console.log(`⏰ Next daily generation scheduled for: ${next7AM.toLocaleString()}`)
  
  setTimeout(() => {
    triggerDailyGeneration()
    // Schedule next day
    scheduleDailyGeneration()
  }, timeUntil7AM)
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    console.log('📱 Push notification received:', data)
    
    const options = {
      body: data.body || 'Your daily spiritual content is ready!',
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'daily-content',
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Open App'
        }
      ]
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'SpeakLife', options)
    )
  }
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'open') {
    event.waitUntil(
      self.clients.openWindow('/')
    )
  }
})