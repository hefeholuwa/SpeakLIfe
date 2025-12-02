import React, { useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import {
  BookOpen,
  MessageCircle,
  Plus,
  Edit,
  Save,
  X,
  RefreshCw,
  Brain,
  Sparkles,
  AlertTriangle,
  Trash2,
  CheckCircle
} from 'lucide-react'

import CalendarView from './content/CalendarView'
import BulkUpload from './content/BulkUpload'
import SeriesManager from './content/SeriesManager'
import { Calendar, Upload, Layers, List } from 'lucide-react'

const ContentManagementPanel = ({
  dailyContent,
  loadDailyContent,
  generateDailyContent,
  isGenerating,
  showManualForm,
  setShowManualForm,
  manualFormData,
  setManualFormData,
  handleManualSubmit,
  resetManualForm,
  editingContent,
  isSaving,
  editDailyContent,
  deleteDailyContent
}) => {
  const [activeView, setActiveView] = useState('list') // 'list', 'calendar', 'upload', 'series'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [contentToDelete, setContentToDelete] = useState(null)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleDeleteClick = (content) => {
    setContentToDelete(content)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = () => {
    if (contentToDelete) {
      deleteDailyContent(contentToDelete.id)
      setShowDeleteConfirm(false)
      setContentToDelete(null)
      setSuccessMessage('Content deleted successfully!')
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
    setContentToDelete(null)
  }

  return (
    <div className="space-y-8">
      {/* Content Statistics */}
      <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <BookOpen className="h-6 w-6 mr-3 text-blue-600" />
            Content Management
          </h3>
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveView('list')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeView === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <List size={16} />
              List
            </button>
            <button
              onClick={() => setActiveView('calendar')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeView === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Calendar size={16} />
              Calendar
            </button>
            <button
              onClick={() => setActiveView('upload')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeView === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Upload size={16} />
              Bulk Upload
            </button>
            <button
              onClick={() => setActiveView('series')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeView === 'series' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Layers size={16} />
              Series
            </button>
          </div>
        </div>

        {activeView === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Daily Verses</p>
                  <p className="text-2xl font-bold text-blue-900">{dailyContent.length}</p>
                </div>
                <BookOpen className="h-6 w-6 text-blue-500" />
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Confessions</p>
                  <p className="text-2xl font-bold text-green-900">{dailyContent.length}</p>
                </div>
                <MessageCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">This Month</p>
                  <p className="text-2xl font-bold text-purple-900">+24</p>
                </div>
                <RefreshCw className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* AI Generation for Daily Content - Only show in List view */}
      {activeView === 'list' && (
        <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-lg font-bold text-purple-900 mb-1 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-600" />
                  AI Content Generation
                </h5>
                <p className="text-purple-700">Generate today's verse and confession with AI</p>
              </div>
              <Button
                onClick={generateDailyContent}
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-md"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Daily Content
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Manual Content Form - Show in List or Calendar view */}
      {(activeView === 'list' || activeView === 'calendar') && showManualForm && (
        <Card className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <h4 className="text-lg font-bold text-gray-900">
              {editingContent ? 'Edit Content' : 'Add New Content'}
            </h4>
            <Button
              onClick={resetManualForm}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <Input
                  type="date"
                  value={manualFormData.date}
                  onChange={(e) => setManualFormData({ ...manualFormData, date: e.target.value })}
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Translation</label>
                <Input
                  value={manualFormData.translation}
                  onChange={(e) => setManualFormData({ ...manualFormData, translation: e.target.value })}
                  placeholder="KJV"
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verse Text</label>
              <Textarea
                value={manualFormData.verse_text}
                onChange={(e) => setManualFormData({ ...manualFormData, verse_text: e.target.value })}
                placeholder="Enter the Bible verse text..."
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
              <Input
                value={manualFormData.reference}
                onChange={(e) => setManualFormData({ ...manualFormData, reference: e.target.value })}
                placeholder="John 3:16"
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confession Text</label>
              <Textarea
                value={manualFormData.confession_text}
                onChange={(e) => setManualFormData({ ...manualFormData, confession_text: e.target.value })}
                placeholder="Enter the confession text..."
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingContent ? 'Update Content' : 'Add Content'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={resetManualForm}
                variant="outline"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Views */}
      {activeView === 'list' && (
        <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-gray-900">Recent Content</h4>
            <Button
              onClick={() => setShowManualForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </div>
          <div className="space-y-3">
            {dailyContent.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <BookOpen className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500 font-medium">No content available</p>
                <p className="text-sm text-gray-400">Add content manually or use AI generation</p>
              </div>
            ) : (
              dailyContent.slice(0, 50).map((content) => (
                <div key={content.id} className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                          {content.date}
                        </Badge>
                        <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
                          {content.reference}
                        </Badge>
                      </div>
                      <p className="text-gray-800 text-lg leading-relaxed font-serif mb-2">"{content.verse_text}"</p>
                      {content.confession_text && (
                        <div className="flex items-start mt-2 pl-3 border-l-2 border-green-400">
                          <p className="text-sm text-gray-600 italic">
                            <span className="font-medium text-green-700 not-italic mr-1">Confession:</span>
                            {content.confession_text}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() => editDailyContent(content)}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(content)}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {activeView === 'calendar' && (
        <CalendarView
          onEdit={(content) => {
            if (content.id) {
              editDailyContent(content)
            } else {
              // Pre-fill date for new content
              setManualFormData(prev => ({ ...prev, date: content.date }))
              setShowManualForm(true)
            }
          }}
          onDelete={deleteDailyContent}
        />
      )}

      {activeView === 'upload' && (
        <BulkUpload onComplete={loadDailyContent} />
      )}

      {activeView === 'series' && (
        <SeriesManager />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-white border border-gray-200 shadow-2xl rounded-xl">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Content</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              {contentToDelete && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline" className="bg-white text-gray-700 border-gray-200">
                      {contentToDelete.date}
                    </Badge>
                  </div>
                  <p className="font-medium text-gray-900">{contentToDelete.reference} ({contentToDelete.translation || 'KJV'})</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">"{contentToDelete.verse_text}"</p>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3">
                <Button
                  onClick={handleDeleteCancel}
                  variant="outline"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Content
                </Button>
              </div>
            </div>
          </Card>
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
    </div>
  )
}

export default ContentManagementPanel
