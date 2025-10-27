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
// Removed admin auth import for direct access

// Import the optimized panels
import OverviewPanel from './admin/OverviewPanel'
import ContentManagementPanel from './admin/ContentManagementPanel'
import TopicsPanel from './admin/TopicsPanel'
import AITest from './AITest'
import adminService from '../services/adminService'

const AdminDashboard = ({ onNavigate }) => {
  // Removed admin auth for direct access
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
  const [editingTopicContent, setEditingTopicContent] = useState(null)
  
  // Additional state for TopicsPanel
  const [previewContent, setPreviewContent] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadSystemData()
    loadTopics()
    loadDailyContent()
  }, [])

  // Load topic content when a topic is selected
  useEffect(() => {
    if (selectedTopic) {
      loadTopicContent()
    }
  }, [selectedTopic])

  const loadSystemData = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, systemData: true }))
      setError(null)
      adminService.addLog('Loading system data...', 'info')
      
      // Get real system stats from adminService
      const stats = await adminService.getSystemStats()
      setSystemStats(stats)
      
      // Get logs from adminService
      const systemLogs = adminService.getLogs()
      setLogs(systemLogs)
      
      adminService.addLog('System data loaded successfully', 'success')
    } catch (error) {
      console.error('Error loading system data:', error)
      setError(`Failed to load system data: ${error.message}`)
      adminService.addLog(`Error loading system data: ${error.message}`, 'error')
    } finally {
      setLoadingStates(prev => ({ ...prev, systemData: false }))
      setIsLoading(false)
    }
  }

  const loadTopics = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, topics: true }))
      setError(null)
      adminService.addLog('Loading topics with counts...', 'info')
      const topicsData = await adminService.getAllTopicsWithCounts()
      
      // If no topics exist, create some sample topics
      if (topicsData.length === 0) {
        adminService.addLog('No topics found, creating sample topics...', 'info')
        await createSampleTopics()
        // Reload topics after creating samples
        const newTopicsData = await adminService.getAllTopicsWithCounts()
        setTopics(newTopicsData)
        adminService.addLog(`Created and loaded ${newTopicsData.length} sample topics with counts`, 'success')
      } else {
        setTopics(topicsData)
        adminService.addLog(`Loaded ${topicsData.length} topics with counts`, 'success')
      }
    } catch (error) {
      console.error('Error loading topics:', error)
      setError(`Failed to load topics: ${error.message}`)
      adminService.addLog(`Error loading topics: ${error.message}`, 'error')
    } finally {
      setLoadingStates(prev => ({ ...prev, topics: false }))
    }
  }

  const createSampleTopics = async () => {
    const sampleTopics = [
      {
        title: 'Faith',
        description: 'Believe and receive God\'s promises',
        icon: '✨',
        color: '#f59e0b',
        category: 'spiritual'
      },
      {
        title: 'Peace',
        description: 'God\'s protection and tranquility',
        icon: '🛡️',
        color: '#3b82f6',
        category: 'spiritual'
      },
      {
        title: 'Love',
        description: 'Unconditional love and compassion',
        icon: '❤️',
        color: '#ef4444',
        category: 'spiritual'
      },
      {
        title: 'Wisdom',
        description: 'Divine understanding and guidance',
        icon: '💡',
        color: '#f59e0b',
        category: 'spiritual'
      },
      {
        title: 'Prosperity',
        description: 'Abundant blessings and provision',
        icon: '💰',
        color: '#10b981',
        category: 'spiritual'
      },
      {
        title: 'Relationships',
        description: 'Godly connections and fellowship',
        icon: '👥',
        color: '#8b5cf6',
        category: 'spiritual'
      }
    ]

    for (const topic of sampleTopics) {
      try {
        await adminService.createTopic(topic)
      } catch (error) {
        console.error('Error creating sample topic:', topic.title, error)
      }
    }
  }


  const loadDailyContent = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, dailyContent: true }))
      setError(null)
      adminService.addLog('Loading daily content...', 'info')
      const content = await adminService.getDailyContent()
      setDailyContent(content)
      adminService.addLog(`Loaded ${content.length} daily content entries`, 'success')
    } catch (error) {
      console.error('Error loading daily content:', error)
      setError(`Failed to load daily content: ${error.message}`)
      adminService.addLog(`Error loading daily content: ${error.message}`, 'error')
    } finally {
      setLoadingStates(prev => ({ ...prev, dailyContent: false }))
    }
  }

  const loadTopicContent = async () => {
    if (!selectedTopic) return
    try {
      setLoadingStates(prev => ({ ...prev, topicContent: true }))
      setError(null)
      adminService.addLog(`Loading content for topic: ${selectedTopic.title}`, 'info')
      
      const verses = await adminService.getTopicVerses(selectedTopic.id)
      const confessions = await adminService.getTopicConfessions(selectedTopic.id)
      
      setTopicVerses(verses)
      setTopicConfessions(confessions)
      adminService.addLog(`Loaded ${verses.length} verses and ${confessions.length} confessions`, 'success')
      
      // Refresh topics list to update counters
      await loadTopics()
    } catch (error) {
      console.error('Error loading topic content:', error)
      setError(`Failed to load topic content: ${error.message}`)
      adminService.addLog(`Error loading topic content: ${error.message}`, 'error')
    } finally {
      setLoadingStates(prev => ({ ...prev, topicContent: false }))
    }
  }

  const generateDailyContent = async () => {
    try {
      setIsGenerating(true)
      adminService.addLog('Generating daily content with AI...', 'info')
      await adminService.generateDailyContent()
      await loadDailyContent()
      adminService.addLog('Daily content generated successfully', 'success')
    } catch (error) {
      console.error('Error generating content:', error)
      adminService.addLog(`Error generating content: ${error.message}`, 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      adminService.addLog(`${editingContent ? 'Updating' : 'Creating'} manual content...`, 'info')
      
      if (editingContent) {
        await adminService.updateDailyContent(editingContent.id, manualFormData)
        adminService.addLog('Daily content updated successfully', 'success')
      } else {
        await adminService.createDailyContent(manualFormData)
        adminService.addLog('Daily content created successfully', 'success')
      }
      
      await loadDailyContent()
      resetManualForm()
    } catch (error) {
      console.error('Error saving content:', error)
      adminService.addLog(`Error saving content: ${error.message}`, 'error')
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

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 3000)
  }

  const handleTopicSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      adminService.addLog(`${editingTopic ? 'Updating' : 'Creating'} topic...`, 'info')
      if (editingTopic) {
        await adminService.updateTopic(editingTopic.id, topicFormData)
        showSuccess('Topic updated successfully!')
      } else {
        await adminService.createTopic(topicFormData)
        showSuccess('Topic created successfully!')
      }
      await loadTopics()
      resetTopicForm()
      adminService.addLog(`Topic ${editingTopic ? 'updated' : 'created'} successfully`, 'success')
    } catch (error) {
      console.error('Error saving topic:', error)
      setError(`Failed to save topic: ${error.message}`)
      adminService.addLog(`Error saving topic: ${error.message}`, 'error')
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
      adminService.addLog(`Deleting topic ${topicId}...`, 'info')
      await adminService.deleteTopic(topicId)
      await loadTopics()
      adminService.addLog('Topic deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting topic:', error)
      adminService.addLog(`Error deleting topic: ${error.message}`, 'error')
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
        confession_text: content.confession_text || ''
      })
      setEditingTopicContent(content)
      setShowTopicConfessionForm(true)
    }
  }

  const handleTopicVerseSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      adminService.addLog(`${editingTopicContent ? 'Updating' : 'Creating'} topic verse...`, 'info')
      if (editingTopicContent) {
        await adminService.updateTopicVerse(editingTopicContent.id, topicVerseFormData)
      } else {
        const verseData = {
          ...topicVerseFormData,
          topic_id: selectedTopic.id
        }
        await adminService.createTopicVerse(verseData)
      }
      await loadTopicContent()
      await loadTopics() // Reload topics to update counts
      resetTopicVerseForm()
      adminService.addLog(`Topic verse ${editingTopicContent ? 'updated' : 'created'} successfully`, 'success')
    } catch (error) {
      console.error('Error saving topic verse:', error)
      adminService.addLog(`Error saving topic verse: ${error.message}`, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTopicConfessionSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      adminService.addLog(`${editingTopicContent ? 'Updating' : 'Creating'} topic confession...`, 'info')
      if (editingTopicContent) {
        await adminService.updateTopicConfession(editingTopicContent.id, topicConfessionFormData)
      } else {
        const confessionData = {
          ...topicConfessionFormData,
          topic_id: selectedTopic.id
        }
        await adminService.createTopicConfession(confessionData)
      }
      await loadTopicContent()
      await loadTopics() // Reload topics to update counts
      resetTopicConfessionForm()
      adminService.addLog(`Topic confession ${editingTopicContent ? 'updated' : 'created'} successfully`, 'success')
    } catch (error) {
      console.error('Error saving topic confession:', error)
      adminService.addLog(`Error saving topic confession: ${error.message}`, 'error')
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
      confession_text: ''
    })
    setEditingTopicContent(null)
    setShowTopicConfessionForm(false)
  }

  // Additional functions for TopicsPanel
  const generateTopicContent = async () => {
    try {
      setIsGenerating(true)
      adminService.addLog('Generating topic content with AI...', 'info')
      
      // Generate AI content for the selected topic
      const aiContent = await adminService.generateTopicContentWithAI(selectedTopic.id, 'both')
      
      if (aiContent && aiContent.verses && aiContent.confessions) {
        // Show preview modal with generated content
        setPreviewContent(aiContent)
        setShowPreview(true)
        adminService.addLog('AI content generated successfully - review and approve', 'success')
      } else {
        throw new Error('AI generation failed to return valid content')
      }
    } catch (error) {
      console.error('Error generating topic content:', error)
      adminService.addLog(`Error generating topic content: ${error.message}`, 'error')
      setError(`Failed to generate topic content: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const deleteTopicVerse = async (verseId) => {
    try {
      adminService.addLog(`Deleting topic verse ${verseId}...`, 'info')
      await adminService.deleteTopicVerse(verseId)
      await loadTopicContent()
      await loadTopics() // Reload topics to update counts
      adminService.addLog('Topic verse deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting topic verse:', error)
      adminService.addLog(`Error deleting topic verse: ${error.message}`, 'error')
    }
  }

  const deleteTopicConfession = async (confessionId) => {
    try {
      adminService.addLog(`Deleting topic confession ${confessionId}...`, 'info')
      await adminService.deleteTopicConfession(confessionId)
      await loadTopicContent()
      await loadTopics() // Reload topics to update counts
      adminService.addLog('Topic confession deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting topic confession:', error)
      adminService.addLog(`Error deleting topic confession: ${error.message}`, 'error')
    }
  }

  const approvePreviewContent = async () => {
    try {
      setIsSaving(true)
      adminService.addLog('Saving preview content to database...', 'info')
      
      // Save verses
      for (const verse of previewContent.verses) {
        const verseData = {
          ...verse,
          topic_id: selectedTopic.id
        }
        await adminService.createTopicVerse(verseData)
      }
      
      // Save confessions
      for (const confession of previewContent.confessions) {
        const confessionData = {
          ...confession,
          topic_id: selectedTopic.id
        }
        await adminService.createTopicConfession(confessionData)
      }
      
      adminService.addLog('Preview content saved successfully', 'success')
      setShowPreview(false)
      setPreviewContent(null)
      
      // Reload topic content
      await loadTopicContent()
      await loadTopics() // Reload topics to update counts
    } catch (error) {
      console.error('Error saving preview content:', error)
      adminService.addLog(`Error saving preview content: ${error.message}`, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const rejectPreviewContent = () => {
    setShowPreview(false)
    setPreviewContent(null)
    adminService.addLog('Preview content rejected', 'info')
  }

  const editPreviewContent = (type, index, field, value) => {
    setPreviewContent(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  // Edit daily content
  const editDailyContent = (content) => {
    setManualFormData({
      date: content.date,
      verse_text: content.verse_text,
      reference: content.reference,
      confession_text: content.confession_text,
      translation: content.translation || 'KJV'
    })
    setEditingContent(content)
    setShowManualForm(true)
  }

  // Update daily content
  const updateDailyContent = async (id, updates) => {
    try {
      setIsSaving(true)
      adminService.addLog(`Updating daily content ${id}...`, 'info')
      await adminService.updateDailyContent(id, updates)
      await loadDailyContent()
      adminService.addLog('Daily content updated successfully', 'success')
    } catch (error) {
      console.error('Error updating daily content:', error)
      adminService.addLog(`Error updating daily content: ${error.message}`, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete daily content
  const deleteDailyContent = async (id) => {
    try {
      adminService.addLog(`Deleting daily content ${id}...`, 'info')
      await adminService.deleteDailyContent(id)
      await loadDailyContent()
      adminService.addLog('Daily content deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting daily content:', error)
      adminService.addLog(`Error deleting daily content: ${error.message}`, 'error')
    }
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
              {/* Admin User Info */}
              {adminUser && (
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {adminUser.full_name || adminUser.email}
                  </span>
                </div>
              )}
              
              {/* Logout Button */}
              <Button
                onClick={async () => {
                  await adminSignOut()
                  onNavigate('landing')
                }}
                variant="outline"
                className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
              
              <Badge variant="outline" className="bg-green-100 text-green-800">
                System Online
              </Badge>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                <span className="text-lg font-medium text-gray-900">Loading Admin Dashboard...</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
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
            <TabsTrigger value="ai-test" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>AI Test</span>
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
              editDailyContent={editDailyContent}
              deleteDailyContent={deleteDailyContent}
            />
          </TabsContent>

          <TabsContent value="topics" className="relative">
            {loadingStates.topics && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading topics...</p>
                </div>
              </div>
            )}
            <TopicsPanel
              topics={topics}
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
              topicVerses={topicVerses}
              topicConfessions={topicConfessions}
              loadTopicContent={loadTopicContent}
              generateTopicContent={generateTopicContent}
              isGenerating={isGenerating}
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
              deleteTopicVerse={deleteTopicVerse}
              deleteTopicConfession={deleteTopicConfession}
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
              previewContent={previewContent}
              showPreview={showPreview}
              setShowPreview={setShowPreview}
              approvePreviewContent={approvePreviewContent}
              rejectPreviewContent={rejectPreviewContent}
              editPreviewContent={editPreviewContent}
              loadTopics={loadTopics}
            />
          </TabsContent>

          <TabsContent value="ai-test">
            <AITest />
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <Input
                      value={topicFormData.title}
                      onChange={(e) => setTopicFormData({...topicFormData, title: e.target.value})}
                      placeholder="Enter topic title..."
                      required
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <Textarea
                      value={topicFormData.description}
                      onChange={(e) => setTopicFormData({...topicFormData, description: e.target.value})}
                      placeholder="Enter topic description..."
                      className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icon *</label>
                      <Input
                        value={topicFormData.icon}
                        onChange={(e) => setTopicFormData({...topicFormData, icon: e.target.value})}
                        placeholder="📖"
                        required
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <Input
                        value={topicFormData.category}
                        onChange={(e) => setTopicFormData({...topicFormData, category: e.target.value})}
                        placeholder="general"
                        required
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Verse Text *</label>
                    <Textarea
                      value={topicVerseFormData.verse_text}
                      onChange={(e) => setTopicVerseFormData({...topicVerseFormData, verse_text: e.target.value})}
                      placeholder="Enter the Bible verse text..."
                      className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Book *</label>
                      <Input
                        value={topicVerseFormData.book}
                        onChange={(e) => setTopicVerseFormData({...topicVerseFormData, book: e.target.value})}
                        placeholder="e.g., John"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chapter *</label>
                      <Input
                        type="number"
                        value={topicVerseFormData.chapter}
                        onChange={(e) => setTopicVerseFormData({...topicVerseFormData, chapter: e.target.value})}
                        placeholder="3"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Verse *</label>
                      <Input
                        type="number"
                        value={topicVerseFormData.verse}
                        onChange={(e) => setTopicVerseFormData({...topicVerseFormData, verse: e.target.value})}
                        placeholder="16"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Translation</label>
                      <select
                        value={topicVerseFormData.translation}
                        onChange={(e) => setTopicVerseFormData({...topicVerseFormData, translation: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="KJV">King James Version (KJV)</option>
                        <option value="NIV">New International Version (NIV)</option>
                        <option value="ESV">English Standard Version (ESV)</option>
                        <option value="NASB">New American Standard Bible (NASB)</option>
                        <option value="NLT">New Living Translation (NLT)</option>
                        <option value="NKJV">New King James Version (NKJV)</option>
                        <option value="AMP">Amplified Bible (AMP)</option>
                        <option value="MSG">The Message (MSG)</option>
                        <option value="CEV">Contemporary English Version (CEV)</option>
                        <option value="NRSV">New Revised Standard Version (NRSV)</option>
                        <option value="CSB">Christian Standard Bible (CSB)</option>
                        <option value="NET">New English Translation (NET)</option>
                        <option value="RSV">Revised Standard Version (RSV)</option>
                        <option value="ASV">American Standard Version (ASV)</option>
                        <option value="YLT">Young's Literal Translation (YLT)</option>
                        <option value="WEB">World English Bible (WEB)</option>
                        <option value="TLV">Tree of Life Version (TLV)</option>
                        <option value="TPT">The Passion Translation (TPT)</option>
                        <option value="ERV">Easy-to-Read Version (ERV)</option>
                        <option value="JUB">Jubilee Bible (JUB)</option>
                      </select>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <Input
                      value={topicConfessionFormData.title}
                      onChange={(e) => setTopicConfessionFormData({...topicConfessionFormData, title: e.target.value})}
                      placeholder="Enter confession title..."
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confession Text *</label>
                    <Textarea
                      value={topicConfessionFormData.confession_text}
                      onChange={(e) => setTopicConfessionFormData({...topicConfessionFormData, confession_text: e.target.value})}
                      placeholder="Enter the confession text..."
                      className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      rows={4}
                      required
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

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50">
          <Card className="bg-green-500 text-white p-4 shadow-lg border-0">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">{successMessage}</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard