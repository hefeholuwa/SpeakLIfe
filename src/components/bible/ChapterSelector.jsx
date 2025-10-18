import React from 'react'

const ChapterSelector = ({ book, onChapterSelect, onBack }) => {
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{book.name}</h2>
          <p className="text-gray-600">Select a chapter to read</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span>←</span>
          <span>Back to Books</span>
        </button>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
        {chapters.map((chapter) => (
          <button
            key={chapter}
            onClick={() => onChapterSelect(chapter)}
            className="aspect-square flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600 transition-colors font-medium"
          >
            {chapter}
          </button>
        ))}
      </div>

      {/* Book Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold">
            {book.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{book.name}</h3>
            <p className="text-sm text-gray-600">{book.testament} Testament • {book.chapters} chapters</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChapterSelector