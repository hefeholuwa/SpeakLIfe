import React, { useState } from 'react'
import { bibleBooks } from '../../data/bibleBooks'

const BookSelector = ({ onSelectBook }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all") // "all", "old", "new"

  const oldTestament = bibleBooks.filter((book) => book.testament === "Old")
  const newTestament = bibleBooks.filter((book) => book.testament === "New")

  const filterBooks = (books) => {
    if (!searchQuery) return books
    return books.filter((book) =>
      book.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const getCurrentBooks = () => {
    switch (activeTab) {
      case "old":
        return filterBooks(oldTestament)
      case "new":
        return filterBooks(newTestament)
      default:
        return filterBooks(bibleBooks)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSearchQuery("") // Clear search when switching tabs
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search books..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          🔍
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => handleTabChange("all")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "all"
              ? "bg-white text-purple-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          All Books
        </button>
        <button
          onClick={() => handleTabChange("old")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "old"
              ? "bg-white text-purple-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Old Testament
        </button>
        <button
          onClick={() => handleTabChange("new")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "new"
              ? "bg-white text-purple-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          New Testament
        </button>
      </div>

      {/* Books List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {getCurrentBooks().map((book) => (
          <button
            key={book.name}
            onClick={() => onSelectBook(book)}
            className="p-4 text-left bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold text-sm group-hover:bg-purple-200 transition-colors">
                {book.abbreviation}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{book.name}</h3>
                <p className="text-sm text-gray-500">{book.testament} Testament</p>
                <p className="text-xs text-gray-400">{book.chapters} chapters</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {getCurrentBooks().length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No books found matching your search.
        </div>
      )}
    </div>
  )
}

export default BookSelector