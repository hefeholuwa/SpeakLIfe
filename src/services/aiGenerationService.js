import { supabase } from '../supabaseClient.jsx'

class AIGenerationService {
  constructor() {
    // Use import.meta.env for Vite or fallback to empty string
    this.apiKey = import.meta.env?.VITE_OPENROUTER_API_KEY || import.meta.env?.REACT_APP_OPENROUTER_API_KEY || ''
    this.baseURL = 'https://openrouter.ai/api/v1'
    this.model = 'mistralai/mistral-small-3.2-24b-instruct:free' // BEST FREE model - 24B parameters, excellent reasoning
    this.freeModels = [
      'mistralai/mistral-small-3.2-24b-instruct:free', // BEST FREE - 24B parameters, excellent reasoning and spiritual content
      'mistralai/mixtral-8x7b-instruct', // EXCELLENT - Outperforms Llama 2 70B, 6x faster
      'meta-llama/llama-3.1-8b-instruct', // VERY GOOD - Strong reasoning, 128K context
      'deepseek/deepseek-chat', // VERY GOOD - Strong reasoning, 128K context
      'google/gemini-flash-1.5', // GOOD - 1M token context, multimodal
      'microsoft/phi-3-mini-4k-instruct', // GOOD - Microsoft's efficient model
      'meta-llama/llama-3.2-3b-instruct', // GOOD - Meta's efficient model
      'google/gemma-2-9b-it', // GOOD - Google's lightweight model
      'qwen/qwen-2.5-7b-instruct' // GOOD - Alibaba's multilingual model
    ]
    
    // Enhanced randomization and duplicate checking
    this.generatedContent = new Set() // Track generated content to avoid duplicates
    this.usedThemes = new Set() // Track used themes for better variety
    this.usedVerses = new Set() // Track used verse references
    this.usedConfessions = new Set() // Track used confession patterns
  }

  // Check for duplicate content in database
  async checkForDuplicates(contentType, content) {
    try {
      let tableName, fieldName
      
      switch (contentType) {
        case 'verse':
          tableName = 'daily_verses'
          fieldName = 'verse_text'
          break
        case 'confession':
          tableName = 'daily_verses'
          fieldName = 'confession_text'
          break
        case 'topic_verse':
          tableName = 'topic_verses'
          fieldName = 'verse_text'
          break
        case 'topic_confession':
          tableName = 'topic_confessions'
          fieldName = 'confession_text'
          break
        default:
          return false
      }

      // Check for exact matches first
      const { data: exactMatches, error: exactError } = await supabase
        .from(tableName)
        .select(fieldName)
        .eq(fieldName, content)

      if (exactError) {
        console.error('Error checking exact duplicates:', exactError)
        return false
      }

      if (exactMatches && exactMatches.length > 0) {
        console.log('🔍 Exact duplicate found')
        return true
      }

      // Check for similar content (first 30 characters)
      const contentStart = content.substring(0, 30).trim()
      if (contentStart.length < 10) return false // Too short to be meaningful

      const { data: similarMatches, error: similarError } = await supabase
        .from(tableName)
        .select(fieldName)
        .ilike(fieldName, `%${contentStart}%`)

      if (similarError) {
        console.error('Error checking similar duplicates:', similarError)
        return false
      }

      if (similarMatches && similarMatches.length > 0) {
        console.log('🔍 Similar content found:', similarMatches.length, 'matches')
        return true
      }

      return false
    } catch (error) {
      console.error('Error in duplicate check:', error)
      return false
    }
  }

  // Get unused themes for better variety
  getUnusedThemes() {
    const allThemes = [
        'faith and trust in God', 'divine love and grace', 'spiritual warfare and victory', 
        'prayer and communion', 'hope and restoration', 'wisdom and understanding',
        'peace and comfort', 'strength and endurance', 'salvation and redemption',
        'holiness and sanctification', 'worship and praise', 'servanthood and humility',
        'forgiveness and mercy', 'courage and boldness', 'joy and gladness',
        'perseverance and patience', 'divine protection', 'spiritual growth',
      'kingdom principles', 'eternal perspective', 'divine purpose', 'spiritual authority',
      'divine timing', 'spiritual discernment', 'inner transformation', 'divine calling',
      'spiritual maturity', 'divine favor', 'spiritual breakthrough', 'divine alignment',
      'spiritual warfare', 'divine strategy', 'spiritual inheritance', 'divine restoration'
    ]
    
    const unusedThemes = allThemes.filter(theme => !this.usedThemes.has(theme))
    
    // If all themes used, reset and start fresh
    if (unusedThemes.length === 0) {
      this.usedThemes.clear()
      return allThemes
    }
    
    return unusedThemes
  }

