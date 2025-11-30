import React, { useState, useEffect, useRef } from 'react'
import { Search, ChevronLeft, ChevronRight, Book, ArrowLeft, X, Bookmark, Share2, Highlighter, CheckCircle, Sparkles, ArrowRight } from 'lucide-react'
import { supabase } from '../supabaseClient.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

const BibleReader = ({ searchQuery = '', hideContent = false, externalConfig = null, onExternalComplete = null, onBack = null }) => {
  const { user } = useAuth()
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [bibleContent, setBibleContent] = useState(null)
  const [bibleLoading, setBibleLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchProgress, setSearchProgress] = useState('')
  const [highlightedVerse, setHighlightedVerse] = useState(null)
  const [viewMode, setViewMode] = useState('books') // 'books', 'chapters', 'reader', 'devotional'
  const [bookmarks, setBookmarks] = useState([])
  const [highlights, setHighlights] = useState([])
  const [devotionalContent, setDevotionalContent] = useState(null)
  const [currentDayNumber, setCurrentDayNumber] = useState(null)
  const [targetEndChapter, setTargetEndChapter] = useState(null)

  const readerRef = useRef(null)

  // Handle external configuration (e.g. from Reading Plans)
  useEffect(() => {
    if (externalConfig && externalConfig.book && externalConfig.chapter) {
      // Normalize input book name: lowercase, remove spaces, remove dots
      const inputName = externalConfig.book.toLowerCase().replace(/[^a-z0-9]/g, '')

      // Try to find canonical name from map
      let canonicalName = null

      // Check if input matches a key in bookNameMap directly
      if (bookNameMap[inputName]) {
        canonicalName = bookNameMap[inputName]
      } else {
        // Try to find a key that contains the input or vice versa
        const mapKey = Object.keys(bookNameMap).find(k => k === inputName || k.includes(inputName) || inputName.includes(k))
        if (mapKey) canonicalName = bookNameMap[mapKey]
      }

      // Find the book object using canonical name or fallback to direct comparison
      const bookObj = [...oldTestamentBooks, ...newTestamentBooks].find(
        b => (canonicalName && b.name === canonicalName) ||
          b.name.toLowerCase().replace(/[^a-z0-9]/g, '') === inputName
      )

      if (bookObj) {
        setSelectedBook(bookObj)
        setSelectedChapter(externalConfig.chapter)
        setTargetEndChapter(externalConfig.endChapter || externalConfig.chapter)
        setDevotionalContent(externalConfig.devotionalContent || null)
        setCurrentDayNumber(externalConfig.dayNumber || null)

        // If it's part of a reading plan (has dayNumber), start in 'devotional' mode (intro screen)
        // Otherwise start in 'reader' mode
        if (externalConfig.dayNumber) {
          setViewMode('devotional')
        } else {
          setViewMode('reader')
        }

        fetchChapterContent(bookObj.name, externalConfig.chapter, !!externalConfig.devotionalContent)
      } else {
        console.warn('Could not find book:', externalConfig.book)
      }
    } else if (externalConfig === null) {
      // Reset to default state if config is cleared
      setDevotionalContent(null)
      setCurrentDayNumber(null)
      setTargetEndChapter(null)
      // Optional: Reset to books view if we want a fresh start, 
      // or keep current state if we want to preserve last "free reading" position.
      // Given the user's request "clone the way youbible works", 
      // usually clicking "Bible" goes to the book selector or last read.
      // Let's go to books view to be safe and clear "Plan Mode".
      setViewMode('books')
    }
  }, [externalConfig])

  // Complete Bible books from Genesis to Revelation
  const allBibleBooks = [
    // Old Testament (39 books)
    'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy',
    'joshua', 'judges', 'ruth', '1samuel', '2samuel',
    '1kings', '2kings', '1chronicles', '2chronicles', 'ezra',
    'nehemiah', 'esther', 'job', 'psalms', 'proverbs',
    'ecclesiastes', 'songofsolomon', 'isaiah', 'jeremiah', 'lamentations',
    'ezekiel', 'daniel', 'hosea', 'joel', 'amos',
    'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk',
    'zephaniah', 'haggai', 'zechariah', 'malachi',
    // New Testament (27 books)
    'matthew', 'mark', 'luke', 'john', 'acts',
    'romans', '1corinthians', '2corinthians', 'galatians', 'ephesians',
    'philippians', 'colossians', '1thessalonians', '2thessalonians',
    '1timothy', '2timothy', 'titus', 'philemon', 'hebrews',
    'james', '1peter', '2peter', '1john', '2john',
    '3john', 'jude', 'revelation'
  ]

  // Book chapter counts for optimized searching
  const bookChapterCounts = {
    'genesis': 50, 'exodus': 40, 'leviticus': 27, 'numbers': 36, 'deuteronomy': 34,
    'joshua': 24, 'judges': 21, 'ruth': 4, '1samuel': 31, '2samuel': 24,
    '1kings': 22, '2kings': 25, '1chronicles': 29, '2chronicles': 36, 'ezra': 10,
    'nehemiah': 13, 'esther': 10, 'job': 42, 'psalms': 150, 'proverbs': 31,
    'ecclesiastes': 12, 'songofsolomon': 8, 'isaiah': 66, 'jeremiah': 52, 'lamentations': 5,
    'ezekiel': 48, 'daniel': 12, 'hosea': 14, 'joel': 3, 'amos': 9,
    'obadiah': 1, 'jonah': 4, 'micah': 7, 'nahum': 3, 'habakkuk': 3,
    'zephaniah': 3, 'haggai': 2, 'zechariah': 14, 'malachi': 4,
    'matthew': 28, 'mark': 16, 'luke': 24, 'john': 21, 'acts': 28,
    'romans': 16, '1corinthians': 16, '2corinthians': 13, 'galatians': 6, 'ephesians': 6,
    'philippians': 4, 'colossians': 4, '1thessalonians': 5, '2thessalonians': 3,
    '1timothy': 6, '2timothy': 4, 'titus': 3, 'philemon': 1, 'hebrews': 13,
    'james': 5, '1peter': 5, '2peter': 3, '1john': 5, '2john': 1,
    '3john': 1, 'jude': 1, 'revelation': 22
  }

  const bookNameMap = {
    'genesis': 'Genesis', 'exodus': 'Exodus', 'leviticus': 'Leviticus', 'numbers': 'Numbers', 'deuteronomy': 'Deuteronomy',
    'joshua': 'Joshua', 'judges': 'Judges', 'ruth': 'Ruth', '1samuel': '1 Samuel', '2samuel': '2 Samuel',
    '1kings': '1 Kings', '2kings': '2 Kings', '1chronicles': '1 Chronicles', '2chronicles': '2 Chronicles', 'ezra': 'Ezra',
    'nehemiah': 'Nehemiah', 'esther': 'Esther', 'job': 'Job', 'psalms': 'Psalms', 'proverbs': 'Proverbs',
    'ecclesiastes': 'Ecclesiastes', 'songofsolomon': 'Song of Songs', 'isaiah': 'Isaiah', 'jeremiah': 'Jeremiah', 'lamentations': 'Lamentations',
    'ezekiel': 'Ezekiel', 'daniel': 'Daniel', 'hosea': 'Hosea', 'joel': 'Joel', 'amos': 'Amos',
    'obadiah': 'Obadiah', 'jonah': 'Jonah', 'micah': 'Micah', 'nahum': 'Nahum', 'habakkuk': 'Habakkuk',
    'zephaniah': 'Zephaniah', 'haggai': 'Haggai', 'zechariah': 'Zechariah', 'malachi': 'Malachi',
    'matthew': 'Matthew', 'mark': 'Mark', 'luke': 'Luke', 'john': 'John', 'acts': 'Acts',
    'romans': 'Romans', '1corinthians': '1 Corinthians', '2corinthians': '2 Corinthians', 'galatians': 'Galatians', 'ephesians': 'Ephesians',
    'philippians': 'Philippians', 'colossians': 'Colossians', '1thessalonians': '1 Thessalonians', '2thessalonians': '2 Thessalonians',
    '1timothy': '1 Timothy', '2timothy': '2 Timothy', 'titus': 'Titus', 'philemon': 'Philemon', 'hebrews': 'Hebrews',
    'james': 'James', '1peter': '1 Peter', '2peter': '2 Peter', '1john': '1 John', '2john': '2 John',
    '3john': '3 John', 'jude': 'Jude', 'revelation': 'Revelation'
  }

  // Bible books data organized by testament
  const oldTestamentBooks = [
    { name: 'Genesis', chapters: 50, category: 'Pentateuch' },
    { name: 'Exodus', chapters: 40, category: 'Pentateuch' },
    { name: 'Leviticus', chapters: 27, category: 'Pentateuch' },
    { name: 'Numbers', chapters: 36, category: 'Pentateuch' },
    { name: 'Deuteronomy', chapters: 34, category: 'Pentateuch' },
    { name: 'Joshua', chapters: 24, category: 'History' },
    { name: 'Judges', chapters: 21, category: 'History' },
    { name: 'Ruth', chapters: 4, category: 'History' },
    { name: '1 Samuel', chapters: 31, category: 'History' },
    { name: '2 Samuel', chapters: 24, category: 'History' },
    { name: '1 Kings', chapters: 22, category: 'History' },
    { name: '2 Kings', chapters: 25, category: 'History' },
    { name: '1 Chronicles', chapters: 29, category: 'History' },
    { name: '2 Chronicles', chapters: 36, category: 'History' },
    { name: 'Ezra', chapters: 10, category: 'History' },
    { name: 'Nehemiah', chapters: 13, category: 'History' },
    { name: 'Esther', chapters: 10, category: 'History' },
    { name: 'Job', chapters: 42, category: 'Poetry' },
    { name: 'Psalms', chapters: 150, category: 'Poetry' },
    { name: 'Proverbs', chapters: 31, category: 'Poetry' },
    { name: 'Ecclesiastes', chapters: 12, category: 'Poetry' },
    { name: 'Song of Songs', chapters: 8, category: 'Poetry' },
    { name: 'Isaiah', chapters: 66, category: 'Major Prophets' },
    { name: 'Jeremiah', chapters: 52, category: 'Major Prophets' },
    { name: 'Lamentations', chapters: 5, category: 'Major Prophets' },
    { name: 'Ezekiel', chapters: 48, category: 'Major Prophets' },
    { name: 'Daniel', chapters: 12, category: 'Major Prophets' },
    { name: 'Hosea', chapters: 14, category: 'Minor Prophets' },
    { name: 'Joel', chapters: 3, category: 'Minor Prophets' },
    { name: 'Amos', chapters: 9, category: 'Minor Prophets' },
    { name: 'Obadiah', chapters: 1, category: 'Minor Prophets' },
    { name: 'Jonah', chapters: 4, category: 'Minor Prophets' },
    { name: 'Micah', chapters: 7, category: 'Minor Prophets' },
    { name: 'Nahum', chapters: 3, category: 'Minor Prophets' },
    { name: 'Habakkuk', chapters: 3, category: 'Minor Prophets' },
    { name: 'Zephaniah', chapters: 3, category: 'Minor Prophets' },
    { name: 'Haggai', chapters: 2, category: 'Minor Prophets' },
    { name: 'Zechariah', chapters: 14, category: 'Minor Prophets' },
    { name: 'Malachi', chapters: 4, category: 'Minor Prophets' }
  ]

  const newTestamentBooks = [
    { name: 'Matthew', chapters: 28, category: 'Gospels' },
    { name: 'Mark', chapters: 16, category: 'Gospels' },
    { name: 'Luke', chapters: 24, category: 'Gospels' },
    { name: 'John', chapters: 21, category: 'Gospels' },
    { name: 'Acts', chapters: 28, category: 'History' },
    { name: 'Romans', chapters: 16, category: 'Epistles' },
    { name: '1 Corinthians', chapters: 16, category: 'Epistles' },
    { name: '2 Corinthians', chapters: 13, category: 'Epistles' },
    { name: 'Galatians', chapters: 6, category: 'Epistles' },
    { name: 'Ephesians', chapters: 6, category: 'Epistles' },
    { name: 'Philippians', chapters: 4, category: 'Epistles' },
    { name: 'Colossians', chapters: 4, category: 'Epistles' },
    { name: '1 Thessalonians', chapters: 5, category: 'Epistles' },
    { name: '2 Thessalonians', chapters: 3, category: 'Epistles' },
    { name: '1 Timothy', chapters: 6, category: 'Epistles' },
    { name: '2 Timothy', chapters: 4, category: 'Epistles' },
    { name: 'Titus', chapters: 3, category: 'Epistles' },
    { name: 'Philemon', chapters: 1, category: 'Epistles' },
    { name: 'Hebrews', chapters: 13, category: 'Epistles' },
    { name: 'James', chapters: 5, category: 'Epistles' },
    { name: '1 Peter', chapters: 5, category: 'Epistles' },
    { name: '2 Peter', chapters: 3, category: 'Epistles' },
    { name: '1 John', chapters: 5, category: 'Epistles' },
    { name: '2 John', chapters: 1, category: 'Epistles' },
    { name: '3 John', chapters: 1, category: 'Epistles' },
    { name: 'Jude', chapters: 1, category: 'Epistles' },
    { name: 'Revelation', chapters: 22, category: 'Prophecy' }
  ]

  // Comprehensive search algorithm
  const searchBible = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setIsSearching(true)
    setShowSearchResults(true)
    const results = []
    const searchTerm = query.toLowerCase()
    let booksSearched = 0

    try {
      const batchSize = 8
      const totalBatches = Math.ceil(allBibleBooks.length / batchSize)

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIndex = batchIndex * batchSize
        const endIndex = Math.min(startIndex + batchSize, allBibleBooks.length)
        const currentBatch = allBibleBooks.slice(startIndex, endIndex)

        setSearchProgress(`Searching books ${startIndex + 1}-${endIndex} of 66...`)

        const batchPromises = currentBatch.map(async (book) => {
          try {
            const maxChapters = bookChapterCounts[book] || 1
            const bookResults = []
            const chaptersToSearch = Math.min(maxChapters, 3) // Search first 3 chapters for demo speed

            for (let chapter = 1; chapter <= chaptersToSearch; chapter++) {
              try {
                const response = await fetch(`https://raw.githubusercontent.com/wldeh/bible-api/main/bibles/en-kjv/books/${book}/chapters/${chapter}.json`)
                if (!response.ok) continue

                const data = await response.json()
                if (data && data.data && Array.isArray(data.data)) {
                  data.data.forEach(verse => {
                    const verseText = verse.text.toLowerCase()
                    if (verseText.includes(searchTerm)) {
                      let cleanText = verse.text
                        .replace(/\d+\.\d+\s+[^:]+:/g, '')
                        .replace(/\d+\.\d+\s+[^:]+/g, '')
                        .replace(/\bHeb\.\s+[^.]*\.?/g, '')
                        .replace(/\bor,\s+[^.]*\.?/g, '')
                        .replace(/¶\s*/g, '')
                        .replace(/\s+/g, ' ')
                        .trim()

                      bookResults.push({
                        book: bookNameMap[book] || book,
                        chapter: chapter,
                        verse: parseInt(verse.verse),
                        text: cleanText,
                        reference: `${bookNameMap[book] || book} ${chapter}:${verse.verse}`,
                        relevance: verseText.split(searchTerm).length - 1
                      })
                    }
                  })
                }
              } catch (error) { }
            }
            return bookResults
          } catch (error) {
            return []
          }
        })

        const batchResults = await Promise.all(batchPromises)
        batchResults.forEach(bookResults => results.push(...bookResults))
        booksSearched += currentBatch.length
        setSearchProgress(`Found ${results.length} verses...`)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      results.sort((a, b) => b.relevance - a.relevance)
      setSearchResults(results.slice(0, 500))
      setSearchProgress(`Found ${results.length} verses`)

    } catch (error) {
      console.error('Error searching Bible:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const fetchChapterContent = async (bookName, chapterNumber, preserveViewMode = false) => {
    setBibleLoading(true)
    setBibleContent(null)
    if (!preserveViewMode) setViewMode('reader')

    try {
      const bookCode = bookNameMap[bookName.toLowerCase()] ? bookName.toLowerCase().replace(/\s+/g, '') : bookName.toLowerCase().replace(/\s+/g, '')
      const apiUrl = `https://raw.githubusercontent.com/wldeh/bible-api/main/bibles/en-kjv/books/${bookCode}/chapters/${chapterNumber}.json`

      const response = await fetch(apiUrl)
      if (!response.ok) throw new Error('Failed to fetch')

      const data = await response.json()

      if (data.data && Array.isArray(data.data)) {
        const uniqueVerses = new Map()
        data.data.forEach(verse => {
          const verseNum = parseInt(verse.verse)
          if (!uniqueVerses.has(verseNum)) {
            let cleanText = verse.text
              .replace(/\d+\.\d+\s+[^:]+:/g, '')
              .replace(/\d+\.\d+\s+[^:]+/g, '')
              .replace(/\bHeb\.\s+[^.]*\.?/g, '')
              .replace(/\bor,\s+[^.]*\.?/g, '')
              .replace(/¶\s*/g, '')
              .replace(/\s+/g, ' ')
              .trim()

            uniqueVerses.set(verseNum, { verse: verseNum, text: cleanText })
          }
        })

        setBibleContent({
          book: bookName,
          chapter: chapterNumber,
          verses: Array.from(uniqueVerses.values()).sort((a, b) => a.verse - b.verse)
        })
      }
    } catch (error) {
      console.error('Error:', error)
      // Fallback content
      setBibleContent({
        book: bookName,
        chapter: chapterNumber,
        verses: [
          { verse: 1, text: "Content unavailable offline. Please check your connection." }
        ]
      })
    } finally {
      setBibleLoading(false)
      if (readerRef.current) readerRef.current.scrollTop = 0
      fetchUserData(bookName, chapterNumber)
    }
  }

  // Fetch user bookmarks and highlights for the current chapter
  const fetchUserData = async (book, chapter) => {
    if (!user) return

    try {
      const [bookmarksData, highlightsData] = await Promise.all([
        supabase
          .from('bible_bookmarks')
          .select('verse')
          .eq('user_id', user.id)
          .eq('book', book)
          .eq('chapter', chapter),
        supabase
          .from('bible_highlights')
          .select('verse, color')
          .eq('user_id', user.id)
          .eq('book', book)
          .eq('chapter', chapter)
      ])

      if (bookmarksData.data) setBookmarks(bookmarksData.data.map(b => b.verse))
      if (highlightsData.data) setHighlights(highlightsData.data)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const toggleBookmark = async (verseNum, verseText) => {
    if (!user) return

    try {
      if (bookmarks.includes(verseNum)) {
        // Remove bookmark
        const { error } = await supabase
          .from('bible_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('book', bibleContent.book)
          .eq('chapter', bibleContent.chapter)
          .eq('verse', verseNum)

        if (error) throw error
        setBookmarks(prev => prev.filter(v => v !== verseNum))
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bible_bookmarks')
          .insert({
            user_id: user.id,
            book: bibleContent.book,
            chapter: bibleContent.chapter,
            verse: verseNum,
            text: verseText
          })

        if (error) throw error
        setBookmarks(prev => [...prev, verseNum])
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      alert('Failed to save bookmark. Please try again.')
    }
  }

  const toggleHighlight = async (verseNum, verseText, color = 'yellow') => {
    if (!user) return

    try {
      const existingHighlight = highlights.find(h => h.verse === verseNum)

      if (existingHighlight) {
        // Remove highlight
        const { error } = await supabase
          .from('bible_highlights')
          .delete()
          .eq('user_id', user.id)
          .eq('book', bibleContent.book)
          .eq('chapter', bibleContent.chapter)
          .eq('verse', verseNum)

        if (error) throw error
        setHighlights(prev => prev.filter(h => h.verse !== verseNum))
      } else {
        // Add highlight
        const { error } = await supabase
          .from('bible_highlights')
          .insert({
            user_id: user.id,
            book: bibleContent.book,
            chapter: bibleContent.chapter,
            verse: verseNum,
            text: verseText,
            color
          })

        if (error) throw error
        setHighlights(prev => [...prev, { verse: verseNum, color }])
      }
    } catch (error) {
      console.error('Error toggling highlight:', error)
      alert('Failed to save highlight. Please try again.')
    }
  }

  // Handle book selection
  const handleBookSelect = (book) => {
    setSelectedBook(book)
    setViewMode('chapters')
  }

  // Handle search result click
  const handleResultClick = (result) => {
    const bookKey = Object.keys(bookNameMap).find(key => bookNameMap[key] === result.book)
    if (bookKey) {
      const bookData = {
        name: result.book,
        chapters: bookChapterCounts[bookKey] || 1,
        category: allBibleBooks.indexOf(bookKey) < 39 ? 'Old Testament' : 'New Testament'
      }
      setSelectedBook(bookData)
      setSelectedChapter(result.chapter)
      setShowSearchResults(false)
      fetchChapterContent(result.book, result.chapter)
      setHighlightedVerse(result.verse)
      setTimeout(() => setHighlightedVerse(null), 5000)
    }
  }

  const [allHighlights, setAllHighlights] = useState([])

  // Fetch all user highlights
  const fetchAllHighlights = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('bible_highlights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAllHighlights(data || [])
    } catch (error) {
      console.error('Error fetching highlights:', error)
    }
  }

  // Handle opening highlights view
  const openHighlights = () => {
    fetchAllHighlights()
    setViewMode('highlights')
  }

  // Handle clicking a highlight from the list
  const handleHighlightClick = (highlight) => {
    const bookKey = Object.keys(bookNameMap).find(key => bookNameMap[key] === highlight.book)
    if (bookKey) {
      const bookData = {
        name: highlight.book,
        chapters: bookChapterCounts[bookKey] || 1,
        category: allBibleBooks.indexOf(bookKey) < 39 ? 'Old Testament' : 'New Testament'
      }
      setSelectedBook(bookData)
      setSelectedChapter(highlight.chapter)
      fetchChapterContent(highlight.book, highlight.chapter)
      setHighlightedVerse(highlight.verse)
      setTimeout(() => setHighlightedVerse(null), 5000)
    }
  }

  useEffect(() => {
    if (searchQuery) searchBible(searchQuery)
  }, [searchQuery])

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] flex flex-col bg-[#FDFCF8] overflow-hidden rounded-3xl border border-gray-100 shadow-xl">

      {/* Search Overlay */}
      {showSearchResults && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col animate-fade-in">
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <button onClick={() => setShowSearchResults(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h3 className="font-semibold text-gray-900">Search Results</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mb-4" />
                <p>{searchProgress}</p>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((result, i) => (
                <div key={i} onClick={() => handleResultClick(result)} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm active:scale-[0.99] transition-transform cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-purple-600 text-sm">{result.reference}</span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">{result.text}</p>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 mt-20">No results found</div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">

        {/* View Mode: Books List */}
        <div className={`absolute inset-0 overflow-y-auto transition-transform duration-300 ${viewMode === 'books' ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 pb-24">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#FDFCF8]/95 backdrop-blur-sm py-2 z-20">
              <h2 className="text-2xl font-black text-gray-900">Bible</h2>
              <button
                onClick={openHighlights}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-full text-sm font-bold hover:bg-yellow-100 transition-colors"
              >
                <Highlighter size={16} /> My Highlights
              </button>
            </div>

            <h3 className="text-lg font-bold text-gray-500 mb-4 uppercase tracking-wider">Old Testament</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
              {oldTestamentBooks.map((book, i) => (
                <button key={i} onClick={() => handleBookSelect(book)} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all text-left group">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{book.category}</div>
                  <div className="font-bold text-gray-900 group-hover:text-purple-600">{book.name}</div>
                  <div className="text-xs text-gray-400 mt-2">{book.chapters} Chapters</div>
                </button>
              ))}
            </div>

            <h3 className="text-lg font-bold text-gray-500 mb-4 uppercase tracking-wider">New Testament</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {newTestamentBooks.map((book, i) => (
                <button key={i} onClick={() => handleBookSelect(book)} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all text-left group">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{book.category}</div>
                  <div className="font-bold text-gray-900 group-hover:text-purple-600">{book.name}</div>
                  <div className="text-xs text-gray-400 mt-2">{book.chapters} Chapters</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View Mode: Highlights */}
        <div className={`absolute inset-0 bg-[#FDFCF8] overflow-y-auto transition-transform duration-300 ${viewMode === 'highlights' ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8 sticky top-0 bg-[#FDFCF8]/95 backdrop-blur-sm py-4 z-10 border-b border-gray-100">
              <button onClick={() => setViewMode('books')} className="p-2 hover:bg-gray-100 rounded-full -ml-2">
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <h2 className="text-2xl font-black text-gray-900">My Highlights</h2>
            </div>

            {allHighlights.length > 0 ? (
              <div className="space-y-4">
                {allHighlights.map((highlight) => (
                  <div
                    key={highlight.id}
                    onClick={() => handleHighlightClick(highlight)}
                    className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-yellow-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full bg-${highlight.color || 'yellow'}-400`} />
                        <span className="font-bold text-gray-900">{highlight.book} {highlight.chapter}:{highlight.verse}</span>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(highlight.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 font-serif leading-relaxed group-hover:text-gray-900 transition-colors">
                      "{highlight.text}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-center">
                <div className="p-4 bg-gray-50 rounded-full mb-4">
                  <Highlighter size={32} className="text-gray-300" />
                </div>
                <p className="font-medium">No highlights yet</p>
                <p className="text-sm mt-1">Select any verse while reading to highlight it.</p>
              </div>
            )}
          </div>
        </div>

        {/* View Mode: Chapters */}
        <div className={`absolute inset-0 bg-[#FDFCF8] overflow-y-auto transition-transform duration-300 ${viewMode === 'chapters' ? 'translate-x-0' : viewMode === 'books' || viewMode === 'highlights' ? 'translate-x-full' : '-translate-x-full'}`}>
          <div className="p-6">
            <button onClick={() => setViewMode('books')} className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
              <ChevronLeft size={20} />
              <span className="font-medium">Back to Books</span>
            </button>

            <h2 className="text-3xl font-black text-gray-900 mb-2">{selectedBook?.name}</h2>
            <p className="text-gray-500 mb-8">{selectedBook?.chapters} Chapters</p>

            <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {selectedBook && Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(chapter => (
                <button
                  key={chapter}
                  onClick={() => fetchChapterContent(selectedBook.name, chapter)}
                  className="aspect-square rounded-xl bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-700 hover:bg-purple-600 hover:text-white hover:border-transparent transition-all shadow-sm"
                >
                  {chapter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View Mode: Devotional */}
        <div className={`absolute inset-0 bg-white flex flex-col transition-transform duration-300 ${viewMode === 'devotional' ? 'translate-x-0' : '-translate-x-full'} z-30`}>
          <div className="flex-1 overflow-y-auto relative">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 opacity-50 pointer-events-none" />

            <div className="relative p-8 md:p-12 flex flex-col items-center justify-center text-center max-w-2xl mx-auto min-h-full animate-fade-in">
              {/* Close Button */}
              <button
                onClick={() => {
                  if (onBack) onBack();
                  else setViewMode('books');
                }}
                className="absolute top-6 right-6 p-2 bg-white/50 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-gray-900"
              >
                <X size={24} />
              </button>

              <div className="w-20 h-20 bg-white rounded-2xl rotate-3 flex items-center justify-center text-purple-600 mb-8 shadow-xl shadow-purple-100 ring-1 ring-purple-50">
                <Sparkles size={40} />
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 font-bold text-xs uppercase tracking-widest mb-6">
                Day {currentDayNumber} Devotional
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-tight tracking-tight">
                {bibleContent?.book} {bibleContent?.chapter}
              </h1>

              <div className="relative">
                {devotionalContent ? (
                  <>
                    <div className="absolute -left-4 -top-4 text-6xl text-purple-200 font-serif opacity-50">"</div>
                    <p className="text-xl md:text-2xl font-serif leading-relaxed text-gray-700 relative z-10">
                      {devotionalContent}
                    </p>
                    <div className="absolute -right-4 -bottom-4 text-6xl text-purple-200 font-serif opacity-50">"</div>
                  </>
                ) : (
                  <p className="text-xl md:text-2xl font-serif leading-relaxed text-gray-700 relative z-10 italic">
                    Take a moment to center yourself before reading today's scripture.
                  </p>
                )}
              </div>

              <div className="mt-12">
                <button
                  onClick={() => setViewMode('reader')}
                  className="group flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-gray-900/20"
                >
                  Start Reading
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode: Reader */}
        <div className={`absolute inset-0 bg-[#FDFCF8] flex flex-col transition-transform duration-300 ${viewMode === 'reader' ? 'translate-x-0' : viewMode === 'devotional' ? 'translate-x-full' : 'translate-x-full'}`}>
          {/* Reader Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-20 sticky top-0">
            <button
              onClick={() => {
                if (devotionalContent) {
                  setViewMode('devotional')
                } else if (externalConfig && onBack) {
                  onBack()
                } else {
                  setViewMode('chapters')
                }
              }}
              className="p-2 hover:bg-gray-100 rounded-full -ml-2 transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <div className="text-center">
              <h2 className="font-bold text-gray-900 text-lg">
                {currentDayNumber ? `Day ${currentDayNumber}: ` : ''}{bibleContent?.book} {bibleContent?.chapter}
              </h2>
              <span className="text-xs text-gray-500 font-medium tracking-wider">KING JAMES VERSION</span>
            </div>
            <div className="w-10 flex justify-end">
              {/* Optional: Add font size toggle or settings here later */}
            </div>
          </div>

          {/* Reader Content */}
          <div ref={readerRef} className="flex-1 overflow-y-auto p-6 md:p-10 pb-32 scroll-smooth">
            {bibleLoading ? (
              <div className="space-y-6 animate-pulse max-w-2xl mx-auto mt-8">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-16"></div>
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-6">
                {bibleContent?.verses.map((verse) => (
                  <div
                    key={verse.verse}
                    id={`verse-${verse.verse}`}
                    className={`relative pl-4 transition-all duration-500 rounded-xl p-3 group hover:bg-gray-50 ${highlightedVerse === verse.verse ? 'bg-purple-50 ring-1 ring-purple-200' : ''
                      } ${highlights.find(h => h.verse === verse.verse) ? 'bg-yellow-50/50' : ''
                      }`}
                  >
                    <span className="absolute left-0 top-3.5 text-xs font-bold text-gray-300 select-none w-6 text-right pr-2 group-hover:text-purple-400 transition-colors">
                      {verse.verse}
                    </span>
                    <p className="text-xl leading-8 text-gray-800 font-serif">
                      {verse.text}
                    </p>

                    {/* Verse Actions */}
                    <div className="absolute right-2 -top-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 bg-white shadow-lg border border-gray-100 p-1 rounded-full scale-90 group-hover:scale-100">
                      <button
                        onClick={() => toggleBookmark(verse.verse, verse.text)}
                        className={`p-2 rounded-full transition-colors ${bookmarks.includes(verse.verse) ? 'text-purple-600 bg-purple-50' : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                          }`}
                        title="Bookmark"
                      >
                        <Bookmark size={14} fill={bookmarks.includes(verse.verse) ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => toggleHighlight(verse.verse, verse.text)}
                        className={`p-2 rounded-full transition-colors ${highlights.find(h => h.verse === verse.verse) ? 'text-yellow-600 bg-yellow-50' : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                          }`}
                        title="Highlight"
                      >
                        <Highlighter size={14} />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Share"
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Plan Completion Button */}
                {onExternalComplete && (
                  <div className="mt-16 mb-8 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-900/20 animate-fade-in">
                    {/* Background Effects */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none" />

                    <div className="relative z-10 p-8 md:p-12 flex flex-col items-center text-center">
                      {(!targetEndChapter || (bibleContent && bibleContent.chapter >= targetEndChapter)) ? (
                        <>
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-white/30 shadow-lg">
                            <CheckCircle size={32} className="text-white" />
                          </div>
                          <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">Reading Complete?</h3>
                          <p className="text-white/80 mb-8 max-w-sm mx-auto text-lg leading-relaxed font-medium">
                            Great job! You've finished today's reading. Mark it as complete to keep your streak alive!
                          </p>
                          <button
                            onClick={onExternalComplete}
                            className="group bg-white text-blue-600 px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                          >
                            Complete Day {currentDayNumber}
                            <CheckCircle size={20} className="group-hover:scale-110 transition-transform" />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-white/30 shadow-lg">
                            <ArrowRight size={32} className="text-white" />
                          </div>
                          <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">Continue Reading</h3>
                          <p className="text-white/80 mb-8 max-w-sm mx-auto text-lg leading-relaxed font-medium">
                            You have <span className="text-white font-bold">{targetEndChapter - bibleContent.chapter}</span> more chapter{targetEndChapter - bibleContent.chapter > 1 ? 's' : ''} to read for today.
                          </p>
                          <button
                            onClick={() => fetchChapterContent(bibleContent.book, bibleContent.chapter + 1)}
                            className="group bg-white text-indigo-600 px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                          >
                            Read Chapter {bibleContent.chapter + 1}
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation Footer */}
                <div className="flex justify-between pt-12 pb-8 border-t border-gray-100 mt-12">
                  <button
                    onClick={() => bibleContent.chapter > 1 && fetchChapterContent(bibleContent.book, bibleContent.chapter - 1)}
                    disabled={!bibleContent || bibleContent.chapter <= 1}
                    className="flex items-center gap-2 text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-400 font-bold transition-colors"
                  >
                    <ArrowLeft size={18} /> Previous Chapter
                  </button>
                  <button
                    onClick={() => fetchChapterContent(bibleContent.book, bibleContent.chapter + 1)}
                    className="flex items-center gap-2 text-gray-900 hover:text-purple-600 font-bold transition-colors"
                  >
                    Next Chapter <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default BibleReader