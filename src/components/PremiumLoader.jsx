import React, { useState, useEffect } from 'react'

const PremiumLoader = ({ message = "Loading...", showLogo = true, size = "large", minDuration = 2000 }) => {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Ensure minimum loading duration
    const timer = setTimeout(() => {
      setShowContent(true)
    }, minDuration)

    return () => clearTimeout(timer)
  }, [minDuration])

  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-20 h-20", 
    large: "w-24 h-24"
  }

  const textSizeClasses = {
    small: "text-lg",
    medium: "text-xl",
    large: "text-2xl"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-6 h-6 bg-purple-300/30 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-20 w-4 h-4 bg-pink-300/40 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-20 w-5 h-5 bg-blue-300/30 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 right-10 w-3 h-3 bg-purple-300/40 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-pink-300/50 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-blue-300/30 rounded-full animate-float" style={{ animationDelay: '5s' }}></div>
      </div>
      
      <div className="text-center relative z-10 animate-fade-in">
        {showLogo && (
          <div className="relative group mb-8">
            <div className={`${sizeClasses[size]} bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110`}>
              <span className="text-white font-black text-3xl">SL</span>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse"></div>
          </div>
        )}
        
        <div className="space-y-6">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          
          {showLogo && (
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-800">SpeakLife</h2>
              <p className="text-lg text-gray-600 font-medium">One Confession at a Time</p>
            </div>
          )}
          
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          
          <p className={`text-gray-500 font-medium ${textSizeClasses[size]}`}>{message}</p>
        </div>
      </div>
    </div>
  )
}

export default PremiumLoader