  // Clear used content tracking to prevent memory buildup
  clearUsedContent() {
    if (this.usedThemes.size > 20) {
      console.log('🧹 Clearing used themes to prevent memory buildup')
      this.usedThemes.clear()
    }
    if (this.usedVerses.size > 50) {
      console.log('🧹 Clearing used verses to prevent memory buildup')
      this.usedVerses.clear()
    }
    if (this.usedConfessions.size > 30) {
      console.log('🧹 Clearing used confessions to prevent memory buildup')
      this.usedConfessions.clear()
    }
  }

  // Get random model for variety
  getRandomModel() {
    const availableModels = this.freeModels.filter(model => 
      model !== this.model // Don't use the same model twice in a row
    )
    
    if (availableModels.length === 0) {
      return this.freeModels[Math.floor(Math.random() * this.freeModels.length)]
    }
    
    return availableModels[Math.floor(Math.random() * availableModels.length)]
  }

  // Enhanced randomization with content tracking
  getRandomizedPrompt(basePrompt, contentType) {
    const timestamp = Date.now()
    const randomSeed = Math.floor(Math.random() * 1000000)
    const sessionId = Math.random().toString(36).substring(7)
    
    return `${basePrompt}

RANDOMIZATION INSTRUCTIONS:
- Current timestamp: ${timestamp}
- Random seed: ${randomSeed}
- Session ID: ${sessionId}
- Content type: ${contentType}
- Generate completely unique content that has never been generated before
- Use creative variations in language, structure, and approach
- Avoid any patterns from previous generations
- Be innovative and fresh in your approach`
  }

