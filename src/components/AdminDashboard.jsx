import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.jsx'
import adminService from '../services/adminService.js'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Alert, AlertDescription } from './ui/alert'
import { 
  Database, 
  Settings, 
  FileText, 
  Users, 
  BarChart3, 
  RefreshCw, 
  Trash2, 
  Plus,
  Eye,
  Edit,
  Save,
  X,
  Activity,
  HardDrive,
  TestTube,
  BookOpen,
  MessageCircle,
  BarChart,
  TrendingUp,
  TrendingDown,
  Clock,
  Globe,
  Star,
  Target,
  Zap,
  Calendar,
  CheckCircle,
  XCircle,
  Shield,
  Brain,
  Sparkles,
  Layers,
  Grid,
  Layout,
  Palette,
  Wand2
} from 'lucide-react'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalVerses: 0,
    totalConfessions: 0,
    totalBookmarks: 0,
    totalHighlights: 0,
    lastUpdated: null
  })
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [topics, setTopics] = useState([])
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [topicVerses, setTopicVerses] = useState([])
  const [topicConfessions, setTopicConfessions] = useState([])
  const [viewAnalytics, setViewAnalytics] = useState({})
  const [aiConfig, setAiConfig] = useState({
    apiKey: '',
    model: 'mistralai/mixtral-8x7b-instruct',
    isConfigured: false
  })
  const [previewContent, setPreviewContent] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [dailyContent, setDailyContent] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState({ users: 0, verses: 0, confessions: 0 })
  const [cacheInfo, setCacheInfo] = useState({})
  const [systemHealth, setSystemHealth] = useState({})

  useEffect(() => {
    loadSystemData()
    loadTopics()
    loadViewAnalytics()
    loadDailyContent()
    loadCacheInfo()
    loadSystemHealth()
    checkAIConfig()
  }, [])

  const loadSystemData = async () => {
    try {
      setIsLoading(true)
      const stats = await adminService.getSystemStats()
      setSystemStats(stats)
      const systemLogs = await adminService.getSystemLogs()
      setLogs(systemLogs)
    } catch (error) {
      console.error('Error loading system data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTopics = async () => {
    try {
      const topicsData = await adminService.getTopics()
      setTopics(topicsData)
    } catch (error) {
      console.error('Error loading topics:', error)
    }
  }

  const loadViewAnalytics = async () => {
    try {
      const analytics = await adminService.getViewAnalytics()
      setViewAnalytics(analytics)
    } catch (error) {
      console.error('Error loading view analytics:', error)
    }
  }

  const loadDailyContent = async () => {
    try {
      const content = await adminService.getDailyContent()
      setDailyContent(content)
    } catch (error) {
      onLog(`❌ Error loading daily content: ${error.message}`, 'error')
    }
  }

  const loadCacheInfo = async () => {
    try {
      const cache = await adminService.getCacheInfo()
      setCacheInfo(cache)
    } catch (error) {
      onLog(`❌ Error loading cache info: ${error.message}`, 'error')
    }
  }

  const loadSystemHealth = async () => {
    try {
      const health = await adminService.checkSystemHealth()
      setSystemHealth(health)
    } catch (error) {
      onLog(`❌ Error checking system health: ${error.message}`, 'error')
    }
  }

  const checkAIConfig = () => {
    const apiKey = import.meta.env?.VITE_OPENROUTER_API_KEY || import.meta.env?.REACT_APP_OPENROUTER_API_KEY
    setAiConfig({
      apiKey: apiKey || '',
      model: 'mistralai/mixtral-8x7b-instruct',
      isConfigured: !!apiKey
    })
  }

  const onLog = (message, type = 'info') => {
    adminService.addLog(message, type)
    setLogs(prev => [...prev, { message, type, timestamp: new Date().toISOString() }])
  }

  const generateDailyContent = async () => {
    try {
      onLog('🤖 Generating daily content with AI...', 'info')
      const content = await adminService.generateDailyContentPreview()
      setPreviewContent(content)
      setShowPreview(true)
      onLog('✅ Daily content generated successfully!', 'success')
    } catch (error) {
      onLog(`❌ Error generating daily content: ${error.message}`, 'error')
    }
  }

  const generateTopicContent = async () => {
    if (!selectedTopic) {
      onLog('⚠️ Please select a topic first', 'warning')
      return
    }
    try {
      onLog(`🤖 Generating content for topic: ${selectedTopic.title}...`, 'info')
      const content = await adminService.generateTopicContentPreview(selectedTopic.id)
      setPreviewContent({ ...content, topicId: selectedTopic.id })
      setShowPreview(true)
      onLog('✅ Topic content generated successfully!', 'success')
    } catch (error) {
      onLog(`❌ Error generating topic content: ${error.message}`, 'error')
    }
  }

  const saveDailyContent = async () => {
    try {
      setIsSaving(true)
      await adminService.saveDailyContent(previewContent)
      setShowPreview(false)
      setPreviewContent(null)
      onLog('✅ Daily content saved successfully!', 'success')
      await loadSystemData()
    } catch (error) {
      onLog(`❌ Error saving daily content: ${error.message}`, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const saveTopicContent = async () => {
    try {
      setIsSaving(true)
      await adminService.saveTopicContent(previewContent)
      setShowPreview(false)
      setPreviewContent(null)
      onLog('✅ Topic content saved successfully!', 'success')
      await loadTopics()
    } catch (error) {
      onLog(`❌ Error saving topic content: ${error.message}`, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const cancelPreview = () => {
    setShowPreview(false)
    setPreviewContent(null)
    onLog('❌ Content generation cancelled', 'info')
  }

  const loadTopicContent = async (topicId) => {
    try {
      const [verses, confessions] = await Promise.all([
        adminService.getTopicVerses(topicId),
        adminService.getTopicConfessions(topicId)
      ])
      setTopicVerses(verses)
      setTopicConfessions(confessions)
    } catch (error) {
      onLog(`❌ Error loading topic content: ${error.message}`, 'error')
    }
  }

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic)
    loadTopicContent(topic.id)
  }

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning': return <Activity className="h-4 w-4 text-yellow-500" />
      default: return <Clock className="h-4 w-4 text-blue-500" />
    }
  }

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-700 bg-green-50 border-green-200'
      case 'error': return 'text-red-700 bg-red-50 border-red-200'
      case 'warning': return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      default: return 'text-blue-700 bg-blue-50 border-blue-200'
    }
  }

  // Test Data Generation Functions
  const generateTestUsers = async () => {
    try {
      setIsGenerating(true)
      setGenerationProgress(prev => ({ ...prev, users: 0 }))
      onLog('Generating test users...', 'info')
      
      const results = await adminService.generateTestUsers(5)
      const successCount = results.filter(r => r.success).length
      setGenerationProgress(prev => ({ ...prev, users: successCount }))
      
      onLog(`Test users generation complete: ${successCount}/5 successful`, 'success')
    } catch (error) {
      onLog(`Error generating test users: ${error.message}`, 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateTestVerses = async () => {
    try {
      setIsGenerating(true)
      setGenerationProgress(prev => ({ ...prev, verses: 0 }))
      onLog('Generating test verses...', 'info')
      
      const results = await adminService.generateTestVerses(7)
      const successCount = results.filter(r => r.success).length
      setGenerationProgress(prev => ({ ...prev, verses: successCount }))
      
      onLog(`Test verses generation complete: ${successCount}/7 successful`, 'success')
    } catch (error) {
      onLog(`Error generating test verses: ${error.message}`, 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateAllTestData = async () => {
    try {
      setIsGenerating(true)
      setGenerationProgress({ users: 0, verses: 0, confessions: 0 })
      onLog('Generating all test data...', 'info')
      
      await Promise.all([
        generateTestUsers(),
        generateTestVerses()
      ])
      
      onLog('All test data generation completed', 'success')
    } catch (error) {
      onLog(`Error generating all test data: ${error.message}`, 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  // Cache Management Functions
  const clearCache = async (type = 'all') => {
    try {
      onLog(`Clearing ${type} cache...`, 'info')
      await adminService.clearCache(type)
      await loadCacheInfo()
      onLog(`Cache cleared successfully`, 'success')
    } catch (error) {
      onLog(`Error clearing cache: ${error.message}`, 'error')
    }
  }

  // Daily Content Management
  const createDailyContent = async (content) => {
    try {
      await adminService.createDailyContent(content)
      await loadDailyContent()
      onLog('Daily content created successfully', 'success')
    } catch (error) {
      onLog(`Error creating daily content: ${error.message}`, 'error')
    }
  }

  const updateDailyContent = async (id, updates) => {
    try {
      await adminService.updateDailyContent(id, updates)
      await loadDailyContent()
      onLog('Daily content updated successfully', 'success')
    } catch (error) {
      onLog(`Error updating daily content: ${error.message}`, 'error')
    }
  }

  const deleteDailyContent = async (id) => {
    try {
      await adminService.deleteDailyContent(id)
      await loadDailyContent()
      onLog('Daily content deleted successfully', 'success')
    } catch (error) {
      onLog(`Error deleting daily content: ${error.message}`, 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Premium Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-xl">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 font-medium">SpeakLife Management Center</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-4 py-2">
                <Activity className="h-4 w-4 mr-2" />
                System Online
              </Badge>
              <Button 
                onClick={loadSystemData}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Premium Navigation */}
        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-8 bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-2">
              <TabsTrigger 
                value="overview" 
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl"
              >
                <BarChart className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="content" 
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-xl"
              >
                <FileText className="h-4 w-4" />
                <span>Content</span>
              </TabsTrigger>
              <TabsTrigger 
                value="cache" 
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-500 data-[state=active]:text-white rounded-xl"
              >
                <Database className="h-4 w-4" />
                <span>Cache</span>
              </TabsTrigger>
              <TabsTrigger 
                value="testdata" 
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-green-500 data-[state=active]:text-white rounded-xl"
              >
                <TestTube className="h-4 w-4" />
                <span>Test Data</span>
              </TabsTrigger>
              <TabsTrigger 
                value="topics" 
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-xl"
              >
                <BookOpen className="h-4 w-4" />
                <span>Topics</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger 
                value="ai" 
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl"
              >
                <Brain className="h-4 w-4" />
                <span>AI Generation</span>
              </TabsTrigger>
              <TabsTrigger 
                value="logs" 
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-xl"
              >
                <Activity className="h-4 w-4" />
                <span>System Logs</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content Area */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* System Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-blue-900">{systemStats.totalUsers}</p>
                  </div>
                  <Users className="h-12 w-12 text-blue-500" />
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 font-medium">Daily Verses</p>
                    <p className="text-3xl font-bold text-green-900">{systemStats.totalVerses}</p>
                  </div>
                  <BookOpen className="h-12 w-12 text-green-500" />
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 font-medium">Confessions</p>
                    <p className="text-3xl font-bold text-purple-900">{systemStats.totalConfessions}</p>
                  </div>
                  <MessageCircle className="h-12 w-12 text-purple-500" />
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 font-medium">Bookmarks</p>
                    <p className="text-3xl font-bold text-orange-900">{systemStats.totalBookmarks}</p>
                  </div>
                  <Star className="h-12 w-12 text-orange-500" />
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-8 bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Zap className="h-6 w-6 mr-3 text-purple-500" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Button 
                  onClick={() => setActiveTab('ai')}
                  className="h-20 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Brain className="h-8 w-8" />
                    <span className="font-semibold">AI Generation</span>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => setActiveTab('content')}
                  className="h-20 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <FileText className="h-8 w-8" />
                    <span className="font-semibold">Content Management</span>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => setActiveTab('analytics')}
                  className="h-20 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <TrendingUp className="h-8 w-8" />
                    <span className="font-semibold">Analytics</span>
                  </div>
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Content Management Tab */}
          <TabsContent value="content" className="space-y-8">
            <Card className="p-8 bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="h-6 w-6 mr-3 text-blue-500" />
                Content Management
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Daily Content</h4>
                  <p className="text-gray-600">Manage daily verses and confessions</p>
                  <Button 
                    onClick={() => setActiveTab('ai')}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate with AI
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Topic Content</h4>
                  <p className="text-gray-600">Manage verses and confessions for topics</p>
                  <Button 
                    onClick={() => setActiveTab('topics')}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Manage Topics
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Topics Tab */}
          <TabsContent value="topics" className="space-y-8">
            <Card className="p-8 bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen className="h-6 w-6 mr-3 text-cyan-500" />
                Topic Management
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Available Topics</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {topics.map((topic) => (
                      <div 
                        key={topic.id}
                        onClick={() => handleTopicSelect(topic)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          selectedTopic?.id === topic.id
                            ? 'border-purple-300 bg-purple-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-purple-200 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{topic.icon}</span>
                            <div>
                              <h5 className="font-semibold text-gray-900">{topic.title}</h5>
                              <p className="text-sm text-gray-600">{topic.description}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-gray-100">
                            {topic.usage_count || 0} views
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedTopic && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Content for: {selectedTopic.title}
                    </h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <h5 className="font-semibold text-blue-900 mb-2">Verses ({topicVerses.length})</h5>
                        <p className="text-sm text-blue-700">Manage Bible verses for this topic</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <h5 className="font-semibold text-green-900 mb-2">Confessions ({topicConfessions.length})</h5>
                        <p className="text-sm text-green-700">Manage confessions for this topic</p>
                      </div>
                      <Button 
                        onClick={() => generateTopicContent()}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Generate AI Content
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-8">
            <Card className="p-8 bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="h-6 w-6 mr-3 text-teal-500" />
                View Analytics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 font-medium">Total Views</p>
                      <p className="text-3xl font-bold text-blue-900">{viewAnalytics.totalViews || 0}</p>
                    </div>
                    <Eye className="h-12 w-12 text-blue-500" />
                  </div>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 font-medium">Today's Views</p>
                      <p className="text-3xl font-bold text-green-900">{viewAnalytics.todayViews || 0}</p>
                    </div>
                    <Calendar className="h-12 w-12 text-green-500" />
                  </div>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 font-medium">Top Topic</p>
                      <p className="text-lg font-bold text-purple-900">{viewAnalytics.topTopic || 'N/A'}</p>
                    </div>
                    <Target className="h-12 w-12 text-purple-500" />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* AI Generation Tab */}
          <TabsContent value="ai" className="space-y-8">
            <Card className="p-8 bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Brain className="h-6 w-6 mr-3 text-green-500" />
                AI Content Generation
              </h3>
              
              {/* AI Configuration */}
              <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-green-900">AI Configuration</h4>
                  <Badge variant="outline" className={aiConfig.isConfigured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {aiConfig.isConfigured ? '✅ Configured' : '❌ Not Configured'}
                  </Badge>
                </div>
                <p className="text-green-700 mb-4">
                  Using <strong>Mixtral 8x7B (BEST FREE)</strong> model with 8 available free models
                </p>
                {!aiConfig.isConfigured && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertDescription className="text-yellow-800">
                      ⚠️ AI generation requires OpenRouter API key. Set VITE_OPENROUTER_API_KEY in your environment.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Generation Options */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-900 mb-3">Daily Content</h4>
                  <p className="text-blue-700 mb-4">Generate today's verse and confession</p>
                  <Button 
                    onClick={generateDailyContent}
                    disabled={!aiConfig.isConfigured}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Daily Content
                  </Button>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <h4 className="text-lg font-semibold text-purple-900 mb-3">Topic Content</h4>
                  <p className="text-purple-700 mb-4">Generate verses and confessions for topics</p>
                  <Button 
                    onClick={() => setActiveTab('topics')}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Select Topic First
                  </Button>
                </div>
              </div>
            </Card>

            {/* Preview Section */}
            {showPreview && previewContent && (
              <Card className="p-8 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-yellow-500">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Content Preview</h4>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Review Before Saving</Badge>
                </div>
                
                <div className="space-y-6">
                  {/* Daily Content Preview */}
                  {previewContent.verse && (
                    <div className="p-6 bg-white rounded-xl border border-yellow-200 shadow-lg">
                      <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <BookOpen className="h-5 w-5 mr-2" />
                        Daily Verse Preview
                      </h5>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Reference:</label>
                          <p className="text-gray-800 font-medium">{previewContent.verse.reference} ({previewContent.verse.translation || 'KJV'})</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Verse Text:</label>
                          <p className="text-gray-800 italic">"{previewContent.verse.verse_text}"</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {previewContent.confession && (
                    <div className="p-6 bg-white rounded-xl border border-yellow-200 shadow-lg">
                      <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Daily Confession Preview
                      </h5>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Confession Text:</label>
                          <p className="text-gray-800">"{previewContent.confession.confession_text}"</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Topic Content Preview */}
                  {previewContent.verses && previewContent.verses.length > 0 && (
                    <div className="p-6 bg-white rounded-xl border border-yellow-200 shadow-lg">
                      <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <BookOpen className="h-5 w-5 mr-2" />
                        Topic Verses Preview ({previewContent.verses.length})
                      </h5>
                      <div className="space-y-3">
                        {previewContent.verses.map((verse, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600">Verse {index + 1}</span>
                              <Badge variant="outline">{verse.reference} ({verse.translation || 'KJV'})</Badge>
                            </div>
                            <p className="text-gray-800 italic text-sm">"{verse.verse_text}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {previewContent.confessions && previewContent.confessions.length > 0 && (
                    <div className="p-6 bg-white rounded-xl border border-yellow-200 shadow-lg">
                      <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Topic Confessions Preview ({previewContent.confessions.length})
                      </h5>
                      <div className="space-y-3">
                        {previewContent.confessions.map((confession, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600">Confession {index + 1}</span>
                              {confession.title && <Badge variant="outline">{confession.title}</Badge>}
                            </div>
                            <p className="text-gray-800 text-sm">"{confession.confession_text}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-yellow-200">
                  <Button 
                    onClick={previewContent.verse ? saveDailyContent : saveTopicContent}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 hover:from-green-600 hover:to-emerald-700 shadow-lg"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save Content
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={cancelPreview}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  
                  <Button 
                    onClick={previewContent.verse ? generateDailyContent : () => generateTopicContent()}
                    variant="outline"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Content Management Tab */}
          <TabsContent value="content" className="space-y-8">
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Daily Content Management
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl">
                      <div className="text-2xl font-bold">{dailyContent.length}</div>
                      <div className="text-blue-100">Total Daily Entries</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 rounded-xl">
                      <div className="text-2xl font-bold">
                        {dailyContent.filter(c => new Date(c.date).toDateString() === new Date().toDateString()).length}
                      </div>
                      <div className="text-green-100">Today's Entries</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Recent Daily Content</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {dailyContent.slice(0, 5).map((content) => (
                        <div key={content.id} className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{content.reference}</div>
                            <div className="text-xs text-gray-500">{new Date(content.date).toLocaleDateString()}</div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateDailyContent(content.id, {})}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteDailyContent(content.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Cache Management Tab */}
          <TabsContent value="cache" className="space-y-8">
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-600" />
                  Cache Management
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl">
                      <div className="text-2xl font-bold">{cacheInfo.localStorage || 0}</div>
                      <div className="text-blue-100">Local Storage Items</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 rounded-xl">
                      <div className="text-2xl font-bold">{cacheInfo.sessionStorage || 0}</div>
                      <div className="text-green-100">Session Storage Items</div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-xl">
                      <div className="text-2xl font-bold">{cacheInfo.memoryCache || 0}</div>
                      <div className="text-orange-100">Memory Cache Items</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => clearCache('localStorage')}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Clear Local Storage
                    </button>
                    <button
                      onClick={() => clearCache('sessionStorage')}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Clear Session Storage
                    </button>
                    <button
                      onClick={() => clearCache('all')}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Clear All Cache
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Test Data Tab */}
          <TabsContent value="testdata" className="space-y-8">
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-purple-600" />
                  Test Data Generation
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl">
                      <div className="text-2xl font-bold">{generationProgress.users}</div>
                      <div className="text-blue-100">Test Users Generated</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 rounded-xl">
                      <div className="text-2xl font-bold">{generationProgress.verses}</div>
                      <div className="text-green-100">Test Verses Generated</div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-xl">
                      <div className="text-2xl font-bold">{generationProgress.confessions}</div>
                      <div className="text-orange-100">Test Confessions Generated</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={generateTestUsers}
                      disabled={isGenerating}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      Generate Test Users
                    </button>
                    <button
                      onClick={generateTestVerses}
                      disabled={isGenerating}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      Generate Test Verses
                    </button>
                    <button
                      onClick={generateAllTestData}
                      disabled={isGenerating}
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                    >
                      Generate All Test Data
                    </button>
                  </div>
                  
                  {isGenerating && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                        <span className="text-yellow-800">Generating test data...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* System Logs Tab */}
          <TabsContent value="logs" className="space-y-8">
            <Card className="p-8 bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Activity className="h-6 w-6 mr-3 text-emerald-500" />
                System Logs
              </h3>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No system logs available</p>
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-xl border ${getLogColor(log.type)}`}
                    >
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AdminDashboard