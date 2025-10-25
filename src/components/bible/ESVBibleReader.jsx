import React, { useState, useEffect } from 'react'
import { bibleBooks } from '../../data/bibleBooks'

const ESVBibleReader = () => {
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(1)
  const [bibleContent, setBibleContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fontSize, setFontSize] = useState(18)
  const [showBookSelector, setShowBookSelector] = useState(false)
  const [showChapterSelector, setShowChapterSelector] = useState(false)

  // Book code mapping for API
  const bookCodeMap = {
    'Genesis': 'genesis',
    'Exodus': 'exodus',
    'Leviticus': 'leviticus',
    'Numbers': 'numbers',
    'Deuteronomy': 'deuteronomy',
    'Joshua': 'joshua',
    'Judges': 'judges',
    'Ruth': 'ruth',
    '1 Samuel': '1samuel',
    '2 Samuel': '2samuel',
    '1 Kings': '1kings',
    '2 Kings': '2kings',
    '1 Chronicles': '1chronicles',
    '2 Chronicles': '2chronicles',
    'Ezra': 'ezra',
    'Nehemiah': 'nehemiah',
    'Esther': 'esther',
    'Job': 'job',
    'Psalms': 'psalms',
    'Proverbs': 'proverbs',
    'Ecclesiastes': 'ecclesiastes',
    'Song of Solomon': 'songofsolomon',
    'Isaiah': 'isaiah',
    'Jeremiah': 'jeremiah',
    'Lamentations': 'lamentations',
    'Ezekiel': 'ezekiel',
    'Daniel': 'daniel',
    'Hosea': 'hosea',
    'Joel': 'joel',
    'Amos': 'amos',
    'Obadiah': 'obadiah',
    'Jonah': 'jonah',
    'Micah': 'micah',
    'Nahum': 'nahum',
    'Habakkuk': 'habakkuk',
    'Zephaniah': 'zephaniah',
    'Haggai': 'haggai',
    'Zechariah': 'zechariah',
    'Malachi': 'malachi',
    'Matthew': 'matthew',
    'Mark': 'mark',
    'Luke': 'luke',
    'John': 'john',
    'Acts': 'acts',
    'Romans': 'romans',
    '1 Corinthians': '1corinthians',
    '2 Corinthians': '2corinthians',
    'Galatians': 'galatians',
    'Ephesians': 'ephesians',
    'Philippians': 'philippians',
    'Colossians': 'colossians',
    '1 Thessalonians': '1thessalonians',
    '2 Thessalonians': '2thessalonians',
    '1 Timothy': '1timothy',
    '2 Timothy': '2timothy',
    'Titus': 'titus',
    'Philemon': 'philemon',
    'Hebrews': 'hebrews',
    'James': 'james',
    '1 Peter': '1peter',
    '2 Peter': '2peter',
    '1 John': '1john',
    '2 John': '2john',
    '3 John': '3john',
    'Jude': 'jude',
    'Revelation': 'revelation'
  }

  // Fetch chapter content
  const fetchChapterContent = async (book, chapter) => {
    setLoading(true)
    setError(null)
    
    try {
      const bookCode = bookCodeMap[book.name] || book.name.toLowerCase().replace(/\s+/g, '')
      const url = `https://raw.githubusercontent.com/wldeh/bible-api/main/bibles/en-kjv/books/${bookCode}/chapters/${chapter}.json`;
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      // Deduplicate verses
      const uniqueVerses = new Map()
      data.data.forEach(verse => {
        const verseNum = parseInt(verse.verse)
        if (!uniqueVerses.has(verseNum)) {
          uniqueVerses.set(verseNum, verse)
        }
      })
      
      const deduplicatedVerses = Array.from(uniqueVerses.values()).sort((a, b) => parseInt(a.verse) - parseInt(b.verse))
      
      setBibleContent({
        book: book.name,
        chapter: chapter,
        verses: deduplicatedVerses
      })
    } catch (err) {
      setError(err.message)
      console.error('Error fetching Bible content:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle book selection
  const handleBookSelect = (book) => {
    setSelectedBook(book)
    setSelectedChapter(1)
    setShowBookSelector(false)
    fetchChapterContent(book, 1)
  }

  // Handle chapter selection
  const handleChapterSelect = (chapter) => {
    setSelectedChapter(chapter)
    setShowChapterSelector(false)
    if (selectedBook) {
      fetchChapterContent(selectedBook, chapter)
    }
  }

  // Navigation functions
  const goToPreviousChapter = () => {
    if (selectedBook && selectedChapter > 1) {
      const newChapter = selectedChapter - 1
      setSelectedChapter(newChapter)
      fetchChapterContent(selectedBook, newChapter)
    }
  }

  const goToNextChapter = () => {
    if (selectedBook && selectedChapter < selectedBook.chapters) {
      const newChapter = selectedChapter + 1
      setSelectedChapter(newChapter)
      fetchChapterContent(selectedBook, newChapter)
    }
  }

  // Clean text function
  const cleanText = (text) => {
    return text
      .replace(/\d+\.\d+\s+[^:]+:/g, '')
      .replace(/\d+\.\d+\s+[^:]+/g, '')
      .replace(/\bHeb\.\s+[^.]*\.?/g, '')
      .replace(/\bor,\s+[^.]*\.?/g, '')
      .replace(/¶\s*/g, '')
      .replace(/\bseeding\s+seed\b/g, '')
      .replace(/\bgreen…:\s+Heb\.\s+[^.]*\.?/g, '')
      .replace(/\bstill…:\s+Heb\.\s+[^.]*\.?/g, '')
      .replace(/\banointest:\s+Heb\.\s+[^.]*\.?/g, '')
      .replace(/\bfor ever:\s+Heb\.\s+[^.]*\.?/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }


  // Initialize with Genesis
  useEffect(() => {
    if (!selectedBook) {
      const genesis = bibleBooks.find(book => book.name === 'Genesis')
      if (genesis) {
        setSelectedBook(genesis)
        fetchChapterContent(genesis, 1)
      } else {
        console.error('Genesis book not found in bibleBooks');
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Clean Mobile-Optimized Header */}
      <div className="sticky top-0 z-40 border-b bg-white border-gray-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Clean Book/Chapter Selector */}
            <div className="flex items-center space-x-2 sm:space-x-4 relative">
              <div className="relative">
                <button
                  onClick={() => setShowBookSelector(!showBookSelector)}
                  className="group relative px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-sm sm:text-lg">📖</span>
                    <span className="text-xs sm:text-sm">{selectedBook ? selectedBook.name : 'Select Book'}</span>
                    <span className="text-xs">▼</span>
                  </div>
                </button>

                {/* Compact Book Selector Dropdown */}
                {showBookSelector && (
                  <div className="absolute top-full left-0 z-50 mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 w-80 max-h-80 overflow-y-auto">
                    <div className="p-3">
                      {/* Old Testament */}
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                          Old Testament
                        </h4>
                        <div className="grid grid-cols-3 gap-1">
                          {bibleBooks.filter(book => book.testament === 'Old').map((book) => (
                            <button
                              key={book.name}
                              onClick={() => handleBookSelect(book)}
                              className="p-2 text-center rounded-lg transition-all duration-200 bg-gray-50 hover:bg-blue-100 border border-gray-100 hover:border-blue-200 hover:shadow-sm"
                            >
                              <div className="font-medium text-gray-700 text-xs">
                                {book.name.length > 8 ? book.name.substring(0, 8) + '...' : book.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {book.chapters} ch
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* New Testament */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                          New Testament
                        </h4>
                        <div className="grid grid-cols-3 gap-1">
                          {bibleBooks.filter(book => book.testament === 'New').map((book) => (
              <button
                              key={book.name}
                              onClick={() => handleBookSelect(book)}
                              className="p-2 text-center rounded-lg transition-all duration-200 bg-gray-50 hover:bg-green-100 border border-gray-100 hover:border-green-200 hover:shadow-sm"
                            >
                              <div className="font-medium text-gray-700 text-xs">
                                {book.name.length > 8 ? book.name.substring(0, 8) + '...' : book.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {book.chapters} ch
                              </div>
              </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setShowChapterSelector(!showChapterSelector)}
                  className="group relative px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-sm sm:text-lg">📄</span>
                    <span className="text-xs sm:text-sm">Chapter {selectedChapter}</span>
                    <span className="text-xs">▼</span>
                  </div>
                </button>

                {/* Compact Chapter Selector Dropdown */}
                {showChapterSelector && selectedBook && (
                  <div className="absolute top-full left-0 z-50 mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 w-64 max-h-64 overflow-y-auto">
                    <div className="p-3">
                      <h4 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                        {selectedBook.name} Chapters
                      </h4>
                      <div className="grid grid-cols-5 gap-1">
                        {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => (
              <button
                            key={chapter}
                            onClick={() => handleChapterSelect(chapter)}
                            className={`p-2 text-center rounded-lg font-medium transition-all duration-200 ${
                              chapter === selectedChapter
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-gray-50 hover:bg-blue-100 border border-gray-100 hover:border-blue-200 hover:shadow-sm text-gray-700'
                            }`}
                          >
                            <div className="text-xs">
                              {chapter}
                            </div>
              </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Clean Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Font Size Controls */}
              <div className="flex items-center space-x-1 sm:space-x-2 bg-white rounded-lg p-1 sm:p-2 border border-gray-300 shadow-sm">
                <button
                  onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                  className="p-1 sm:p-2 rounded-md transition-all duration-300 hover:bg-gray-100 text-gray-600 text-xs sm:text-sm"
                >
                  A-
                </button>
                <span className="text-xs sm:text-sm font-medium px-1 sm:px-2">{fontSize}px</span>
                <button
                  onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                  className="p-1 sm:p-2 rounded-md transition-all duration-300 hover:bg-gray-100 text-gray-600 text-xs sm:text-sm"
                >
                  A+
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Clean Chapter Navigation */}
      <div className="border-b bg-white border-gray-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousChapter}
              disabled={!selectedBook || selectedChapter <= 1}
              className="px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-sm sm:text-lg">←</span>
                <span className="text-xs sm:text-sm">Previous</span>
              </div>
            </button>
            
            <div className="text-center">
              <h2 className="text-base sm:text-lg font-bold text-gray-800">
              {selectedBook ? `${selectedBook.name} ${selectedChapter}` : 'Select a book'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Holy Bible - KJV Translation</p>
            </div>
            
            <button
              onClick={goToNextChapter}
              disabled={!selectedBook || selectedChapter >= selectedBook.chapters}
              className="px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm">Next</span>
                <span className="text-sm sm:text-lg">→</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Clean Bible Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {loading && (
          <div className="text-center py-8 sm:py-16">
            <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Loading Chapter</h3>
            <p className="text-sm sm:text-base text-gray-500">Fetching God's Word...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8 sm:py-16">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-8 max-w-md mx-auto">
              <div className="text-red-600 text-2xl sm:text-4xl mb-4">⚠️</div>
              <h3 className="text-red-600 text-base sm:text-lg font-semibold mb-2">Error Loading Chapter</h3>
            <p className="text-red-500 text-sm sm:text-base">{error}</p>
            </div>
          </div>
        )}

        {bibleContent && !loading && !error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8">
            <div 
              className="leading-relaxed font-serif text-gray-800"
              style={{ fontSize: `${fontSize}px` }}
            >
              {bibleContent.verses.map((verse, index) => (
                <div key={index} className="mb-3 sm:mb-4">
                  <p className="leading-relaxed text-gray-800">
                      <sup className="text-purple-600 font-semibold mr-1">{verse.verse}</sup>
                    <span>{cleanText(verse.text)}</span>
                  </p>
                      </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clean Bottom Navigation */}
      <div className="sticky bottom-0 border-t bg-white border-gray-200">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousChapter}
              disabled={!selectedBook || selectedChapter <= 1}
              className="px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm hover:shadow-md text-xs sm:text-sm"
            >
              ← Previous Chapter
            </button>
            
            <button
              onClick={goToNextChapter}
              disabled={!selectedBook || selectedChapter >= selectedBook.chapters}
              className="px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm hover:shadow-md text-xs sm:text-sm"
            >
              Next Chapter →
            </button>
          </div>
        </div>
      </div>


    </div>
  )
}

export default ESVBibleReader
