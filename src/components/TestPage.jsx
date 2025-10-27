import React from 'react'

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Test Page</h1>
        <p className="text-lg text-gray-600">This page loads instantly without any database calls</p>
        <div className="mt-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-2xl">✓</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestPage
