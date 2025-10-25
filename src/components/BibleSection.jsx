import React from 'react'
import ESVBibleReader from './bible/ESVBibleReader'

const BibleSection = () => {

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]"></div>
      
      {/* Mobile-Responsive Header */}
      <div className="relative bg-white/90 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 shadow-2xl">
                  <span className="text-white text-lg sm:text-2xl">📖</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent truncate">
                  Bible Study
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">Explore God's Word with wisdom and understanding</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg sm:rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 border border-purple-200">
                <span className="text-xs sm:text-sm font-semibold text-purple-700">KJV</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="w-full">
          {/* Mobile-Responsive Bible Reader Container */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <ESVBibleReader />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BibleSection