  // Generate daily verse with AI as the main source
  async generateDailyVerse(retryCount = 0) {
    try {
      console.log(`🎲 Generating daily verse with AI... (attempt ${retryCount + 1})`)
      
      // Prevent infinite recursion
      if (retryCount >= 3) {
        console.log('⚠️ Max retries reached, using fallback content')
        return this.getFallbackDailyVerse()
      }
      
      // Get unused themes for better variety
      const availableThemes = this.getUnusedThemes()
      const randomTheme = availableThemes[Math.floor(Math.random() * availableThemes.length)]
      
      console.log('🎯 Selected theme:', randomTheme)
      
      // Track used theme
      this.usedThemes.add(randomTheme)
      
      const translations = [
        'KJV', 'NKJV', 'NIV', 'AMP', 'ESV', 'NLT'
      ]
      const randomTranslation = translations[Math.floor(Math.random() * translations.length)]
      
      const basePrompt = `You are a Bible scholar with deep knowledge of Scripture. Generate a POWERFUL, LESS COMMON Bible verse for today's daily devotion.

      CRITICAL: You must provide the EXACT text of a REAL Bible verse, not a confession or interpretation.

      REQUIREMENTS:
      - Choose ONE verse from this DIVERSE list of powerful, less common verses:
      - Isaiah 43:19, Isaiah 55:8-9, Isaiah 61:1, Isaiah 65:24, Isaiah 66:13
      - Jeremiah 1:5, Jeremiah 17:7-8, Jeremiah 31:3, Jeremiah 33:3
      - Psalm 18:2, Psalm 27:1, Psalm 34:8, Psalm 37:4, Psalm 46:10, Psalm 84:11, Psalm 91:4, Psalm 103:2-3, Psalm 139:13-14
      - Romans 5:8, Romans 8:38-39, Romans 12:1, Romans 15:13, Romans 16:20
      - Philippians 1:6, Philippians 2:13, Philippians 3:14, Philippians 4:6-7
      - Hebrews 4:16, Hebrews 10:23, Hebrews 12:1-2, Hebrews 13:5-6
      - 2 Corinthians 3:18, 2 Corinthians 4:16-18, 2 Corinthians 9:8, 2 Corinthians 12:9-10
      - Ephesians 1:3, Ephesians 2:10, Ephesians 3:16-17, Ephesians 4:23-24, Ephesians 6:18
      - Matthew 5:4, Matthew 5:8, Matthew 11:28-30, Matthew 19:26, Matthew 28:20
      - John 1:12, John 8:12, John 10:10, John 14:1, John 15:5, John 16:33, John 17:3
      - Proverbs 4:23, Proverbs 16:3, Proverbs 18:10, Proverbs 19:21
      - Joshua 1:8, Joshua 24:15
      - 1 Corinthians 2:9, 1 Corinthians 15:58, 1 Corinthians 16:13-14
      - Galatians 5:22-23, Galatians 6:9
      - 1 Peter 1:3, 1 Peter 2:9, 1 Peter 3:15, 1 Peter 4:8
      - James 1:2-3, James 1:17, James 4:8, James 5:16
      - 1 John 1:9, 1 John 3:1, 1 John 4:4, 1 John 5:14-15
      - Revelation 3:20, Revelation 21:4, Revelation 22:17
      - Use the ${randomTranslation} translation
      - Provide the EXACT verse text as it appears in that translation
      - Do NOT paraphrase, interpret, or create confessions
      - Focus on theme: "${randomTheme}"
      
      EXAMPLES OF ACCURATE VERSES IN DIFFERENT TRANSLATIONS:
      - KJV: "For my thoughts are not your thoughts, neither are your ways my ways, saith the Lord."
      - NIV: "For my thoughts are not your thoughts, neither are your ways my ways, declares the Lord."
      - ESV: "For my thoughts are not your thoughts, neither are your ways my ways, declares the Lord."
      - NLT: "My thoughts are nothing like your thoughts, says the Lord. And my ways are far beyond anything you could imagine."
      - AMP: "For My thoughts are not your thoughts, nor are your ways My ways, declares the Lord."
      - NKJV: "For My thoughts are not your thoughts, nor are your ways My ways, says the Lord."
      
      CRITICAL: You MUST include the translation field in your response. The translation field is REQUIRED.
      
      FORMAT: Return as JSON with fields: verse_text, reference, book, chapter, verse, translation, theme
      
      Example: {"verse_text": "For my thoughts are not your thoughts, neither are your ways my ways, saith the Lord.", "reference": "Isaiah 55:8", "book": "Isaiah", "chapter": 55, "verse": 8, "translation": "KJV", "theme": "divine wisdom"}
      
      REMEMBER: The translation field is MANDATORY and must match the ${randomTranslation} you are using.`

      const prompt = this.getRandomizedPrompt(basePrompt, 'daily_verse')
      const response = await this.callOpenRouter(prompt)
      const cleanedResponse = this.cleanJsonResponse(response)
      
      
      const result = JSON.parse(cleanedResponse)
      
      // Ensure translation field is present
      if (!result.translation) {
        result.translation = randomTranslation
      }
      
      // Check for duplicates in database
      const isDuplicate = await this.checkForDuplicates('verse', result.verse_text)
      if (isDuplicate) {
        console.log(`Duplicate verse detected (attempt ${retryCount + 1}), generating alternative...`)
        // Track used verse reference
        this.usedVerses.add(result.reference)
        // Generate alternative with different approach
        return await this.generateDailyVerse(retryCount + 1) // Recursive call with retry count
      }
      
      // Track used verse reference
      this.usedVerses.add(result.reference)
      
      // Clear used content to prevent memory buildup
      this.clearUsedContent()
      
      return result
    } catch (error) {
      console.error('Error generating daily verse:', error)
      // Return fallback content instead of throwing error
      return this.getFallbackDailyVerse()
    }
  }

  // Fallback daily verse when AI generation fails
  getFallbackDailyVerse() {
    const fallbackVerses = [
      {
        verse_text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
        reference: "Jeremiah 29:11",
        book: "Jeremiah",
        chapter: 29,
        verse: 11,
        translation: "NIV",
        theme: "divine purpose"
      },
      {
        verse_text: "I can do all things through Christ who strengthens me.",
        reference: "Philippians 4:13",
        book: "Philippians",
        chapter: 4,
        verse: 13,
        translation: "KJV",
        theme: "strength and endurance"
      },
      {
        verse_text: "Trust in the Lord with all your heart and lean not on your own understanding.",
        reference: "Proverbs 3:5",
        book: "Proverbs",
        chapter: 3,
        verse: 5,
        translation: "NIV",
        theme: "faith and trust"
      }
    ]
    
    const randomFallback = fallbackVerses[Math.floor(Math.random() * fallbackVerses.length)]
    console.log('📖 Using fallback verse:', randomFallback.reference)
    return randomFallback
  }

