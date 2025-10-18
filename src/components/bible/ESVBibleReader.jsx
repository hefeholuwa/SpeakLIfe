import React, { useState, useEffect } from 'react'
import { bibleBooks } from '../../data/bibleBooks'

const ESVBibleReader = ({ onBookmark, onHighlight, bookmarks = [], highlights = [] }) => {
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(1)
  const [bibleContent, setBibleContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isNightMode, setIsNightMode] = useState(false)
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
      const response = await fetch(`https://raw.githubusercontent.com/wldeh/bible-api/main/bibles/en-kjv/books/${bookCode}/chapters/${chapter}.json`)
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

  // Handle bookmarking a verse
  const handleBookmark = async (verse) => {
    if (!onBookmark) return;
    
    const verseData = {
      book: selectedBook?.name || selectedBook,
      chapter: selectedChapter,
      verse: verse.verse,
      text: cleanText(verse.text)
    };
    
    try {
      await onBookmark(verseData);
      // Show success feedback
      const button = document.querySelector(`[title*="bookmark"]`);
      if (button) {
        button.style.transform = 'scale(1.2)';
        setTimeout(() => {
          button.style.transform = 'scale(1)';
        }, 200);
      }
    } catch (error) {
      console.error('Error bookmarking verse:', error);
      alert('Failed to bookmark verse. Please try again.');
    }
  };

  // Handle highlighting a verse
  const handleHighlight = async (verse) => {
    if (!onHighlight) return;
    
    const verseData = {
      book: selectedBook?.name || selectedBook,
      chapter: selectedChapter,
      verse: verse.verse,
      text: cleanText(verse.text)
    };
    
    try {
      // Show color picker for highlight
      const colors = ['yellow', 'blue', 'green', 'pink'];
      const selectedColor = prompt(
        'Choose highlight color:\n1. Yellow\n2. Blue\n3. Green\n4. Pink\n\nEnter number (1-4):',
        '1'
      );
      
      if (selectedColor && ['1', '2', '3', '4'].includes(selectedColor)) {
        const color = colors[parseInt(selectedColor) - 1];
        await onHighlight(verseData, color);
        
        // Show success feedback
        const button = document.querySelector(`[title="Highlight verse"]`);
        if (button) {
          button.style.transform = 'scale(1.2)';
          setTimeout(() => {
            button.style.transform = 'scale(1)';
          }, 200);
        }
      }
    } catch (error) {
      console.error('Error highlighting verse:', error);
      alert('Failed to highlight verse. Please try again.');
    }
  };

  // Initialize with Genesis
  useEffect(() => {
    if (!selectedBook) {
      const genesis = bibleBooks.find(book => book.name === 'Genesis')
      if (genesis) {
        setSelectedBook(genesis)
        fetchChapterContent(genesis, 1)
      }
    }
  }, [])

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isNightMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    } ${isFullScreen ? 'fixed inset-0 z-50' : ''}`}>
      
      {/* Header */}
      <div className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        isNightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Book/Chapter Selector */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowBookSelector(true)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  isNightMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedBook ? selectedBook.name : 'Select Book'}
              </button>
              
              <button
                onClick={() => setShowChapterSelector(true)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  isNightMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Chapter {selectedChapter}
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              {/* Font Size */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                  className={`p-2 rounded-lg transition-colors ${
                    isNightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  A-
                </button>
                <span className="text-sm font-medium">{fontSize}px</span>
                <button
                  onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                  className={`p-2 rounded-lg transition-colors ${
                    isNightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  A+
                </button>
              </div>

              {/* Night Mode */}
              <button
                onClick={() => setIsNightMode(!isNightMode)}
                className={`p-2 rounded-lg transition-colors ${
                  isNightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                {isNightMode ? '☀️' : '🌙'}
              </button>

              {/* Full Screen */}
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className={`p-2 rounded-lg transition-colors ${
                  isNightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                {isFullScreen ? '⤓' : '⤢'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Navigation */}
      <div className={`border-b transition-all duration-300 ${
        isNightMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousChapter}
              disabled={!selectedBook || selectedChapter <= 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isNightMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              ← Previous
            </button>
            
            <span className="text-sm font-medium">
              {selectedBook ? `${selectedBook.name} ${selectedChapter}` : 'Select a book'}
            </span>
            
            <button
              onClick={goToNextChapter}
              disabled={!selectedBook || selectedChapter >= selectedBook.chapters}
              className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isNightMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Bible Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading chapter...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 text-lg font-medium mb-2">⚠️ Error Loading Chapter</div>
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {bibleContent && !loading && !error && (
          <div className="prose prose-lg max-w-none">
            <div 
              className={`leading-relaxed ${
                isNightMode ? 'text-gray-100' : 'text-gray-800'
              }`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {bibleContent.verses.map((verse, index) => {
                const isBookmarked = bookmarks.some(b => 
                  b.book === selectedBook && 
                  b.chapter === selectedChapter && 
                  b.verse === verse.verse
                );
                const isHighlighted = highlights.find(h => 
                  h.book === selectedBook && 
                  h.chapter === selectedChapter && 
                  h.verse === verse.verse
                );
                
                return (
                  <div key={index} className="mb-4 group relative">
                    <p className={`leading-relaxed ${
                      isNightMode ? 'text-gray-100' : 'text-gray-800'
                    }`}>
                      <sup className="text-purple-600 font-semibold mr-1">{verse.verse}</sup>
                      <span 
                        className={`${
                          isHighlighted 
                            ? `bg-${isHighlighted.color}-200 px-1 rounded` 
                            : ''
                        }`}
                      >
                        {cleanText(verse.text)}
                      </span>
                    </p>
                    
                    {/* Verse Actions */}
                    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleBookmark(verse)}
                          className={`p-1 rounded-full transition-colors ${
                            isBookmarked 
                              ? 'bg-yellow-100 text-yellow-600' 
                              : 'bg-gray-100 text-gray-500 hover:bg-yellow-100 hover:text-yellow-600'
                          }`}
                          title={isBookmarked ? 'Remove bookmark' : 'Bookmark verse'}
                        >
                          {isBookmarked ? '🔖' : '📖'}
                        </button>
                        
                        <button
                          onClick={() => handleHighlight(verse)}
                          className="p-1 rounded-full bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                          title="Highlight verse"
                        >
                          ✨
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className={`sticky bottom-0 border-t transition-all duration-300 ${
        isNightMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousChapter}
              disabled={!selectedBook || selectedChapter <= 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isNightMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              ← Previous Chapter
            </button>
            
            <button
              onClick={goToNextChapter}
              disabled={!selectedBook || selectedChapter >= selectedBook.chapters}
              className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isNightMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Next Chapter →
            </button>
          </div>
        </div>
      </div>

      {/* Book Selector Modal */}
      {showBookSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl max-h-[80vh] rounded-lg overflow-hidden ${
            isNightMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-4 border-b ${
              isNightMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Select Book</h3>
                <button
                  onClick={() => setShowBookSelector(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {bibleBooks.map((book) => (
                  <button
                    key={book.name}
                    onClick={() => handleBookSelect(book)}
                    className={`p-3 text-left rounded-lg transition-colors ${
                      isNightMode 
                        ? 'hover:bg-gray-700' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{book.name}</div>
                    <div className="text-sm text-gray-500">{book.testament} Testament</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Selector Modal */}
      {showChapterSelector && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-lg overflow-hidden ${
            isNightMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-4 border-b ${
              isNightMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedBook.name} Chapters</h3>
                <button
                  onClick={() => setShowChapterSelector(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => (
                  <button
                    key={chapter}
                    onClick={() => handleChapterSelect(chapter)}
                    className={`p-3 text-center rounded-lg font-medium transition-colors ${
                      chapter === selectedChapter
                        ? 'bg-purple-600 text-white'
                        : isNightMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {chapter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ESVBibleReader
