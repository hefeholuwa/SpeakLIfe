import AppRouter from './AppRouter.jsx'
import { Toaster } from 'sonner'

function App() {
  // Service Worker removed for hard cache cleanup


  return (
    <>
      <AppRouter />
      <Toaster position="top-center" richColors />
    </>
  )
}

export default App