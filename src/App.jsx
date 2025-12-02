import { useEffect } from 'react'
import AppRouter from './AppRouter.jsx'
import { Toaster } from 'sonner'
import InstallPrompt from './components/InstallPrompt'
import { registerServiceWorker } from './utils/pwa'

function App() {
  useEffect(() => {
    // Register service worker for PWA functionality
    registerServiceWorker()
  }, [])

  return (
    <>
      <AppRouter />
      <Toaster position="top-center" richColors />
      <InstallPrompt />
    </>
  )
}

export default App