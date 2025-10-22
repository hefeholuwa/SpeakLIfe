import React from 'react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { 
  BookOpen, 
  MessageCircle, 
  Star, 
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock
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
        <Card className="p-8 bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
      <Card className="p-8 bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <Activity className="h-6 w-6 mr-3 text-blue-500" />
            System Overview
          </h3>
          <Badge variant="outline" className="bg-green-100 text-green-800">
            All Systems Operational
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Users</p>
                <p className="text-3xl font-bold text-blue-900">{systemStats.totalUsers}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12% this month</span>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Bible Verses</p>
                <p className="text-3xl font-bold text-green-900">{systemStats.totalVerses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+8% this month</span>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Confessions</p>
                <p className="text-3xl font-bold text-purple-900">{systemStats.totalConfessions}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+15% this month</span>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Bookmarks</p>
                <p className="text-3xl font-bold text-orange-900">{systemStats.totalBookmarks}</p>
              </div>
              <Star className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-sm text-red-600">-3% this month</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-8 bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-gray-500" />
          Recent Activity
        </h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No recent activity</p>
            </div>
          ) : (
            logs.slice(0, 10).map((log) => (
              <div key={log.id} className={`p-3 rounded-lg border ${getLogColor(log.type)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getLogIcon(log.type)}
                    <span className="font-medium">{log.message}</span>
                  </div>
                  <span className="text-sm opacity-75">
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
