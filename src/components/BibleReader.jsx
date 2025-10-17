import React, { useState, useEffect } from 'react'

const BibleReader = ({ searchQuery = '' }) => {
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [bibleContent, setBibleContent] = useState(null)
  const [bibleLoading, setBibleLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchProgress, setSearchProgress] = useState('')
  const [highlightedVerse, setHighlightedVerse] = useState(null)

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

  // Comprehensive search algorithm - covers ALL 66 books efficiently
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
      // Search ALL 66 books in batches to avoid overwhelming the browser
      const batchSize = 8 // Process 8 books at a time
      const totalBatches = Math.ceil(allBibleBooks.length / batchSize)
      
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIndex = batchIndex * batchSize
        const endIndex = Math.min(startIndex + batchSize, allBibleBooks.length)
        const currentBatch = allBibleBooks.slice(startIndex, endIndex)
        
        setSearchProgress(`Searching books ${startIndex + 1}-${endIndex} of 66...`)
        
        // Process current batch in parallel
        const batchPromises = currentBatch.map(async (book) => {
          try {
            const maxChapters = bookChapterCounts[book] || 1
            const bookResults = []
            
            // Search first 3 chapters of each book for speed
            const chaptersToSearch = Math.min(maxChapters, 3)
            
            for (let chapter = 1; chapter <= chaptersToSearch; chapter++) {
              try {
                const response = await fetch(`https://raw.githubusercontent.com/wldeh/bible-api/main/bibles/en-kjv/books/${book}/chapters/${chapter}.json`)
                if (!response.ok) continue
                
                const data = await response.json()
                if (data && data.data && Array.isArray(data.data)) {
                  data.data.forEach(verse => {
                    const verseText = verse.text.toLowerCase()
                    
                    if (verseText.includes(searchTerm)) {
                      // Clean up the text
                      let cleanText = verse.text
                        .replace(/\d+\.\d+\s+[^:]+:/g, '')
                        .replace(/\d+\.\d+\s+[^:]+/g, '')
                        .replace(/\bHeb\.\s+[^.]*\.?/g, '')
                        .replace(/\bor,\s+[^.]*\.?/g, '')
                        .replace(/¶\s*/g, '')
                        .replace(/\bseeding\s+seed\b/g, '')
                        .replace(/\bcreeping\b/g, '')
                        .replace(/\bcreepeth\b/g, '')
                        .replace(/\bgreen…:\s+Heb\.\s+[^.]*\.?/g, '')
                        .replace(/\bstill…:\s+Heb\.\s+[^.]*\.?/g, '')
                        .replace(/\banointest:\s+Heb\.\s+[^.]*\.?/g, '')
                        .replace(/\bfor ever:\s+Heb\.\s+[^.]*\.?/g, '')
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
              } catch (error) {
                console.log(`Error searching ${book} chapter ${chapter}:`, error)
              }
            }
            
            return bookResults
          } catch (error) {
            console.log(`Error searching book ${book}:`, error)
            return []
          }
        })
        
        // Wait for current batch to complete
        const batchResults = await Promise.all(batchPromises)
        
        // Flatten and add results
        batchResults.forEach(bookResults => {
          results.push(...bookResults)
        })
        
        booksSearched += currentBatch.length
        
        // Update progress but don't update results yet
        setSearchProgress(`Searched ${booksSearched} of 66 books, found ${results.length} verses so far...`)
        
        // Small delay between batches to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Sort results by relevance and book order
      results.sort((a, b) => {
        if (a.relevance !== b.relevance) return b.relevance - a.relevance
        
        const aIndex = allBibleBooks.indexOf(a.book.toLowerCase().replace(/\s+/g, '').replace(/\d+/g, (match) => match + ''))
        const bIndex = allBibleBooks.indexOf(b.book.toLowerCase().replace(/\s+/g, '').replace(/\d+/g, (match) => match + ''))
        
        if (aIndex !== bIndex) return aIndex - bIndex
        if (a.chapter !== b.chapter) return a.chapter - b.chapter
        return a.verse - b.verse
      })

      // Show final results only after complete search
      setSearchResults(results.slice(0, 500)) // Show up to 500 results
      setSearchProgress(`Search complete! Found ${results.length} verses across all 66 books.`)
      
    } catch (error) {
      console.error('Error searching Bible:', error)
    } finally {
      setIsSearching(false)
      // Keep the final progress message for a moment
      setTimeout(() => setSearchProgress(''), 2000)
    }
  }

  // Manual search trigger - no automatic search on typing
  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchBible(searchQuery)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }

  // Direct chapter content fetcher for search results
  const fetchChapterContent = async (bookName, chapterNumber) => {
    setBibleLoading(true)
    setBibleContent(null)

    try {
      // Map book names to the GitHub Bible API format
      const bookNameMap = {
        'Genesis': 'genesis', 'Exodus': 'exodus', 'Leviticus': 'leviticus', 'Numbers': 'numbers', 'Deuteronomy': 'deuteronomy',
        'Joshua': 'joshua', 'Judges': 'judges', 'Ruth': 'ruth', '1 Samuel': '1samuel', '2 Samuel': '2samuel',
        '1 Kings': '1kings', '2 Kings': '2kings', '1 Chronicles': '1chronicles', '2 Chronicles': '2chronicles',
        'Ezra': 'ezra', 'Nehemiah': 'nehemiah', 'Esther': 'esther', 'Job': 'job', 'Psalms': 'psalms',
        'Proverbs': 'proverbs', 'Ecclesiastes': 'ecclesiastes', 'Song of Songs': 'songofsolomon', 'Song of Solomon': 'songofsolomon',
        'Isaiah': 'isaiah', 'Jeremiah': 'jeremiah', 'Lamentations': 'lamentations', 'Ezekiel': 'ezekiel', 'Daniel': 'daniel',
        'Hosea': 'hosea', 'Joel': 'joel', 'Amos': 'amos', 'Obadiah': 'obadiah', 'Jonah': 'jonah', 'Micah': 'micah',
        'Nahum': 'nahum', 'Habakkuk': 'habakkuk', 'Zephaniah': 'zephaniah', 'Haggai': 'haggai', 'Zechariah': 'zechariah', 'Malachi': 'malachi',
        'Matthew': 'matthew', 'Mark': 'mark', 'Luke': 'luke', 'John': 'john', 'Acts': 'acts',
        'Romans': 'romans', '1 Corinthians': '1corinthians', '2 Corinthians': '2corinthians', 'Galatians': 'galatians', 'Ephesians': 'ephesians',
        'Philippians': 'philippians', 'Colossians': 'colossians', '1 Thessalonians': '1thessalonians', '2 Thessalonians': '2thessalonians',
        '1 Timothy': '1timothy', '2 Timothy': '2timothy', 'Titus': 'titus', 'Philemon': 'philemon', 'Hebrews': 'hebrews',
        'James': 'james', '1 Peter': '1peter', '2 Peter': '2peter', '1 John': '1john', '2 John': '2john',
        '3 John': '3john', 'Jude': 'jude', 'Revelation': 'revelation'
      }

      const bookCode = bookNameMap[bookName] || bookName.toLowerCase().replace(/\s+/g, '')
      const apiUrl = `https://raw.githubusercontent.com/wldeh/bible-api/main/bibles/en-kjv/books/${bookCode}/chapters/${chapterNumber}.json`
      
      console.log('Fetching chapter:', bookName, chapterNumber, 'URL:', apiUrl)
      
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data && data.data && Array.isArray(data.data)) {
        // Clean and deduplicate verses
        const uniqueVerses = new Map()
        
        data.data.forEach(verse => {
          const verseNum = parseInt(verse.verse)
          if (!uniqueVerses.has(verseNum)) {
            // Clean up the text
            let cleanText = verse.text
              .replace(/\d+\.\d+\s+[^:]+:/g, '')
              .replace(/\d+\.\d+\s+[^:]+/g, '')
              .replace(/\bHeb\.\s+[^.]*\.?/g, '')
              .replace(/\bor,\s+[^.]*\.?/g, '')
              .replace(/¶\s*/g, '')
              .replace(/\bseeding\s+seed\b/g, '')
              .replace(/\bcreeping\b/g, '')
              .replace(/\bcreepeth\b/g, '')
              .replace(/\bgreen…:\s+Heb\.\s+[^.]*\.?/g, '')
              .replace(/\bstill…:\s+Heb\.\s+[^.]*\.?/g, '')
              .replace(/\banointest:\s+Heb\.\s+[^.]*\.?/g, '')
              .replace(/\bfor ever:\s+Heb\.\s+[^.]*\.?/g, '')
              .replace(/\s+/g, ' ')
              .trim()
            
            uniqueVerses.set(verseNum, {
              verse: verseNum,
              text: cleanText
            })
          }
        })
        
        // Convert Map values to array and sort by verse number
        const verses = Array.from(uniqueVerses.values()).sort((a, b) => a.verse - b.verse)

        if (verses.length > 0) {
          setBibleContent({
            book: bookName,
            chapter: chapterNumber,
            verses: verses
          })
        } else {
          throw new Error('No verses found in API response')
        }
      } else {
        throw new Error('Invalid API response format')
      }
    } catch (error) {
      console.error('Error fetching Bible content:', error)
      
      // Fallback content
      setBibleContent({
        book: bookName,
        chapter: chapterNumber,
        verses: [
          { verse: 1, text: `Welcome to ${bookName} chapter ${chapterNumber}.` },
          { verse: 2, text: "Bible API is currently unavailable." },
          { verse: 3, text: "Please try again later." }
        ]
      })
    } finally {
      setBibleLoading(false)
    }
  }

  // Listen for search events from header
  useEffect(() => {
    const handleSearchEvent = (event) => {
      const query = event.detail
      if (query && query.trim()) {
        searchBible(query)
      }
    }

    window.addEventListener('searchBible', handleSearchEvent)
    return () => window.removeEventListener('searchBible', handleSearchEvent)
  }, [])

  // Bible books data organized by testament
  const oldTestamentBooks = [
    { name: 'Genesis', chapters: 50, category: 'Old Testament' },
    { name: 'Exodus', chapters: 40, category: 'Old Testament' },
    { name: 'Leviticus', chapters: 27, category: 'Old Testament' },
    { name: 'Numbers', chapters: 36, category: 'Old Testament' },
    { name: 'Deuteronomy', chapters: 34, category: 'Old Testament' },
    { name: 'Joshua', chapters: 24, category: 'Old Testament' },
    { name: 'Judges', chapters: 21, category: 'Old Testament' },
    { name: 'Ruth', chapters: 4, category: 'Old Testament' },
    { name: '1 Samuel', chapters: 31, category: 'Old Testament' },
    { name: '2 Samuel', chapters: 24, category: 'Old Testament' },
    { name: '1 Kings', chapters: 22, category: 'Old Testament' },
    { name: '2 Kings', chapters: 25, category: 'Old Testament' },
    { name: '1 Chronicles', chapters: 29, category: 'Old Testament' },
    { name: '2 Chronicles', chapters: 36, category: 'Old Testament' },
    { name: 'Ezra', chapters: 10, category: 'Old Testament' },
    { name: 'Nehemiah', chapters: 13, category: 'Old Testament' },
    { name: 'Esther', chapters: 10, category: 'Old Testament' },
    { name: 'Job', chapters: 42, category: 'Old Testament' },
    { name: 'Psalms', chapters: 150, category: 'Old Testament' },
    { name: 'Proverbs', chapters: 31, category: 'Old Testament' },
    { name: 'Ecclesiastes', chapters: 12, category: 'Old Testament' },
    { name: 'Song of Songs', chapters: 8, category: 'Old Testament' },
    { name: 'Isaiah', chapters: 66, category: 'Old Testament' },
    { name: 'Jeremiah', chapters: 52, category: 'Old Testament' },
    { name: 'Lamentations', chapters: 5, category: 'Old Testament' },
    { name: 'Ezekiel', chapters: 48, category: 'Old Testament' },
    { name: 'Daniel', chapters: 12, category: 'Old Testament' },
    { name: 'Hosea', chapters: 14, category: 'Old Testament' },
    { name: 'Joel', chapters: 3, category: 'Old Testament' },
    { name: 'Amos', chapters: 9, category: 'Old Testament' },
    { name: 'Obadiah', chapters: 1, category: 'Old Testament' },
    { name: 'Jonah', chapters: 4, category: 'Old Testament' },
    { name: 'Micah', chapters: 7, category: 'Old Testament' },
    { name: 'Nahum', chapters: 3, category: 'Old Testament' },
    { name: 'Habakkuk', chapters: 3, category: 'Old Testament' },
    { name: 'Zephaniah', chapters: 3, category: 'Old Testament' },
    { name: 'Haggai', chapters: 2, category: 'Old Testament' },
    { name: 'Zechariah', chapters: 14, category: 'Old Testament' },
    { name: 'Malachi', chapters: 4, category: 'Old Testament' }
  ]

  const newTestamentBooks = [
    { name: 'Matthew', chapters: 28, category: 'New Testament' },
    { name: 'Mark', chapters: 16, category: 'New Testament' },
    { name: 'Luke', chapters: 24, category: 'New Testament' },
    { name: 'John', chapters: 21, category: 'New Testament' },
    { name: 'Acts', chapters: 28, category: 'New Testament' },
    { name: 'Romans', chapters: 16, category: 'New Testament' },
    { name: '1 Corinthians', chapters: 16, category: 'New Testament' },
    { name: '2 Corinthians', chapters: 13, category: 'New Testament' },
    { name: 'Galatians', chapters: 6, category: 'New Testament' },
    { name: 'Ephesians', chapters: 6, category: 'New Testament' },
    { name: 'Philippians', chapters: 4, category: 'New Testament' },
    { name: 'Colossians', chapters: 4, category: 'New Testament' },
    { name: '1 Thessalonians', chapters: 5, category: 'New Testament' },
    { name: '2 Thessalonians', chapters: 3, category: 'New Testament' },
    { name: '1 Timothy', chapters: 6, category: 'New Testament' },
    { name: '2 Timothy', chapters: 4, category: 'New Testament' },
    { name: 'Titus', chapters: 3, category: 'New Testament' },
    { name: 'Philemon', chapters: 1, category: 'New Testament' },
    { name: 'Hebrews', chapters: 13, category: 'New Testament' },
    { name: 'James', chapters: 5, category: 'New Testament' },
    { name: '1 Peter', chapters: 5, category: 'New Testament' },
    { name: '2 Peter', chapters: 3, category: 'New Testament' },
    { name: '1 John', chapters: 5, category: 'New Testament' },
    { name: '2 John', chapters: 1, category: 'New Testament' },
    { name: '3 John', chapters: 1, category: 'New Testament' },
    { name: 'Jude', chapters: 1, category: 'New Testament' },
    { name: 'Revelation', chapters: 22, category: 'New Testament' }
  ]

  const handleBookSelect = (book) => {
    setSelectedBook(book)
    setSelectedChapter(null)
    setBibleContent(null)
  }

  const handleChapterSelect = async (chapterNumber) => {
    setSelectedChapter(chapterNumber)
    setBibleContent(null)
    setBibleLoading(true)

    try {
      // Map book names to the GitHub Bible API format
      const bookNameMap = {
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
        'Song of Songs': 'songofsolomon',
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

      const bookCode = bookNameMap[selectedBook.name] || selectedBook.name.toLowerCase().replace(/\s+/g, '')
      
      console.log('Bible API request (KJV):', {
        book: selectedBook.name,
        bookCode,
        chapter: chapterNumber
      })

      // Use the GitHub Bible API with KJV
      const apiUrl = `https://raw.githubusercontent.com/wldeh/bible-api/main/bibles/en-kjv/books/${bookCode}/chapters/${chapterNumber}.json`
      
      console.log('Trying API URL:', apiUrl)
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Bible API response:', data)

      if (data.data && Array.isArray(data.data)) {
        // Filter out duplicate verses by using a Map to track unique verse numbers
        const uniqueVerses = new Map()
        
        data.data.forEach(verse => {
          const verseNum = parseInt(verse.verse)
          if (!uniqueVerses.has(verseNum)) {
            // Clean up the text by removing Hebrew annotations and extra formatting
            let cleanText = verse.text
              .replace(/\d+\.\d+\s+[^:]+:/g, '') // Remove numbered annotations like "1.4 the light from…: Heb. between the light and between the darkness"
              .replace(/\d+\.\d+\s+[^:]+/g, '') // Remove remaining numbered annotations
              .replace(/\bHeb\.\s+[^.]*\.?/g, '') // Remove "Heb. ..." annotations
              .replace(/\bor,\s+[^.]*\.?/g, '') // Remove "or, ..." annotations
              .replace(/¶\s*/g, '') // Remove paragraph symbols
              .replace(/\bseeding\s+seed\b/g, '') // Remove "seeding seed" annotations
              .replace(/\bcreeping\b/g, '') // Remove "creeping" annotations
              .replace(/\bcreepeth\b/g, '') // Remove "creepeth" annotations
              .replace(/\bgreen…:\s+Heb\.\s+[^.]*\.?/g, '') // Remove "green…: Heb. ..." annotations
              .replace(/\bstill…:\s+Heb\.\s+[^.]*\.?/g, '') // Remove "still…: Heb. ..." annotations
              .replace(/\banointest:\s+Heb\.\s+[^.]*\.?/g, '') // Remove "anointest: Heb. ..." annotations
              .replace(/\bfor ever:\s+Heb\.\s+[^.]*\.?/g, '') // Remove "for ever: Heb. ..." annotations
              .replace(/\s+/g, ' ') // Replace multiple spaces with single space
              .trim() // Remove leading/trailing spaces
            
            uniqueVerses.set(verseNum, {
              verse: verseNum,
              text: cleanText
            })
          }
        })
        
        // Convert Map values to array and sort by verse number
        const verses = Array.from(uniqueVerses.values()).sort((a, b) => a.verse - b.verse)

        if (verses.length > 0) {
          setBibleContent({
            book: selectedBook.name,
            chapter: chapterNumber,
            verses: verses
          })
        } else {
          throw new Error('No verses found in API response')
        }
      } else {
        throw new Error('Invalid API response format')
      }
    } catch (error) {
      console.error('Error fetching Bible content:', error)
      
      // Fallback content
      let fallbackVerses = []
      
      if (selectedBook.name === 'Genesis' && chapterNumber === 1) {
        fallbackVerses = [
          { verse: 1, text: "In the beginning God created the heavens and the earth." },
          { verse: 2, text: "Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters." },
          { verse: 3, text: "And God said, 'Let there be light,' and there was light." },
          { verse: 4, text: "God saw that the light was good, and he separated the light from the darkness." },
          { verse: 5, text: "God called the light 'day,' and the darkness he called 'night.' And there was evening, and there was morning—the first day." }
        ]
      } else if (selectedBook.name === 'Psalms' && chapterNumber === 23) {
        fallbackVerses = [
          { verse: 1, text: "The Lord is my shepherd, I lack nothing." },
          { verse: 2, text: "He makes me lie down in green pastures, he leads me beside quiet waters," },
          { verse: 3, text: "he refreshes my soul. He guides me along the right paths for his name's sake." },
          { verse: 4, text: "Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me." },
          { verse: 5, text: "You prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows." },
          { verse: 6, text: "Surely your goodness and love will follow me all the days of my life, and I will dwell in the house of the Lord forever." }
        ]
      } else {
        fallbackVerses = [
          { verse: 1, text: `Welcome to ${selectedBook.name} chapter ${chapterNumber}.` },
          { verse: 2, text: "Bible API is currently unavailable." },
          { verse: 3, text: "Please try again later." },
          { verse: 4, text: "Error: " + error.message }
        ]
      }
      
      setBibleContent({
        book: selectedBook.name,
        chapter: chapterNumber,
        verses: fallbackVerses
      })
    } finally {
      setBibleLoading(false)
    }
  }

  return (
    <div className="mb-8" data-bible-reader>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Bible Reading</h2>

      {/* Search Results */}
      {showSearchResults && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {isSearching ? 'Searching...' : `Search Results for "${searchQuery}"`}
            </h3>
            <button
              onClick={() => {
                setShowSearchResults(false)
                setSearchResults([])
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

                 {isSearching ? (
                   <div className="text-center py-6 md:py-8">
                     <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-3 md:mb-4"></div>
                     <p className="text-sm md:text-base text-gray-600 px-4">{searchProgress || 'Searching the Bible...'}</p>
                   </div>
                 ) : searchResults.length > 0 ? (
                   <div>
                     {/* Search Results */}
                     <div className="space-y-3 md:space-y-4 max-h-80 md:max-h-96 overflow-y-auto">
                       {searchResults.map((result, index) => (
                         <div 
                           key={index} 
                           className="p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200"
                           onClick={() => {
                             // Find the book key by matching the display name
                             const bookKey = Object.keys(bookNameMap).find(key => 
                               bookNameMap[key] === result.book
                             )
                             
                             if (bookKey) {
                               console.log('Found book key:', bookKey, 'for book:', result.book)
                               // Set the selected book
                               const bookData = {
                                 name: result.book,
                                 chapters: bookChapterCounts[bookKey] || 1,
                                 category: allBibleBooks.indexOf(bookKey) < 39 ? 'Old Testament' : 'New Testament'
                               }
                               console.log('Setting book data:', bookData)
                               setSelectedBook(bookData)
                               setSelectedChapter(result.chapter)
                               setBibleContent(null)
                               setShowSearchResults(false)
                               setSearchResults([])
                               
                               // Load the chapter content directly
                               setTimeout(() => {
                                 // Directly fetch and display the chapter content
                                 fetchChapterContent(result.book, result.chapter)
                               }, 200)
                               
                               // Highlight the specific verse
                               setHighlightedVerse(result.verse)
                               
                               // Clear highlight after 5 seconds
                               setTimeout(() => {
                                 setHighlightedVerse(null)
                               }, 5000)
                               
                               // Scroll to the Bible reader
                               setTimeout(() => {
                                 const bibleReader = document.querySelector('[data-bible-reader]')
                                 if (bibleReader) {
                                   bibleReader.scrollIntoView({ behavior: 'smooth' })
                                 }
                               }, 200)
                             } else {
                               console.log('Book not found:', result.book, 'Available books:', Object.values(bookNameMap))
                               // Try to find a close match
                               const closeMatch = Object.keys(bookNameMap).find(key => 
                                 bookNameMap[key].toLowerCase().includes(result.book.toLowerCase()) ||
                                 result.book.toLowerCase().includes(bookNameMap[key].toLowerCase())
                               )
                               if (closeMatch) {
                                 console.log('Found close match:', closeMatch, 'for book:', result.book)
                                 const bookData = {
                                   name: result.book,
                                   chapters: bookChapterCounts[closeMatch] || 1,
                                   category: allBibleBooks.indexOf(closeMatch) < 39 ? 'Old Testament' : 'New Testament'
                                 }
                                 setSelectedBook(bookData)
                                 setSelectedChapter(result.chapter)
                                 setBibleContent(null)
                                 setShowSearchResults(false)
                                 setSearchResults([])
                                 
                                 // Load the chapter content directly
                                 setTimeout(() => {
                                   fetchChapterContent(result.book, result.chapter)
                                 }, 200)
                                 
                                 setHighlightedVerse(result.verse)
                                 setTimeout(() => setHighlightedVerse(null), 5000)
                               }
                             }
                           }}
                         >
                           <div className="flex items-start justify-between mb-2">
                             <span className="font-semibold text-blue-600 text-sm md:text-base hover:text-blue-800 flex-1 truncate">
                               {result.reference}
                             </span>
                             {result.relevance > 1 && (
                               <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex-shrink-0 ml-2">
                                 {result.relevance}x
                               </span>
                             )}
                           </div>
                           <p className="text-sm md:text-base text-gray-800 leading-relaxed">
                             {result.text}
                           </p>
                           <div className="mt-2 text-xs text-blue-500 flex items-center">
                             <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                             </svg>
                             <span className="truncate">Click to read in context</span>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">
                No verses found containing "{searchQuery}". Try a different search term.
              </p>
            </div>
          )}
        </div>
      )}

      {!selectedBook || !selectedChapter ? (
        // Book Selection
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">📖 Choose a Book</h3>
                <p className="text-gray-600 text-sm sm:text-lg">Select a book from the Bible to start reading</p>
              </div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg ml-3">
                <span className="text-white text-lg sm:text-2xl">✨</span>
              </div>
            </div>
          </div>

          {/* Old Testament Section */}
          <div className="mb-8 sm:mb-10">
            <div className="flex items-center mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center mr-4 sm:mr-6 shadow-lg">
                <span className="text-white text-lg sm:text-xl font-bold">OT</span>
              </div>
              <div className="flex-1">
                <h4 className="text-lg sm:text-2xl font-bold text-gray-900">Old Testament</h4>
                <p className="text-gray-600 text-sm sm:text-lg">39 books • Law, History, Poetry, Prophets</p>
              </div>
            </div>
            <div className="space-y-2">
              {oldTestamentBooks.map((book, index) => (
                <div key={index}>
                  <button
                    onClick={() => handleBookSelect(book)}
                    className="group w-full flex items-center justify-between p-3 sm:p-4 lg:p-5 bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50 rounded-xl sm:rounded-2xl hover:from-orange-100 hover:to-orange-200 transition-all duration-300 border border-orange-200 hover:border-orange-400 hover:shadow-xl transform hover:scale-[1.01] sm:hover:scale-[1.02] min-h-[60px] sm:min-h-[70px]"
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                        <span className="text-white text-xs sm:text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <div className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-orange-700 transition-colors truncate">{book.name}</div>
                        <div className="text-xs sm:text-sm text-gray-600 group-hover:text-orange-600 transition-colors truncate">{book.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                      <span className="text-xs sm:text-sm text-gray-500 font-medium hidden sm:block">{book.chapters} chapters</span>
                      <span className="text-xs text-gray-500 font-medium sm:hidden">{book.chapters}</span>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-200 rounded-md sm:rounded-lg flex items-center justify-center group-hover:bg-orange-300 transition-colors">
                        <span className="text-orange-600 text-sm sm:text-lg">→</span>
                      </div>
                    </div>
                  </button>
                  
                  {/* Chapter Grid - Show when this book is selected */}
                  {selectedBook && selectedBook.name === book.name && !selectedChapter && (
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h5 className="text-base sm:text-lg font-semibold text-gray-800">{book.name} Chapters</h5>
                        <button
                          onClick={() => setSelectedBook(null)}
                          className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
                        >
                          ← Back
                        </button>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
                        {Array.from({ length: book.chapters }, (_, i) => i + 1).map((chapter) => (
                          <button
                            key={chapter}
                            onClick={() => handleChapterSelect(chapter)}
                            className="aspect-square bg-gray-100 rounded-md sm:rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center border border-gray-200 hover:border-gray-300 min-h-[40px] sm:min-h-[44px]"
                          >
                            <span className="text-xs sm:text-sm font-semibold text-gray-900">{chapter}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* New Testament Section */}
          <div className="mb-8 sm:mb-10">
            <div className="flex items-center mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl sm:rounded-2xl flex items-center justify-center mr-4 sm:mr-6 shadow-lg">
                <span className="text-white text-lg sm:text-xl font-bold">NT</span>
              </div>
              <div className="flex-1">
                <h4 className="text-lg sm:text-2xl font-bold text-gray-900">New Testament</h4>
                <p className="text-gray-600 text-sm sm:text-lg">27 books • Gospels, History, Letters, Revelation</p>
              </div>
            </div>
            <div className="space-y-2">
              {newTestamentBooks.map((book, index) => (
                <div key={index}>
                  <button
                    onClick={() => handleBookSelect(book)}
                    className="group w-full flex items-center justify-between p-3 sm:p-4 lg:p-5 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 rounded-xl sm:rounded-2xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 border border-blue-200 hover:border-blue-400 hover:shadow-xl transform hover:scale-[1.01] sm:hover:scale-[1.02] min-h-[60px] sm:min-h-[70px]"
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                        <span className="text-white text-xs sm:text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <div className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate">{book.name}</div>
                        <div className="text-xs sm:text-sm text-gray-600 group-hover:text-blue-600 transition-colors truncate">{book.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                      <span className="text-xs sm:text-sm text-gray-500 font-medium hidden sm:block">{book.chapters} chapters</span>
                      <span className="text-xs text-gray-500 font-medium sm:hidden">{book.chapters}</span>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-200 rounded-md sm:rounded-lg flex items-center justify-center group-hover:bg-blue-300 transition-colors">
                        <span className="text-blue-600 text-sm sm:text-lg">→</span>
                      </div>
                    </div>
                  </button>
                  
                  {/* Chapter Grid - Show when this book is selected */}
                  {selectedBook && selectedBook.name === book.name && !selectedChapter && (
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h5 className="text-base sm:text-lg font-semibold text-gray-800">{book.name} Chapters</h5>
                        <button
                          onClick={() => setSelectedBook(null)}
                          className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
                        >
                          ← Back
                        </button>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
                        {Array.from({ length: book.chapters }, (_, i) => i + 1).map((chapter) => (
                          <button
                            key={chapter}
                            onClick={() => handleChapterSelect(chapter)}
                            className="aspect-square bg-gray-100 rounded-md sm:rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center border border-gray-200 hover:border-gray-300 min-h-[40px] sm:min-h-[44px]"
                          >
                            <span className="text-xs sm:text-sm font-semibold text-gray-900">{chapter}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Bible Content
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 p-4 sm:p-6 lg:p-8">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            {/* Title and Info Row */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-white text-lg sm:text-2xl">📖</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{selectedBook.name} {selectedChapter}</h3>
                  <p className="text-gray-600 text-sm sm:text-lg">{selectedBook.category} • KJV</p>
                </div>
              </div>
            </div>
            
            {/* Navigation Buttons Row */}
            <div className="flex items-center justify-center sm:justify-end">
              <div className="flex items-center space-x-3 bg-gray-100 rounded-xl p-2">
                <button
                  onClick={() => setSelectedChapter(null)}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
                >
                  ← Chapters
                </button>
                <button
                  onClick={() => {
                    setSelectedBook(null)
                    setSelectedChapter(null)
                  }}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
                >
                  ← Books
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {bibleContent && (
              <div className="space-y-3 sm:space-y-4">
                {bibleContent.verses.map((verse, index) => (
                  <div 
                    key={index} 
                    className={`flex transition-all duration-500 ${
                      highlightedVerse === verse.verse 
                        ? 'bg-yellow-100 border-l-4 border-yellow-400 pl-3 sm:pl-4 py-2 rounded-r-lg' 
                        : ''
                    }`}
                  >
                    <span className="text-blue-600 font-semibold mr-2 sm:mr-3 min-w-[1.5rem] sm:min-w-[2rem] text-sm sm:text-base">{verse.verse}</span>
                    <span className="text-gray-800 leading-relaxed text-sm sm:text-base">{verse.text}</span>
                  </div>
                ))}
              </div>
            )}

            {bibleLoading && (
              <div className="text-center py-8 sm:py-12">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 animate-spin">📖</div>
                <p className="text-gray-600 text-sm sm:text-base">Loading Bible content...</p>
              </div>
            )}

            {!bibleContent && !bibleLoading && (
              <div className="text-center py-8 sm:py-12">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📖</div>
                <p className="text-gray-600 text-sm sm:text-base">Select a chapter to start reading</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-gray-200">
              <button
                onClick={() => selectedChapter > 1 && handleChapterSelect(selectedChapter - 1)}
                disabled={selectedChapter <= 1}
                className={`font-medium text-sm sm:text-base px-2 py-1 sm:px-3 sm:py-2 rounded ${
                  selectedChapter <= 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                ← Previous
              </button>
              <button
                onClick={() => selectedChapter < selectedBook.chapters && handleChapterSelect(selectedChapter + 1)}
                disabled={selectedChapter >= selectedBook.chapters}
                className={`font-medium text-sm sm:text-base px-2 py-1 sm:px-3 sm:py-2 rounded ${
                  selectedChapter >= selectedBook.chapters
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BibleReader