  // Generate confession related to the verse
  async generateConfessionForVerse(verseData) {
    try {
      const confessionStyles = [
        'declaration of faith', 'prophetic declaration', 'spiritual warfare confession',
        'kingdom identity', 'divine inheritance', 'spiritual authority',
        'healing and restoration', 'victory and triumph', 'divine protection',
        'spiritual breakthrough', 'kingdom advancement', 'spiritual authority'
      ]
      
      // Get unused confession styles for variety
      const availableStyles = confessionStyles.filter(style => !this.usedConfessions.has(style))
      const randomStyle = availableStyles.length > 0 
        ? availableStyles[Math.floor(Math.random() * availableStyles.length)]
        : confessionStyles[Math.floor(Math.random() * confessionStyles.length)]
      
      // Track used style
      this.usedConfessions.add(randomStyle)
      
      const prompt = `CRITICAL: Generate a confession that DIRECTLY aligns with this specific Bible verse: "${verseData.verse_text}" (${verseData.reference})

      VERSE ALIGNMENT REQUIREMENTS:
      - The confession MUST directly reflect the specific message, theme, and spiritual truth of this exact verse
      - Extract the core spiritual principle from the verse and make it personal
      - If the verse is about "being still" and "God fighting for you", the confession should reflect that exact theme
      - If the verse is about "strength in weakness", the confession should reflect that exact theme
      - If the verse is about "peace that passes understanding", the confession should reflect that exact theme
      - DO NOT create generic confessions that could apply to any verse
      - The confession must be a personal declaration of the verse's specific truth

      SPIRITUAL DEPTH & DOCTRINAL BALANCE:
      - Create a ${randomStyle} that directly connects to the verse's specific message
      - Ensure doctrinal soundness and biblical accuracy
      - Make it personal, powerful, and faith-building
      - Use spiritual language that resonates with believers
      - Include elements of: divine identity, spiritual authority, kingdom inheritance, prophetic declaration
      - Avoid generic or cliché confessions - create something unique and powerful
      
      CONFESSION REQUIREMENTS:
      - Keep it SHORT: 1-2 sentences maximum (not a paragraph)
      - Include "I declare", "I confess", "I believe", or similar powerful language
      - DIRECTLY connect to the verse's specific theme and message
      - Make it applicable to daily Christian walk
      - Include elements of faith, hope, victory, and spiritual authority
      - Sound spiritual but concise - not lengthy or verbose
      
      EXAMPLES OF GOOD ALIGNMENT:
      - Verse: "The Lord will fight for you; you need only to be still" → Confession: "I declare that the Lord fights my battles, and I rest in His victory while He works on my behalf"
      - Verse: "I can do all things through Christ who strengthens me" → Confession: "I confess that Christ's strength flows through me, empowering me for every challenge"
      - Verse: "Peace I leave with you" → Confession: "I receive the peace of Christ that surpasses all understanding and guards my heart"
      
      FORMAT: Return as JSON:
      {
        "title": "Powerful confession title that reflects the verse's specific theme",
        "confession_text": "Short, spiritually profound confession that directly aligns with the verse's message (1-2 sentences only)",
        "theme": "Theme that matches the verse theme",
        "style": "${randomStyle}"
      }`

      const response = await this.callOpenRouter(prompt)
      const result = JSON.parse(this.cleanJsonResponse(response))
      
      // Check for duplicates in database
      const isDuplicate = await this.checkForDuplicates('confession', result.confession_text)
      if (isDuplicate) {
        console.log('Duplicate confession detected, generating alternative...')
        // Generate alternative with different approach
        return await this.generateConfessionForVerse(verseData) // Recursive call with different randomization
      }
      
      return result
    } catch (error) {
      console.error('Error generating confession:', error)
      throw new Error('Failed to generate confession')
    }
  }

