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
  Trash2,
  Brain,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react'

const TopicsPanel = ({ 
  topics,
  selectedTopic,
  setSelectedTopic,
  topicVerses,
  topicConfessions,
  loadTopicContent,
  generateTopicContent,
  isGenerating,
  showTopicForm,
  setShowTopicForm,
  topicFormData,
  setTopicFormData,
  handleTopicSubmit,
  resetTopicForm,
  editingTopic,
  deleteTopic,
  editTopic,
  editTopicContent,
  deleteTopicVerse,
  deleteTopicConfession,
  showTopicVerseForm,
  setShowTopicVerseForm,
  showTopicConfessionForm,
  setShowTopicConfessionForm,
  topicVerseFormData,
  setTopicVerseFormData,
  topicConfessionFormData,
  setTopicConfessionFormData,
  handleTopicVerseSubmit,
  handleTopicConfessionSubmit,
  resetTopicVerseForm,
  resetTopicConfessionForm,
  editingTopicContent,
  isSaving,
  previewContent,
  showPreview,
  setShowPreview,
  approvePreviewContent,
  rejectPreviewContent,
  editPreviewContent
}) => {
  // Local state for confirmation dialogs and notifications
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [contentToDelete, setContentToDelete] = useState(null)
  const [deleteType, setDeleteType] = useState('') // 'topic', 'verse', 'confession'
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showTopicDetails, setShowTopicDetails] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Handler functions for confirmation dialogs
  const handleDeleteClick = (content, type) => {
    setContentToDelete(content)
    setDeleteType(type)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      if (deleteType === 'topic') {
        await deleteTopic(contentToDelete.id)
        setSuccessMessage('Topic deleted successfully')
      } else if (deleteType === 'verse') {
        await deleteTopicVerse(contentToDelete.id)
        setSuccessMessage('Verse deleted successfully')
      } else if (deleteType === 'confession') {
        await deleteTopicConfession(contentToDelete.id)
        setSuccessMessage('Confession deleted successfully')
      }
      
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    } catch (error) {
      console.error('Error deleting content:', error)
      setError(`Failed to delete ${deleteType}: ${error.message}`)
    } finally {
      setIsLoading(false)
      setShowDeleteConfirm(false)
      setContentToDelete(null)
      setDeleteType('')
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
    setContentToDelete(null)
    setDeleteType('')
  }

  const toggleTopicDetails = (topicId) => {
    setShowTopicDetails(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }))
  }

  return (
    <div className="space-y-8">
      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 border border-red-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
            <Button
              onClick={() => setError(null)}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Topics Header */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Topic Management</h3>
              <p className="text-gray-600">Manage spiritual topics and their content</p>
            </div>
          </div>
          <Button
            onClick={() => setShowTopicForm(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Topic
          </Button>
        </div>
      </Card>

      {/* Topics Grid */}
      {!topics || topics.length === 0 ? (
        <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Topics Found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first topic</p>
              <Button
                onClick={() => setShowTopicForm(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Topic
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
          <Card 
            key={topic.id}
            className={`p-6 bg-white/80 backdrop-blur-sm border-2 transition-all duration-300 hover:shadow-xl cursor-pointer ${
              selectedTopic?.id === topic.id
                ? 'border-cyan-300 bg-cyan-50 shadow-lg'
                : 'border-gray-200 hover:border-cyan-200'
            }`}
            onClick={() => setSelectedTopic(topic)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{topic.icon}</span>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{topic.title}</h4>
                  <p className="text-sm text-gray-600">{topic.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    editTopic(topic)
                  }}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteClick(topic, 'topic')
                  }}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <p className="text-gray-700 text-sm mb-4 line-clamp-2">{topic.description}</p>
            
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-gray-100 text-gray-700">
                {topic.verse_count || 0} verses • {topic.confession_count || 0} confessions
              </Badge>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Total: {topic.total_content || 0} items</span>
              </div>
            </div>
          </Card>
          ))}
        </div>
      )}

          {/* Selected Topic Details */}
          {selectedTopic && (
            <Card className="p-8 bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl">{selectedTopic.icon}</span>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900">{selectedTopic.title}</h4>
                    <p className="text-gray-600">{selectedTopic.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="outline" className="bg-gray-100">
                        {selectedTopic.category}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {selectedTopic.verse_count || 0} verses • {selectedTopic.confession_count || 0} confessions
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedTopic(null)}
                  variant="outline"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>

              {/* AI Generation Section */}
              <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <h5 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  AI Generation for {selectedTopic.title}
                </h5>
                <p className="text-purple-700 mb-4">Generate 3 verses and 3 confessions for this topic</p>
                <Button 
                  onClick={generateTopicContent}
                  disabled={isGenerating || isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating AI Content...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate 3 Verses + 3 Confessions
                    </>
                  )}
                </Button>
              </div>

          {/* Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Verses Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-lg font-semibold text-gray-800 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                  Bible Verses ({topicVerses.length})
                </h5>
                <Button
                  onClick={() => setShowTopicVerseForm(true)}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Verse
                </Button>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {topicVerses.map((verse, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-blue-900 text-sm">
                          {verse.reference} {verse.translation && <span className="text-blue-600 text-xs">({verse.translation})</span>}
                        </p>
                        <p className="text-blue-700 text-sm mt-1 italic">"{verse.verse_text}"</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          onClick={() => editTopicContent(verse, 'verse')}
                          size="sm"
                          variant="outline"
                          className="border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteClick(verse, 'verse')}
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {topicVerses.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No verses added yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Confessions Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-lg font-semibold text-gray-800 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-green-500" />
                  Confessions ({topicConfessions.length})
                </h5>
                <Button
                  onClick={() => setShowTopicConfessionForm(true)}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Confession
                </Button>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {topicConfessions.map((confession, index) => (
                  <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-green-900 text-sm">{confession.title}</p>
                        <p className="text-green-700 text-sm mt-1">"{confession.confession_text}"</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          onClick={() => editTopicContent(confession, 'confession')}
                          size="sm"
                          variant="outline"
                          className="border-green-300 text-green-600 hover:bg-green-50"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteClick(confession, 'confession')}
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {topicConfessions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No confessions added yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Preview Modal */}
      {showPreview && previewContent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Preview AI Generated Content</h3>
                    <p className="text-gray-600">Review and edit before saving to database</p>
                  </div>
                </div>
                <Button
                  onClick={rejectPreviewContent}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>

              {/* Verses Preview */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Generated Verses ({previewContent.verses.length})
                </h4>
                <div className="space-y-4">
                  {previewContent.verses.map((verse, index) => (
                    <Card key={index} className="p-4 border border-blue-200 bg-blue-50/50">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline" className="text-blue-600 border-blue-300">
                                Verse {index + 1}
                              </Badge>
                              <Badge variant="outline" className="text-gray-600">
                                {verse.translation}
                              </Badge>
                            </div>
                            <Textarea
                              value={verse.verse_text}
                              onChange={(e) => editPreviewContent('verse', index, 'verse_text', e.target.value)}
                              className="mb-2 bg-white border-blue-200"
                              rows={3}
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-sm font-medium text-gray-700">Reference</label>
                                <Input
                                  value={verse.reference}
                                  onChange={(e) => editPreviewContent('verse', index, 'reference', e.target.value)}
                                  className="bg-white border-blue-200"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700">Book</label>
                                <Input
                                  value={verse.book}
                                  onChange={(e) => editPreviewContent('verse', index, 'book', e.target.value)}
                                  className="bg-white border-blue-200"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Confessions Preview */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
                  Generated Confessions ({previewContent.confessions.length})
                </h4>
                <div className="space-y-4">
                  {previewContent.confessions.map((confession, index) => (
                    <Card key={index} className="p-4 border border-green-200 bg-green-50/50">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline" className="text-green-600 border-green-300">
                                Confession {index + 1}
                              </Badge>
                            </div>
                            <div className="mb-3">
                              <label className="text-sm font-medium text-gray-700">Title</label>
                              <Input
                                value={confession.title}
                                onChange={(e) => editPreviewContent('confession', index, 'title', e.target.value)}
                                className="bg-white border-green-200"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">Confession Text</label>
                              <Textarea
                                value={confession.confession_text}
                                onChange={(e) => editPreviewContent('confession', index, 'confession_text', e.target.value)}
                                className="bg-white border-green-200"
                                rows={3}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Review and edit the content above before saving to the database
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={rejectPreviewContent}
                    variant="outline"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={approvePreviewContent}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save to Database
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete {deleteType === 'topic' ? 'Topic' : deleteType === 'verse' ? 'Verse' : 'Confession'}</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              {contentToDelete && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  {deleteType === 'topic' && (
                    <>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{contentToDelete.icon}</span>
                        <div>
                          <p className="font-medium text-gray-900">{contentToDelete.title}</p>
                          <p className="text-sm text-gray-600">{contentToDelete.description}</p>
                        </div>
                      </div>
                    </>
                  )}
                  {deleteType === 'verse' && (
                    <>
                      <p className="font-medium text-gray-900">{contentToDelete.reference}</p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">"{contentToDelete.verse_text}"</p>
                    </>
                  )}
                  {deleteType === 'confession' && (
                    <>
                      <p className="font-medium text-gray-900">{contentToDelete.title}</p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">"{contentToDelete.confession_text}"</p>
                    </>
                  )}
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
                  disabled={isLoading}
                  className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete {deleteType === 'topic' ? 'Topic' : deleteType === 'verse' ? 'Verse' : 'Confession'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

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

export default TopicsPanel
