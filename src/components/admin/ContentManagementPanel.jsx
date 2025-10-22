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
      <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <BookOpen className="h-6 w-6 mr-3 text-blue-500" />
            Content Management
          </h3>
          <Button
            onClick={() => setShowManualForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Daily Verses</p>
                <p className="text-2xl font-bold text-blue-900">{dailyContent.length}</p>
              </div>
              <BookOpen className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Confessions</p>
                <p className="text-2xl font-bold text-green-900">{dailyContent.length}</p>
              </div>
              <MessageCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">This Month</p>
                <p className="text-2xl font-bold text-purple-900">+24</p>
              </div>
              <RefreshCw className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>
      </Card>

      {/* AI Generation for Daily Content */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl">
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
          <h5 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            AI Generation
          </h5>
          <p className="text-purple-700 mb-4">Generate today's verse and confession with AI</p>
          <Button 
            onClick={generateDailyContent}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg"
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
      </Card>

      {/* Manual Content Form */}
      {showManualForm && (
        <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              {editingContent ? 'Edit Content' : 'Add New Content'}
            </h4>
            <Button
              onClick={resetManualForm}
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <Input
                  type="date"
                  value={manualFormData.date}
                  onChange={(e) => setManualFormData({...manualFormData, date: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Translation</label>
                <Input
                  value={manualFormData.translation}
                  onChange={(e) => setManualFormData({...manualFormData, translation: e.target.value})}
                  placeholder="KJV"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verse Text</label>
              <Textarea
                value={manualFormData.verse_text}
                onChange={(e) => setManualFormData({...manualFormData, verse_text: e.target.value})}
                placeholder="Enter the Bible verse text..."
                className="w-full"
                rows={3}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
              <Input
                value={manualFormData.reference}
                onChange={(e) => setManualFormData({...manualFormData, reference: e.target.value})}
                placeholder="John 3:16"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confession Text</label>
              <Textarea
                value={manualFormData.confession_text}
                onChange={(e) => setManualFormData({...manualFormData, confession_text: e.target.value})}
                placeholder="Enter the confession text..."
                className="w-full"
                rows={3}
                required
              />
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

      {/* Content List */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Content</h4>
        <div className="space-y-3">
          {dailyContent.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No content available</p>
            </div>
          ) : (
            dailyContent.slice(0, 5).map((content) => (
              <div key={content.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {content.date}
                      </Badge>
                    </div>
                    <p className="font-medium text-gray-900">{content.reference} ({content.translation || 'KJV'})</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{content.verse_text}</p>
                    {content.confession_text && (
                      <p className="text-xs text-gray-500 mt-2 italic line-clamp-1">
                        Confession: {content.confession_text}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => editDailyContent(content)}
                      size="sm"
                      variant="outline"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(content)}
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Beautiful Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Content</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              {contentToDelete && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {contentToDelete.date}
                    </Badge>
                  </div>
                  <p className="font-medium text-gray-900">{contentToDelete.reference} ({contentToDelete.translation || 'KJV'})</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{contentToDelete.verse_text}</p>
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
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Content
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Beautiful Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <Card className="bg-green-50 border-green-200 shadow-lg">
            <div className="flex items-center space-x-3 p-4">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-900">Success!</p>
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
              <Button
                onClick={() => setShowSuccessToast(false)}
                size="sm"
                variant="ghost"
                className="text-green-600 hover:bg-green-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ContentManagementPanel
