import AppRouter from './AppRouter.jsx'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    // Register service worker for background tasks
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
        })
        .catch(error => {
          console.error('❌ Service Worker registration failed:', error)
        })
    }
  }, [])

  return <AppRouter />
}

export default App