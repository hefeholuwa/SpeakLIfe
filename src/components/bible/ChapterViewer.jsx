import React from 'react'

const ChapterViewer = ({ book, chapter, content, loading, error, onBack }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{book.name} {chapter}</h2>
            <p className="text-gray-600">Loading chapter content...</p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span>←</span>
            <span>Back to Chapters</span>
          </button>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{book.name} {chapter}</h2>
            <p className="text-gray-600">Error loading chapter</p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span>←</span>
            <span>Back to Chapters</span>
          </button>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg font-medium mb-2">⚠️ Error Loading Chapter</div>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{book.name} {chapter}</h2>
          <p className="text-gray-600">Chapter {chapter}</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span>←</span>
          <span>Back to Chapters</span>
        </button>
      </div>

      {/* Bible Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {content ? (
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-800 leading-relaxed">
              {content.data ? (
                <div className="space-y-3">
                  {(() => {
                    // Deduplicate verses by verse number
                    const uniqueVerses = new Map()
                    content.data.forEach(verse => {
                      const verseNum = parseInt(verse.verse)
                      if (!uniqueVerses.has(verseNum)) {
                        uniqueVerses.set(verseNum, verse)
                      }
                    })
                    
                    // Convert to array and sort by verse number
                    const deduplicatedVerses = Array.from(uniqueVerses.values()).sort((a, b) => parseInt(a.verse) - parseInt(b.verse))
                    
                    return deduplicatedVerses.map((verse, index) => {
                      // Clean up the text by removing Hebrew annotations and formatting issues
                      const cleanText = verse.text
                        .replace(/\d+\.\d+\s+[^:]+:/g, '') // Remove numbered annotations like "1.4 the light from…: Heb. between the light and between the darkness"
                        .replace(/\d+\.\d+\s+[^:]+/g, '') // Remove remaining numbered annotations
                        .replace(/\bHeb\.\s+[^.]*\.?/g, '') // Remove "Heb. ..." annotations
                        .replace(/\bor,\s+[^.]*\.?/g, '') // Remove "or, ..." annotations
                        .replace(/¶\s*/g, '') // Remove paragraph symbols
                        .replace(/\bseeding\s+seed\b/g, '') // Remove "seeding seed" annotations
                        .replace(/\bgreen…:\s+Heb\.\s+[^.]*\.?/g, '') // Remove "green…: Heb. ..." annotations
                        .replace(/\bstill…:\s+Heb\.\s+[^.]*\.?/g, '') // Remove "still…: Heb. ..." annotations
                        .replace(/\banointest:\s+Heb\.\s+[^.]*\.?/g, '') // Remove "anointest: Heb. ..." annotations
                        .replace(/\bfor ever:\s+Heb\.\s+[^.]*\.?/g, '') // Remove "for ever: Heb. ..." annotations
                        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                        .trim() // Remove leading/trailing spaces
                      
                      return (
                        <p key={index} className="mb-3">
                          <span className="font-semibold text-purple-600 mr-2">{verse.verse}.</span>
                          {cleanText}
                        </p>
                      )
                    })
                  })()}
                </div>
              ) : content.text ? (
                <div dangerouslySetInnerHTML={{ __html: content.text }} />
              ) : (
                <p className="text-gray-600 italic">No content available for this chapter.</p>
              )}
            </div>
            
            {content.reference && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  <strong>Reference:</strong> {content.reference}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No content available for this chapter.</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <span>←</span>
          <span>Back to Chapters</span>
        </button>
        
        <div className="text-sm text-gray-500 flex items-center">
          {book.name} • Chapter {chapter}
        </div>
      </div>
    </div>
  )
}

export default ChapterViewer