  // Generate topic-specific content
  async generateTopicContent(topic, contentType = 'verse') {
    try {
      const prompt = contentType === 'verse' 
        ? `Generate a Bible verse specifically related to the topic "${topic}". The verse should be encouraging and directly applicable to this theme. Include the verse text, reference, and a brief explanation of how it relates to ${topic}.`
        : `Generate a confession/declaration specifically for the topic "${topic}". Make it personal, powerful, and faith-building. The confession should be 2-3 sentences and directly relate to ${topic}.`

      const response = await this.callOpenRouter(prompt)
      return JSON.parse(this.cleanJsonResponse(response))
    } catch (error) {
      console.error(`Error generating ${contentType} for topic ${topic}:`, error)
      throw new Error(`Failed to generate ${contentType} for topic`)
    }
  }

  // Generate multiple verses for a topic
  async generateTopicVerses(topic, count = 3, existingVerses = []) {
    try {
      const translations = ['KJV', 'NIV', 'ESV', 'NASB', 'NLT', 'NKJV', 'AMP', 'MSG', 'CEV', 'NRSV']
      
      // Create a list of existing verses to avoid
      const existingVersesList = existingVerses.length > 0 
        ? `\n\nEXISTING VERSES TO AVOID (do not use these):\n${existingVerses.map(v => `- "${v.verse_text}" (${v.reference})`).join('\n')}`
        : ''

      const prompt = `Generate ${count} different spiritually profound Bible verses specifically related to the topic "${topic}". CRITICAL: You must use REAL, EXISTING Bible verses only. Do not create or make up any verse references.

      SPIRITUAL DEPTH & DOCTRINAL BALANCE:
      - Choose from diverse biblical books (not just popular ones like John, Psalms)
      - Include books like: Isaiah, Jeremiah, Ezekiel, Daniel, Hosea, Joel, Amos, Obadiah, Jonah, Micah, Nahum, Habakkuk, Zephaniah, Haggai, Zechariah, Malachi, Lamentations, Song of Solomon, Ecclesiastes, Proverbs, Job, Ruth, Esther, Ezra, Nehemiah, Chronicles, Kings, Samuel, Judges, Joshua, Deuteronomy, Numbers, Leviticus, Exodus, Genesis, Acts, Corinthians, Galatians, Ephesians, Philippians, Colossians, Thessalonians, Timothy, Titus, Philemon, Hebrews, James, Peter, John's epistles, Jude, Revelation
      - Focus on the topic: "${topic}"
      - Ensure doctrinal balance and spiritual depth
      - Avoid only well-known verses - include lesser-known but powerful scriptures
      - Use different Bible translations for variety: ${translations.join(', ')}
      - Ensure each verse is encouraging, faith-building, and spiritually enriching
      
      CRITICAL REQUIREMENTS:
      - MUST use REAL, EXISTING Bible verse references only
      - Do NOT create or invent any verse references
      - Each verse should include exact verse text as it appears in the specified Bible translation
      - Include complete reference (e.g., "Isaiah 43:2", "Hebrews 11:1")
      - Specify book name, chapter number, and verse number
      - Include the Bible translation used for each verse
      - Provide brief explanation of how the verse relates to the topic
      
      EXAMPLES OF REAL BIBLE VERSES:
      - Isaiah 40:31, Isaiah 43:2, Isaiah 55:8-9
      - Jeremiah 29:11, Jeremiah 33:3
      - Psalm 23:1, Psalm 91:1, Psalm 139:14
      - Romans 8:28, Romans 8:37, Romans 12:2
      - Philippians 4:13, Philippians 4:19
      - Hebrews 11:1, Hebrews 13:8
      - 2 Corinthians 5:17, 2 Corinthians 12:9
      - Ephesians 3:20, Ephesians 6:10
      - Matthew 6:33, Matthew 11:28
      - John 3:16, John 14:27, John 15:7
      ${existingVersesList}
      
      IMPORTANT: Return ONLY valid JSON. Do not include any markdown formatting, explanations, or additional text. Just the JSON array.
      
      FORMAT: Return as JSON array:
      [
        {
          "verse_text": "Exact verse text from the specified translation",
          "reference": "Book Chapter:Verse",
          "book": "Book name",
          "chapter": chapter_number,
          "verse": verse_number,
          "translation": "Bible translation used (e.g., KJV, NIV, ESV, etc.)"
        }
      ]`

      const response = await this.callOpenRouter(prompt)
      const cleanedResponse = this.cleanJsonResponse(response)
      
      try {
        const parsed = JSON.parse(cleanedResponse)
        
        // If it's not an array, wrap it in an array
        if (!Array.isArray(parsed)) {
          return [parsed]
        }
        
        // Check for duplicates in each verse
        const uniqueVerses = []
        for (const verse of parsed) {
          const isDuplicate = await this.checkForDuplicates('topic_verse', verse.verse_text)
          if (!isDuplicate) {
            uniqueVerses.push(verse)
            // Track used verse reference
            this.usedVerses.add(verse.reference)
          } else {
            console.log(`Duplicate verse detected: ${verse.reference}`)
          }
        }
        
        // If we have fewer unique verses than requested, generate more
        if (uniqueVerses.length < count) {
          const additionalCount = count - uniqueVerses.length
          const additionalVerses = await this.generateTopicVerses(topic, additionalCount, [...existingVerses, ...uniqueVerses])
          uniqueVerses.push(...additionalVerses)
        }
        
        return uniqueVerses.slice(0, count)
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
        console.error('Raw response:', response)
        console.error('Cleaned response:', cleanedResponse)
        
        // Try to return fallback content
        return [{
          verse_text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
          reference: "Jeremiah 29:11",
          book: "Jeremiah",
          chapter: 29,
          verse: 11,
          translation: "NIV"
        }]
      }
    } catch (error) {
      console.error(`Error generating verses for topic ${topic}:`, error)
      throw new Error(`Failed to generate verses for topic`)
    }
  }

