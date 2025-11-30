import React, { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
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
  Shield,
  Menu,
  Home,
  LayoutDashboard
} from 'lucide-react'

// Import the optimized panels
import OverviewPanel from './admin/OverviewPanel'
import ContentManagementPanel from './admin/ContentManagementPanel'
import ReadingPlansPanel from './admin/ReadingPlansPanel'
import AITest from './AITest'
import adminService from '../services/adminService'

const AdminDashboard = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
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



  useEffect(() => {
    // Simplified initialization - no async calls that could hang
    setIsLoading(false)
    loadSystemData() // Load initial data
  }, [])



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
    <div className="min-h-screen bg-[#FDFCF8] text-gray-900 font-sans pb-24 md:pb-0">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 border-r border-gray-100 bg-white/50 backdrop-blur-xl z-30">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-gray-900/10">SL</div>
            <span className="font-bold text-xl tracking-tight text-gray-900">Admin</span>
          </div>

          <nav className="space-y-2">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
              <LayoutDashboard size={20} />
              <span className="font-medium">Overview</span>
            </button>
            <button onClick={() => { setActiveTab('content'); loadDailyContent(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'content' ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
              <FileText size={20} />
              <span className="font-medium">Content</span>
            </button>
            <button onClick={() => setActiveTab('plans')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'plans' ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
              <BookOpen size={20} />
              <span className="font-medium">Reading Plans</span>
            </button>
            <button onClick={() => setActiveTab('ai-test')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'ai-test' ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Brain size={20} />
              <span className="font-medium">AI Test</span>
            </button>
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </button>
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-gray-100">
          <button onClick={() => onNavigate('landing')} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors">
            <LogOut size={18} />
            Back to App
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-[#FDFCF8]/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg">SL</div>
          <span className="font-bold text-lg text-gray-900">Admin</span>
        </div>
        <button onClick={() => setShowMobileMenu(true)} className="p-2 -mr-2 text-gray-600">
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 bg-white animate-fade-in">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-xl">Menu</span>
              <button onClick={() => setShowMobileMenu(false)} className="p-2 -mr-2 bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <nav className="space-y-4">
              <button onClick={() => { setActiveTab('overview'); setShowMobileMenu(false) }} className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-2xl font-bold text-gray-900">
                <LayoutDashboard size={24} /> Overview
              </button>
              <button onClick={() => { setActiveTab('content'); loadDailyContent(); setShowMobileMenu(false) }} className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-2xl font-bold text-gray-900">
                <FileText size={24} /> Content
              </button>
              <button onClick={() => { setActiveTab('plans'); setShowMobileMenu(false) }} className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-2xl font-bold text-gray-900">
                <BookOpen size={24} /> Reading Plans
              </button>

              <button onClick={() => { setActiveTab('ai-test'); setShowMobileMenu(false) }} className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-2xl font-bold text-gray-900">
                <Brain size={24} /> AI Test
              </button>
              <button onClick={() => onNavigate('landing')} className="w-full flex items-center gap-4 p-4 bg-red-50 text-red-600 rounded-2xl font-bold mt-8">
                <LogOut size={24} /> Back to App
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="md:pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-6 md:p-12">

          {/* Header Actions */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black text-gray-900">
              {activeTab === 'overview' && 'System Overview'}
              {activeTab === 'content' && 'Content Management'}
              {activeTab === 'plans' && 'Reading Plans Management'}
              {activeTab === 'ai-test' && 'AI Capabilities'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  loadSystemData()
                  if (activeTab === 'content') loadDailyContent()
                }}
                variant="outline"
                className="bg-white border-gray-200 hover:bg-gray-50 text-gray-600"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2">
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
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Toast */}
          {showSuccessToast && (
            <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
              <Card className="bg-green-600 text-white p-4 shadow-lg border-0 rounded-xl">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">{successMessage}</span>
                </div>
              </Card>
            </div>
          )}

          {/* Content Area */}
          <div className="animate-fade-in-up">
            {activeTab === 'overview' && (
              <OverviewPanel
                systemStats={systemStats}
                logs={logs}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'content' && (
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
            )}

            {activeTab === 'plans' && (
              <ReadingPlansPanel />
            )}

            {activeTab === 'ai-test' && (
              <AITest />
            )}

            {activeTab === 'settings' && (
              <Card className="p-8 bg-white border border-gray-200 shadow-sm rounded-xl text-center py-20">
                <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">Settings</h3>
                <p className="text-gray-500">Global application settings coming soon.</p>
              </Card>
            )}
          </div>
        </div>
      </main>
      {/* Global Styles for Animations */}
      <style jsx="true">{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default AdminDashboard