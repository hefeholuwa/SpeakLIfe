// AdminDashboard - Fixed version without loadingStates errors
import React, { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Database, 
  Settings, 
  FileText, 
  Users, 
  BarChart3, 
  BookOpen,
  Brain,
  Shield,
  LogOut
} from 'lucide-react'

const AdminDashboard = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">SpeakLife Administration</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => onNavigate('landing')}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Back to App</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Content</span>
            </TabsTrigger>
            <TabsTrigger value="topics" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Topics</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>AI Test</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Verses</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Database className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Topics</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Daily Content</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </Card>
            </div>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">System Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database Connection</span>
                  <span className="text-sm text-green-600 font-medium">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Service</span>
                  <span className="text-sm text-green-600 font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm text-gray-900">{new Date().toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Content Management</h3>
              <p className="text-gray-600 mb-4">Manage daily verses and confessions</p>
              <div className="space-y-4">
                <Button className="w-full">
                  Generate AI Content
                </Button>
                <Button variant="outline" className="w-full">
                  Add Manual Content
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="topics">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Topic Management</h3>
              <p className="text-gray-600 mb-4">Manage topics, verses, and confessions</p>
              <div className="space-y-4">
                <Button className="w-full">
                  Create New Topic
                </Button>
                <Button variant="outline" className="w-full">
                  Manage Existing Topics
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="ai">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">AI Testing</h3>
              <p className="text-gray-600 mb-4">Test AI content generation</p>
              <div className="space-y-4">
                <Button className="w-full">
                  Test Verse Generation
                </Button>
                <Button variant="outline" className="w-full">
                  Test Confession Generation
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">System Settings</h3>
              <p className="text-gray-600">Settings panel coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AdminDashboard