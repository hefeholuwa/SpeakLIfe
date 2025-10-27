import React from 'react'

const AdminDashboard = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">SpeakLife Administration Panel</p>
            </div>
            <button
              onClick={() => onNavigate('landing')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Back to App
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">📖</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Verses</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">📚</span>
                </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Topics</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
                    </div>
                  </div>
                  
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <span className="text-2xl">📅</span>
                  </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Daily Content</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
                    </div>
                    </div>
                  </div>
                  
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Functions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <h3 className="font-medium text-gray-900">Content Management</h3>
              <p className="text-sm text-gray-600">Manage daily verses and confessions</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <h3 className="font-medium text-gray-900">Topic Management</h3>
              <p className="text-sm text-gray-600">Manage topics and their content</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <h3 className="font-medium text-gray-900">AI Testing</h3>
              <p className="text-sm text-gray-600">Test AI content generation</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <h3 className="font-medium text-gray-900">System Settings</h3>
              <p className="text-sm text-gray-600">Configure system settings</p>
            </button>
                  </div>
                  </div>
                  
        {/* Status */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database Connection</span>
              <span className="text-sm text-green-600 font-medium">✅ Connected</span>
                  </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">AI Service</span>
              <span className="text-sm text-green-600 font-medium">✅ Active</span>
              </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm text-gray-900">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard