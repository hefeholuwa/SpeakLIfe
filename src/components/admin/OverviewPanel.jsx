import React from 'react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  BookOpen,
  MessageCircle,
  Star,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Users
} from 'lucide-react'

const OverviewPanel = ({ systemStats, logs, isLoading }) => {
  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return <Activity className="h-4 w-4 text-green-500" />
      case 'error': return <Activity className="h-4 w-4 text-red-500" />
      case 'warning': return <Activity className="h-4 w-4 text-yellow-500" />
      default: return <Clock className="h-4 w-4 text-blue-500" />
    }
  }

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Card className="p-8 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* System Statistics */}
      <Card className="p-8 bg-white border border-gray-200 shadow-sm rounded-xl">


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{systemStats.totalUsers}</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Bible Verses</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{systemStats.totalVerses}</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Confessions</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{systemStats.totalConfessions}</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Bookmarks</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{systemStats.totalBookmarks}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-8 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-500" />
            Recent Activity
          </h3>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            View All
          </Button>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {logs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Activity className="h-10 w-10 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500 font-medium">No recent activity</p>
            </div>
          ) : (
            logs.slice(0, 10).map((log) => (
              <div key={log.id} className={`p-4 rounded-xl border transition-all hover:shadow-sm ${getLogColor(log.type)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full bg-white/50`}>
                      {getLogIcon(log.type)}
                    </div>
                    <span className="font-medium">{log.message}</span>
                  </div>
                  <span className="text-xs font-medium opacity-75 bg-white/50 px-2 py-1 rounded-full">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}

export default OverviewPanel
