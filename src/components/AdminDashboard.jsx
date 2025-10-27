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
  Sparkles,
  CheckCircle,
  LogOut,
  Shield
} from 'lucide-react'

// Import the optimized panels
import OverviewPanel from './admin/OverviewPanel'
import ContentManagementPanel from './admin/ContentManagementPanel'
import TopicsPanel from './admin/TopicsPanel'
import AITest from './AITest'
import adminService from '../services/adminService'

const AdminDashboard = ({ onNavigate }) => {
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
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [loadingStates, setLoadingStates] = useState({
    systemData: false,
    topics: false,
    dailyContent: false,
    topicContent: false
  })
  
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
    confession_text: ''
  })

  // Load system data
  const loadSystemData = async () => {
    setLoadingStates(prev => ({ ...prev, systemData: true }))
    try {
      const stats = await adminService.getSystemStats()
      setSystemStats(stats)
      
      const systemLogs = await adminService.getSystemLogs()
      setLogs(systemLogs)
    } catch (error) {
      console.error('Error loading system data:', error)
      setError('Failed to load system data')
    } finally {
      setLoadingStates(prev => ({ ...prev, systemData: false }))
    }
  }

  // Load topics
  const loadTopics = async () => {
    setLoadingStates(prev => ({ ...prev, topics: true }))
    try {
      const topicsData = await adminService.getTopics()
      setTopics(topicsData)
    } catch (error) {
      console.error('Error loading topics:', error)
      setError('Failed to load topics')
    } finally {
      setLoadingStates(prev => ({ ...prev, topics: false }))
    }
  }

  // Load daily content
  const loadDailyContent = async () => {
    setLoadingStates(prev => ({ ...prev, dailyContent: true }))
    try {
      const content = await adminService.getDailyContent()
      setDailyContent(content)
    } catch (error) {
      console.error('Error loading daily content:', error)
      setError('Failed to load daily content')
    } finally {
      setLoadingStates(prev => ({ ...prev, dailyContent: false }))
    }
  }

  // Load topic content
  const loadTopicContent = async (topicId) => {
    if (!topicId) return
    
    setLoadingStates(prev => ({ ...prev, topicContent: true }))
    try {
      const [verses, confessions] = await Promise.all([
        adminService.getTopicVerses(topicId),
        adminService.getTopicConfessions(topicId)
      ])
      setTopicVerses(verses)
      setTopicConfessions(confessions)
    } catch (error) {
      console.error('Error loading topic content:', error)
      setError('Failed to load topic content')
    } finally {
      setLoadingStates(prev => ({ ...prev, topicContent: false }))
    }
  }

  // Generate AI content
  const generateAIContent = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const result = await adminService.generateDailyContent()
      if (result.success) {
        setSuccessMessage('AI content generated successfully!')
        setShowSuccessToast(true)
        await loadDailyContent()
        await loadSystemData()
      } else {
        setError(result.error || 'Failed to generate content')
      }
    } catch (error) {
      console.error('Error generating AI content:', error)
      setError('Failed to generate AI content')
    } finally {
      setIsGenerating(false)
    }
  }

  // Save manual content
  const saveManualContent = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const result = await adminService.createDailyContent(manualFormData)
      if (result.success) {
        setSuccessMessage('Content saved successfully!')
        setShowSuccessToast(true)
        setShowManualForm(false)
        setManualFormData({
          date: new Date().toISOString().split('T')[0],
          verse_text: '',
          reference: '',
          confession_text: '',
          translation: 'KJV'
        })
        await loadDailyContent()
        await loadSystemData()
      } else {
        setError(result.error || 'Failed to save content')
      }
    } catch (error) {
      console.error('Error saving manual content:', error)
      setError('Failed to save content')
    } finally {
      setIsSaving(false)
    }
  }

  // Save topic
  const saveTopic = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const result = editingTopic 
        ? await adminService.updateTopic(editingTopic.id, topicFormData)
        : await adminService.createTopic(topicFormData)
      
      if (result.success) {
        setSuccessMessage(editingTopic ? 'Topic updated successfully!' : 'Topic created successfully!')
        setShowSuccessToast(true)
        setShowTopicForm(false)
        setEditingTopic(null)
        setTopicFormData({
          title: '',
          description: '',
          icon: '📖',
          category: 'general'
        })
        await loadTopics()
        await loadSystemData()
      } else {
        setError(result.error || 'Failed to save topic')
      }
    } catch (error) {
      console.error('Error saving topic:', error)
      setError('Failed to save topic')
    } finally {
      setIsSaving(false)
    }
  }

  // Save topic verse
  const saveTopicVerse = async () => {
    if (!selectedTopic) return
    
    setIsSaving(true)
    setError(null)
    try {
      const result = await adminService.createTopicVerse(selectedTopic.id, topicVerseFormData)
      if (result.success) {
        setSuccessMessage('Topic verse saved successfully!')
        setShowSuccessToast(true)
        setShowTopicVerseForm(false)
        setTopicVerseFormData({
          verse_text: '',
          reference: '',
          book: '',
          chapter: '',
          verse: '',
          translation: 'KJV'
        })
        await loadTopicContent(selectedTopic.id)
        await loadSystemData()
      } else {
        setError(result.error || 'Failed to save topic verse')
      }
    } catch (error) {
      console.error('Error saving topic verse:', error)
      setError('Failed to save topic verse')
    } finally {
      setIsSaving(false)
    }
  }

  // Save topic confession
  const saveTopicConfession = async () => {
    if (!selectedTopic) return
    
    setIsSaving(true)
    setError(null)
    try {
      const result = await adminService.createTopicConfession(selectedTopic.id, topicConfessionFormData)
      if (result.success) {
        setSuccessMessage('Topic confession saved successfully!')
        setShowSuccessToast(true)
        setShowTopicConfessionForm(false)
        setTopicConfessionFormData({
          title: '',
          confession_text: ''
        })
        await loadTopicContent(selectedTopic.id)
        await loadSystemData()
      } else {
        setError(result.error || 'Failed to save topic confession')
      }
    } catch (error) {
      console.error('Error saving topic confession:', error)
      setError('Failed to save topic confession')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete content
  const deleteContent = async (id) => {
    if (!confirm('Are you sure you want to delete this content?')) return
    
    try {
      const result = await adminService.deleteDailyContent(id)
      if (result.success) {
        setSuccessMessage('Content deleted successfully!')
        setShowSuccessToast(true)
        await loadDailyContent()
        await loadSystemData()
      } else {
        setError(result.error || 'Failed to delete content')
      }
    } catch (error) {
      console.error('Error deleting content:', error)
      setError('Failed to delete content')
    }
  }

  // Delete topic
  const deleteTopic = async (id) => {
    if (!confirm('Are you sure you want to delete this topic? This will also delete all associated verses and confessions.')) return
    
    try {
      const result = await adminService.deleteTopic(id)
      if (result.success) {
        setSuccessMessage('Topic deleted successfully!')
        setShowSuccessToast(true)
        await loadTopics()
        await loadSystemData()
        if (selectedTopic?.id === id) {
          setSelectedTopic(null)
          setTopicVerses([])
          setTopicConfessions([])
        }
      } else {
        setError(result.error || 'Failed to delete topic')
      }
    } catch (error) {
      console.error('Error deleting topic:', error)
      setError('Failed to delete topic')
    }
  }

  // Edit content
  const editContent = (content) => {
    setEditingContent(content)
    setManualFormData({
      date: content.date,
      verse_text: content.verse_text,
      reference: content.reference,
      confession_text: content.confession_text,
      translation: content.translation || 'KJV'
    })
    setShowManualForm(true)
  }

  // Edit topic
  const editTopic = (topic) => {
    setEditingTopic(topic)
    setTopicFormData({
      title: topic.title,
      description: topic.description,
      icon: topic.icon,
      category: topic.category
    })
    setShowTopicForm(true)
  }

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([
          loadSystemData(),
          loadTopics(),
          loadDailyContent()
        ])
      } catch (error) {
        console.error('Error initializing admin data:', error)
        setError('Failed to initialize admin dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()
  }, [])

  // Load topic content when topic is selected
  useEffect(() => {
    if (selectedTopic) {
      loadTopicContent(selectedTopic.id)
    }
  }, [selectedTopic])

  // Auto-hide success message
  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false)
        setSuccessMessage('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessToast])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

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

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>{successMessage}</span>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="ml-2 hover:text-green-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center space-x-2">
              <X className="w-5 h-5" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

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
            <OverviewPanel 
              systemStats={systemStats}
              logs={logs}
              loading={loadingStates.systemData}
              onRefresh={loadSystemData}
            />
          </TabsContent>

          <TabsContent value="content">
            <ContentManagementPanel
              dailyContent={dailyContent}
              loading={loadingStates.dailyContent}
              onRefresh={loadDailyContent}
              onGenerateAI={generateAIContent}
              onSaveManual={saveManualContent}
              onDelete={deleteContent}
              onEdit={editContent}
              isGenerating={isGenerating}
              isSaving={isSaving}
              showManualForm={showManualForm}
              setShowManualForm={setShowManualForm}
              manualFormData={manualFormData}
              setManualFormData={setManualFormData}
              editingContent={editingContent}
              setEditingContent={setEditingContent}
            />
          </TabsContent>

          <TabsContent value="topics">
            <TopicsPanel
              topics={topics}
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
              topicVerses={topicVerses}
              topicConfessions={topicConfessions}
              loading={loadingStates.topics}
              loadingContent={loadingStates.topicContent}
              onRefreshTopics={loadTopics}
              onRefreshContent={() => selectedTopic && loadTopicContent(selectedTopic.id)}
              onSaveTopic={saveTopic}
              onSaveTopicVerse={saveTopicVerse}
              onSaveTopicConfession={saveTopicConfession}
              onDeleteTopic={deleteTopic}
              onEditTopic={editTopic}
              isSaving={isSaving}
              showTopicForm={showTopicForm}
              setShowTopicForm={setShowTopicForm}
              topicFormData={topicFormData}
              setTopicFormData={setTopicFormData}
              editingTopic={editingTopic}
              setEditingTopic={setEditingTopic}
              showTopicVerseForm={showTopicVerseForm}
              setShowTopicVerseForm={setShowTopicVerseForm}
              topicVerseFormData={topicVerseFormData}
              setTopicVerseFormData={setTopicVerseFormData}
              showTopicConfessionForm={showTopicConfessionForm}
              setShowTopicConfessionForm={setShowTopicConfessionForm}
              topicConfessionFormData={topicConfessionFormData}
              setTopicConfessionFormData={setTopicConfessionFormData}
            />
          </TabsContent>

          <TabsContent value="ai">
            <AITest />
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