  // Generate multiple confessions for a topic
  async generateTopicConfessions(topic, count = 3, existingConfessions = []) {
    try {
      const confessionTypes = [
        'prophetic declaration', 'spiritual warfare confession', 'kingdom identity',
        'divine inheritance', 'healing and restoration', 'victory and triumph',
        'spiritual authority', 'divine protection', 'spiritual breakthrough',
        'faith declaration', 'hope proclamation', 'love manifestation'
      ]
      
      // Create a list of existing confessions to avoid
      const existingConfessionsList = existingConfessions.length > 0 
        ? `\n\nEXISTING CONFESSIONS TO AVOID (do not use these):\n${existingConfessions.map(c => `- "${c.title}": "${c.confession_text}"`).join('\n')}`
        : ''
      
      const prompt = `Generate ${count} different short, powerful spiritual confessions/declarations specifically for the topic "${topic}". 

      TOPIC-SPECIFIC ALIGNMENT:
      - Each confession must DIRECTLY relate to the specific spiritual theme of "${topic}"
      - If topic is "Faith" → confessions should be about believing, trusting, having faith
      - If topic is "Peace" → confessions should be about peace, tranquility, God's protection
      - If topic is "Love" → confessions should be about God's love, loving others, being loved
      - If topic is "Wisdom" → confessions should be about divine wisdom, understanding, guidance
      - If topic is "Prosperity" → confessions should be about God's provision, abundance, blessing
      - If topic is "Relationships" → confessions should be about godly connections, fellowship, unity
      - DO NOT create generic confessions that could apply to any topic
      - Each confession must be a personal declaration of the topic's specific spiritual truth

      SPIRITUAL DEPTH & DOCTRINAL BALANCE:
      - Each confession should be doctrinally sound and biblically accurate
      - Include spiritual warfare elements, kingdom principles, and divine promises
      - Make each confession unique and powerful, avoiding generic or cliché language
      - Use spiritual vocabulary that resonates with believers
      - Include elements of: divine identity, spiritual authority, kingdom inheritance, prophetic declaration
      - Draw from various biblical themes and doctrines for depth
      - Ensure variety in confession styles and approaches
      
      CONFESSION REQUIREMENTS:
      - Keep each confession SHORT: 1-2 sentences maximum (not paragraphs)
      - Include powerful language like "I declare", "I confess", "I believe", "I receive"
      - Connect directly to the topic while expanding on spiritual truths
      - Make each applicable to daily Christian walk
      - Include elements of faith, hope, victory, and spiritual authority
      - Use different confession types: ${confessionTypes.join(', ')}
      - Sound spiritual but concise - not lengthy or verbose
      ${existingConfessionsList}
      
      IMPORTANT: Return ONLY valid JSON. Do not include any markdown formatting, explanations, or additional text. Just the JSON array.
      
      FORMAT: Return as JSON array:
      [
        {
          "title": "Powerful confession title (e.g., 'Declaration of Divine Authority', 'Confession of Kingdom Inheritance')",
          "confession_text": "Short, spiritually profound confession/declaration text (1-2 sentences only)"
        }
      ]`

      const response = await this.callOpenRouter(prompt)
      const cleanedResponse = this.cleanJsonResponse(response)
      
      try {
        const parsed = JSON.parse(cleanedResponse)
        
        // If it's not an array, wrap it in an array
        if (!Array.isArray(parsed)) {
          return [parsed]
        }
        
        // Check for duplicates in each confession
        const uniqueConfessions = []
        for (const confession of parsed) {
          const isDuplicate = await this.checkForDuplicates('topic_confession', confession.confession_text)
          if (!isDuplicate) {
            uniqueConfessions.push(confession)
            // Track used confession pattern
            this.usedConfessions.add(confession.title)
          } else {
            console.log(`Duplicate confession detected: ${confession.title}`)
          }
        }
        
        // If we have fewer unique confessions than requested, generate more
        if (uniqueConfessions.length < count) {
          const additionalCount = count - uniqueConfessions.length
          const additionalConfessions = await this.generateTopicConfessions(topic, additionalCount, [...existingConfessions, ...uniqueConfessions])
          uniqueConfessions.push(...additionalConfessions)
        }
        
        return uniqueConfessions.slice(0, count)
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
        console.error('Raw response:', response)
        console.error('Cleaned response:', cleanedResponse)
        
        // Try to return fallback content
        return [{
          title: `Powerful ${topic} Declaration`,
          confession_text: `I declare that I am walking in the fullness of ${topic} and experiencing God's goodness in every area of my life.`,
          theme: topic.toLowerCase()
        }]
      }
    } catch (error) {
      console.error(`Error generating confessions for topic ${topic}:`, error)
      throw new Error(`Failed to generate confessions for topic`)
    }
  }

