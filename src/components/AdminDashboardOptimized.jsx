import React, { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Database, 
  Settings, 
  FileText, 
  Users, 
  BarChart3, 
  BookOpen,
  Plus,
  Edit,
  Save,
  X,
  RefreshCw,
  Brain,
  Sparkles
} from 'lucide-react'

// Import the optimized panels
import OverviewPanel from './admin/OverviewPanel'
import ContentManagementPanel from './admin/ContentManagementPanel'
import TopicsPanel from './admin/TopicsPanel'

const AdminDashboardOptimized = ({ onNavigate }) => {
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
  const [dailyContent, setDailyContent] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form states
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualFormData, setManualFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    verse_text: '',
    reference: '',
    confession_text: '',
    translation: 'KJV'
  })
  const [editingContent, setEditingContent] = useState(null)
  
  // Topic form states
  const [showTopicForm, setShowTopicForm] = useState(false)
  const [editingTopic, setEditingTopic] = useState(null)
  const [topicFormData, setTopicFormData] = useState({
    title: '',
    description: '',
    icon: '📖',
    category: 'general'
  })
  
  // Topic content form states
  const [showTopicVerseForm, setShowTopicVerseForm] = useState(false)
  const [showTopicConfessionForm, setShowTopicConfessionForm] = useState(false)
  const [topicVerseFormData, setTopicVerseFormData] = useState({
    verse_text: '',
    reference: '',
    book: '',
    chapter: '',
    verse: '',
    translation: 'KJV'
  })
  const [topicConfessionFormData, setTopicConfessionFormData] = useState({
    title: '',
    confession_text: '',
    theme: ''
  })
  const [editingTopicContent, setEditingTopicContent] = useState(null)

  useEffect(() => {
    loadSystemData()
    loadTopics()
    loadDailyContent()
  }, [])

  const loadSystemData = async () => {
    try {
      setIsLoading(true)
      // Load system stats and logs here
      setSystemStats({
        totalUsers: 150,
        totalVerses: 45,
        totalConfessions: 32,
        totalBookmarks: 89,
        totalHighlights: 12,
        lastUpdated: new Date()
      })
      setLogs([
        { id: 1, message: 'System initialized', type: 'success', timestamp: new Date() },
        { id: 2, message: 'Database connected', type: 'success', timestamp: new Date() },
        { id: 3, message: 'AI service ready', type: 'success', timestamp: new Date() }
      ])
    } catch (error) {
      console.error('Error loading system data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTopics = async () => {
    try {
      // Load topics from database
      setTopics([
        { id: 1, title: 'Faith', description: 'Verses about faith and trust', icon: '🙏', category: 'spiritual', usage_count: 15 },
        { id: 2, title: 'Love', description: 'Verses about love and compassion', icon: '❤️', category: 'spiritual', usage_count: 23 },
        { id: 3, title: 'Hope', description: 'Verses about hope and encouragement', icon: '🌟', category: 'spiritual', usage_count: 18 }
      ])
    } catch (error) {
      console.error('Error loading topics:', error)
    }
  }

  const loadDailyContent = async () => {
    try {
      // Load daily content from database
      setDailyContent([
        { id: 1, date: '2024-01-15', verse_text: 'For God so loved the world...', reference: 'John 3:16', confession_text: 'I am loved by God', translation: 'KJV' }
      ])
    } catch (error) {
      console.error('Error loading daily content:', error)
    }
  }

  const loadTopicContent = async () => {
    if (!selectedTopic) return
    try {
      // Load topic verses and confessions
      setTopicVerses([])
      setTopicConfessions([])
    } catch (error) {
      console.error('Error loading topic content:', error)
    }
  }

  const generateDailyContent = async () => {
    try {
      setIsGenerating(true)
      // AI generation logic here
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
    } catch (error) {
      console.error('Error generating content:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      // Save manual content logic here
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      await loadDailyContent()
      resetManualForm()
    } catch (error) {
      console.error('Error saving content:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const resetManualForm = () => {
    setManualFormData({
      date: new Date().toISOString().split('T')[0],
      verse_text: '',
      reference: '',
      confession_text: '',
      translation: 'KJV'
    })
    setEditingContent(null)
    setShowManualForm(false)
  }

  const handleTopicSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      // Save topic logic here
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      await loadTopics()
      resetTopicForm()
    } catch (error) {
      console.error('Error saving topic:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const resetTopicForm = () => {
    setTopicFormData({
      title: '',
      description: '',
      icon: '📖',
      category: 'general'
    })
    setEditingTopic(null)
    setShowTopicForm(false)
  }

  const editTopic = (topic) => {
    setTopicFormData(topic)
    setEditingTopic(topic)
    setShowTopicForm(true)
  }

  const deleteTopic = async (topicId) => {
    try {
      // Delete topic logic here
      await loadTopics()
    } catch (error) {
      console.error('Error deleting topic:', error)
    }
  }

  const editTopicContent = (content, type) => {
    if (type === 'verse') {
      setTopicVerseFormData({
        verse_text: content.verse_text || '',
        reference: content.reference || '',
        book: content.book || '',
        chapter: content.chapter || '',
        verse: content.verse || '',
        translation: content.translation || 'KJV'
      })
      setEditingTopicContent(content)
      setShowTopicVerseForm(true)
    } else if (type === 'confession') {
      setTopicConfessionFormData({
        title: content.title || '',
        confession_text: content.confession_text || '',
        theme: content.theme || ''
      })
      setEditingTopicContent(content)
      setShowTopicConfessionForm(true)
    }
  }

  const handleTopicVerseSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      // Save topic verse logic here
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      await loadTopicContent()
      resetTopicVerseForm()
    } catch (error) {
      console.error('Error saving topic verse:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleTopicConfessionSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      // Save topic confession logic here
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      await loadTopicContent()
      resetTopicConfessionForm()
    } catch (error) {
      console.error('Error saving topic confession:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const resetTopicVerseForm = () => {
    setTopicVerseFormData({
      verse_text: '',
      reference: '',
      book: '',
      chapter: '',
      verse: '',
      translation: 'KJV'
    })
    setEditingTopicContent(null)
    setShowTopicVerseForm(false)
  }

  const resetTopicConfessionForm = () => {
    setTopicConfessionFormData({
      title: '',
      confession_text: '',
      theme: ''
    })
    setEditingTopicContent(null)
    setShowTopicConfessionForm(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg">
                <Database className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Manage your spiritual content platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                System Online
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Content</span>
            </TabsTrigger>
            <TabsTrigger value="topics" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Topics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewPanel 
              systemStats={systemStats}
              logs={logs}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="content">
            <ContentManagementPanel 
              dailyContent={dailyContent}
              loadDailyContent={loadDailyContent}
              generateDailyContent={generateDailyContent}
              isGenerating={isGenerating}
              showManualForm={showManualForm}
              setShowManualForm={setShowManualForm}
              manualFormData={manualFormData}
              setManualFormData={setManualFormData}
              handleManualSubmit={handleManualSubmit}
              resetManualForm={resetManualForm}
              editingContent={editingContent}
              isSaving={isSaving}
            />
          </TabsContent>

          <TabsContent value="topics">
            <TopicsPanel 
              topics={topics}
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
              topicVerses={topicVerses}
              topicConfessions={topicConfessions}
              loadTopicContent={loadTopicContent}
              showTopicForm={showTopicForm}
              setShowTopicForm={setShowTopicForm}
              topicFormData={topicFormData}
              setTopicFormData={setTopicFormData}
              handleTopicSubmit={handleTopicSubmit}
              resetTopicForm={resetTopicForm}
              editingTopic={editingTopic}
              deleteTopic={deleteTopic}
              editTopic={editTopic}
              editTopicContent={editTopicContent}
              showTopicVerseForm={showTopicVerseForm}
              setShowTopicVerseForm={setShowTopicVerseForm}
              showTopicConfessionForm={showTopicConfessionForm}
              setShowTopicConfessionForm={setShowTopicConfessionForm}
              topicVerseFormData={topicVerseFormData}
              setTopicVerseFormData={setTopicVerseFormData}
              topicConfessionFormData={topicConfessionFormData}
              setTopicConfessionFormData={setTopicConfessionFormData}
              handleTopicVerseSubmit={handleTopicVerseSubmit}
              handleTopicConfessionSubmit={handleTopicConfessionSubmit}
              resetTopicVerseForm={resetTopicVerseForm}
              resetTopicConfessionForm={resetTopicConfessionForm}
              editingTopicContent={editingTopicContent}
              isSaving={isSaving}
            />
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-8 bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Settings</h3>
              <p className="text-gray-600">Settings panel coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Topic Form Modal */}
        {showTopicForm && (
          <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md mx-4 bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingTopic ? 'Edit Topic' : 'Add Topic'}
                  </h3>
                  <Button
                    onClick={resetTopicForm}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <form onSubmit={handleTopicSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <Input
                      value={topicFormData.title}
                      onChange={(e) => setTopicFormData({...topicFormData, title: e.target.value})}
                      placeholder="Enter topic title..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <Textarea
                      value={topicFormData.description}
                      onChange={(e) => setTopicFormData({...topicFormData, description: e.target.value})}
                      placeholder="Enter topic description..."
                      className="w-full"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                      <Input
                        value={topicFormData.icon}
                        onChange={(e) => setTopicFormData({...topicFormData, icon: e.target.value})}
                        placeholder="📖"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <Input
                        value={topicFormData.category}
                        onChange={(e) => setTopicFormData({...topicFormData, category: e.target.value})}
                        placeholder="general"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {editingTopic ? 'Update Topic' : 'Add Topic'}
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={resetTopicForm}
                      variant="outline"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </Card>
        )}

        {/* Topic Verse Form Modal */}
        {showTopicVerseForm && (
          <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md mx-4 bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingTopicContent ? 'Edit Topic Verse' : 'Add Topic Verse'}
                  </h3>
                  <Button
                    onClick={resetTopicVerseForm}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <form onSubmit={handleTopicVerseSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Verse Text</label>
                    <Textarea
                      value={topicVerseFormData.verse_text}
                      onChange={(e) => setTopicVerseFormData({...topicVerseFormData, verse_text: e.target.value})}
                      placeholder="Enter the Bible verse text..."
                      className="w-full"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Book</label>
                      <Input
                        value={topicVerseFormData.book}
                        onChange={(e) => setTopicVerseFormData({...topicVerseFormData, book: e.target.value})}
                        placeholder="e.g., John"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
                      <Input
                        type="number"
                        value={topicVerseFormData.chapter}
                        onChange={(e) => setTopicVerseFormData({...topicVerseFormData, chapter: e.target.value})}
                        placeholder="3"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Verse</label>
                      <Input
                        type="number"
                        value={topicVerseFormData.verse}
                        onChange={(e) => setTopicVerseFormData({...topicVerseFormData, verse: e.target.value})}
                        placeholder="16"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Translation</label>
                      <Input
                        value={topicVerseFormData.translation}
                        onChange={(e) => setTopicVerseFormData({...topicVerseFormData, translation: e.target.value})}
                        placeholder="KJV"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {editingTopicContent ? 'Update Verse' : 'Add Verse'}
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={resetTopicVerseForm}
                      variant="outline"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </Card>
        )}

        {/* Topic Confession Form Modal */}
        {showTopicConfessionForm && (
          <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md mx-4 bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingTopicContent ? 'Edit Topic Confession' : 'Add Topic Confession'}
                  </h3>
                  <Button
                    onClick={resetTopicConfessionForm}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <form onSubmit={handleTopicConfessionSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <Input
                      value={topicConfessionFormData.title}
                      onChange={(e) => setTopicConfessionFormData({...topicConfessionFormData, title: e.target.value})}
                      placeholder="Enter confession title..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confession Text</label>
                    <Textarea
                      value={topicConfessionFormData.confession_text}
                      onChange={(e) => setTopicConfessionFormData({...topicConfessionFormData, confession_text: e.target.value})}
                      placeholder="Enter the confession text..."
                      className="w-full"
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                    <Input
                      value={topicConfessionFormData.theme}
                      onChange={(e) => setTopicConfessionFormData({...topicConfessionFormData, theme: e.target.value})}
                      placeholder="e.g., Faith, Hope, Love"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {editingTopicContent ? 'Update Confession' : 'Add Confession'}
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={resetTopicConfessionForm}
                      variant="outline"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </Card>
        )}
      </div>
    </div>
  )
}

export default AdminDashboardOptimized
