import AppRouter from './AppRouter.jsx'
import { dailyScheduler } from './services/dailyScheduler.js'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    // Start the daily scheduler
    dailyScheduler.start()
    
    // Register service worker for background tasks
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('🔧 Service Worker registered:', registration)
          
          // Start daily scheduler in service worker
          if (registration.active) {
            registration.active.postMessage({
              type: 'START_DAILY_SCHEDULER'
            })
          }
        })
        .catch(error => {
          console.error('❌ Service Worker registration failed:', error)
        })
    }
    
    // Cleanup on unmount
    return () => {
      dailyScheduler.stop()
    }
  }, [])

  return <AppRouter />
}

export default App