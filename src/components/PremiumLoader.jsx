import React from 'react'
import { Loader2 } from 'lucide-react'

const PremiumLoader = ({ message = "Loading...", minDuration = 0 }) => {
  // We can ignore minDuration for this simpler version as it's handled by the parent mostly, 
  // or we can keep it if we want to enforce a delay, but for a clean UI, instant feedback is often better.

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col items-center justify-center p-4">
      <div className="relative">
        {/* Logo Container */}
        <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-gray-900/10 mb-8 animate-pulse">
          SL
        </div>

        {/* Spinner */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      </div>

      <div className="mt-16 text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-900">SpeakLife</h2>
        <p className="text-sm text-gray-500 font-medium">{message}</p>
      </div>
    </div>
  )
}

export default PremiumLoader