  // Generate complete daily content (verse + confession)
  async generateDailyContent() {
    try {
      console.log('🎯 Starting complete daily content generation...')
      
      // Generate verse first
      console.log('📖 Generating daily verse...')
      const verseData = await this.generateDailyVerse()
      console.log('✅ Daily verse generated:', verseData.reference)
      
      // Generate confession based on the verse
      console.log('🙏 Generating confession for verse...')
      const confessionData = await this.generateConfessionForVerse(verseData)
      console.log('✅ Confession generated:', confessionData.title)
      
      const result = {
        verse: verseData,
        confession: confessionData,
        theme: verseData.theme
      }
      
      console.log('🎉 Complete daily content generated successfully')
      return result
    } catch (error) {
      console.error('❌ Error generating daily content:', error)
      throw error
    }
  }

  // Get a random free model for better reliability
  getRandomFreeModel() {
    const randomIndex = Math.floor(Math.random() * this.freeModels.length)
    return this.freeModels[randomIndex]
  }

  // Helper method to clean JSON response from AI
  cleanJsonResponse(response) {
    // Remove markdown code blocks if present
    let cleaned = response.trim()
    
    // Remove ```json and ``` markers
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '')
    }
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '')
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.replace(/\s*```$/, '')
    }
    
    // Additional cleaning for common JSON issues
    cleaned = cleaned.trim()
    
    // Try to find the JSON array/object in the response
    const jsonMatch = cleaned.match(/\[[\s\S]*\]|{[\s\S]*}/)
    if (jsonMatch) {
      cleaned = jsonMatch[0]
    }
    
    // Fix common JSON issues
    // Fix unquoted translation values (e.g., "translation": NIV -> "translation": "NIV")
    cleaned = cleaned.replace(/"translation":\s*([A-Z0-9]+)(?=\s*[,}])/g, '"translation": "$1"')
    
    // Fix other unquoted string values that should be quoted
    cleaned = cleaned.replace(/"book":\s*([A-Za-z0-9\s]+)(?=\s*[,}])/g, '"book": "$1"')
    cleaned = cleaned.replace(/"reference":\s*([A-Za-z0-9\s:]+)(?=\s*[,}])/g, '"reference": "$1"')
    
    // Handle incomplete JSON by finding the last complete object
    if (cleaned.includes('"verse_text"') && !cleaned.endsWith('}') && !cleaned.endsWith(']')) {
      // Find the last complete object
      const objects = cleaned.match(/\{[^{}]*"verse_text"[^{}]*\}/g)
      if (objects && objects.length > 0) {
        // Return only the complete objects as an array
        cleaned = '[' + objects.join(',') + ']'
      }
    }
    
    return cleaned.trim()
  }

  // Call OpenRouter API with free models
  async callOpenRouter(prompt, model = null, retryCount = 0) {
    try {
      console.log('🔑 API Key check:', {
        hasApiKey: !!this.apiKey,
        apiKeyLength: this.apiKey ? this.apiKey.length : 0,
        apiKeyStart: this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'none'
      })
      
      if (!this.apiKey) {
        throw new Error('OpenRouter API key not configured. Please set VITE_OPENROUTER_API_KEY or REACT_APP_OPENROUTER_API_KEY in your environment variables.')
      }

      // Use specified model, random model for variety, or default model
      const selectedModel = model || this.getRandomModel() || this.model

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'SpeakLife AI Generation'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that generates Christian spiritual content including Bible verses, confessions, and declarations. Always provide responses in valid JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.8 + Math.random() * 0.2, // Random temperature between 0.8-1.0 for more creativity
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        })
      })

      console.log('📡 API Response status:', response.status)

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429 && retryCount < 3) {
          const retryAfter = response.headers.get('Retry-After')
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, retryCount) * 1000 // Exponential backoff
          
          console.log(`Rate limited, retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          return this.callOpenRouter(prompt, model, retryCount + 1)
        }
        
        const errorText = await response.text()
        console.error('❌ API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        })
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('OpenRouter API call failed:', error)
      throw error
    }
  }

  // Fallback content when AI is not available
  getFallbackContent() {
    const fallbackVerses = [
      {
        verse_text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
        reference: "Jeremiah 29:11",
        book: "Jeremiah",
        chapter: 29,
        verse: 11,
        translation: "NIV",
        explanation: "God has wonderful plans for your life, filled with hope and purpose.",
        theme: "hope"
      },
      {
        verse_text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
        reference: "Romans 8:28",
        book: "Romans",
        chapter: 8,
        verse: 28,
        translation: "NIV",
        explanation: "God works all things together for your good, even in difficult times.",
        theme: "faith"
      },
      {
        verse_text: "I can do all this through him who gives me strength.",
        reference: "Philippians 4:13",
        book: "Philippians",
        chapter: 4,
        verse: 13,
        translation: "NIV",
        explanation: "With God's strength, you can overcome any challenge.",
        theme: "strength"
      }
    ]

    const randomVerse = fallbackVerses[Math.floor(Math.random() * fallbackVerses.length)]
    
    // Generate confession that aligns with the specific verse
    let alignedConfession
    if (randomVerse.reference === "Jeremiah 29:11") {
      alignedConfession = {
        title: "Declaration of Divine Plans",
        confession_text: "I declare that God's plans for me are good, filled with hope and a prosperous future."
      }
    } else if (randomVerse.reference === "Romans 8:28") {
      alignedConfession = {
        title: "Confession of Divine Purpose",
        confession_text: "I believe that God is working all things together for my good according to His purpose."
      }
    } else if (randomVerse.reference === "Philippians 4:13") {
      alignedConfession = {
        title: "Declaration of Divine Strength",
        confession_text: "I confess that Christ gives me strength to do all things through His power."
      }
    } else {
      // Fallback
      alignedConfession = {
        title: "Declaration of Faith",
        confession_text: "I declare that God's promises are true and I walk in His divine purpose."
      }
    }

    return {
      verse: randomVerse,
      confession: alignedConfession,
      theme: randomVerse.theme
    }
  }

  // Test AI connection
  async testAIConnection() {
    try {
      const response = await this.callOpenRouter('Generate a simple Bible verse about love. Format as JSON with verse_text, reference, book, chapter, verse fields.')
      const parsed = JSON.parse(this.cleanJsonResponse(response))
      return { success: true, data: parsed }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

const aiGenerationService = new AIGenerationService()
export default aiGenerationService
