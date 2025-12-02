import { useEffect } from 'react'
import AppRouter from './AppRouter.jsx'
import { Toaster, toast } from 'sonner'
import InstallPrompt from './components/InstallPrompt'
import { registerServiceWorker } from './utils/pwa'
import { Sparkles, RefreshCw } from 'lucide-react'

function App() {
  useEffect(() => {
    // Register service worker with custom update handler
    registerServiceWorker((registration) => {
      toast.custom((t) => (
        <div className="bg-white p-4 rounded-2xl shadow-2xl border border-purple-100 flex items-center gap-4 w-full max-w-md animate-fade-in-up">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
            <Sparkles size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900">Update Available</h3>
            <p className="text-sm text-gray-500">A new version of SpeakLife is ready!</p>
          </div>
          <button
            onClick={() => {
              toast.dismiss(t)
              window.location.reload()
            }}
            className="bg-gray-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg shadow-gray-900/20"
          >
            <RefreshCw size={16} />
            Update
          </button>
        </div>
      ), {
        duration: Infinity, // Don't auto-dismiss
        position: 'bottom-center'
      })
    })
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