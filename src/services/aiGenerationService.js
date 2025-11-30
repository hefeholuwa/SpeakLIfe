import { supabase } from '../supabaseClient.jsx'

class AIGenerationService {
  constructor() {
    // Use import.meta.env for Vite or fallback to process.env for Vercel
    this.apiKey = import.meta.env?.VITE_OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || ''
    this.baseURL = 'https://openrouter.ai/api/v1'
    this.model = 'x-ai/grok-4.1-fast:free' // Grok 4.1 Fast Free
    this.freeModels = [
      'x-ai/grok-4.1-fast:free',
      'deepseek/deepseek-r1-distill-llama-70b:free', // Fallback
      'meta-llama/llama-3.3-70b-instruct:free' // Fallback
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
      // Enhanced validation
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        console.log('Invalid content for duplicate check:', { content, type: typeof content })
        return false
      }

      // Clean the content
      const cleanContent = content.trim()
      if (cleanContent.length < 10) {
        console.log('Content too short for duplicate check')
        return false
      }

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
          console.log('Invalid type for duplicate check:', contentType)
          return false
      }

      console.log(`🔍 Checking for duplicates in ${tableName}.${fieldName}`)

      // Check for exact matches first
      const { data: exactMatches, error: exactError } = await supabase
        .from(tableName)
        .select(fieldName)
        .eq(fieldName, cleanContent)

      if (exactError) {
        console.error('Error checking exact duplicates:', exactError)
        return false
      }

      if (exactMatches && exactMatches.length > 0) {
        console.log('🔍 Exact duplicate found:', exactMatches.length, 'matches')
        return true
      }

      // Check for similar content (first 50 characters for better detection)
      const contentStart = cleanContent.substring(0, 50).trim()
      if (contentStart.length < 15) {
        console.log('Content start too short for similarity check')
        return false
      }

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
        console.log('Similar content preview:', similarMatches[0][fieldName]?.substring(0, 50))
        return true
      }

      console.log('✅ No duplicates found, content is unique')
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

      // Get recently used verses to avoid duplicates
      const recentVerses = Array.from(this.usedVerses).slice(-10) // Last 10 used verses
      const recentVersesText = recentVerses.length > 0 ? `\n\nAVOID THESE RECENT VERSES (already used): ${recentVerses.join(', ')}` : ''

      const basePrompt = `You are a wise spiritual mentor and Bible scholar. Generate a DEEPLY SPIRITUAL and RELEVANT Bible verse for today's daily devotion.
      
      USER CONTEXT:
      - The user may be seeking guidance, comfort, strength, or a reminder of God's love.
      - The verse should speak to the human condition and offer divine perspective.
      - Avoid random selections; choose a verse that carries weight and transformative power.

      CRITICAL: You must provide the EXACT text of a REAL Bible verse, not a confession or interpretation.

      REQUIREMENTS:
      - Choose ONE verse from this DIVERSE list of powerful verses (avoid common ones like John 3:16, Philippians 4:13):
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
      - Use ONLY the ${randomTranslation} translation
      - Provide the EXACT verse text as it appears in that translation
      - Do NOT paraphrase, interpret, or create confessions
      - Focus on theme: "${randomTheme}" - ensure the verse truly embodies this theme
      - Choose a verse that has NOT been used recently${recentVersesText}
      
      EXAMPLES OF ACCURATE VERSES IN DIFFERENT TRANSLATIONS:
      - KJV: "For my thoughts are not your thoughts, neither are your ways my ways, saith the Lord."
      - NIV: "For my thoughts are not your thoughts, neither are your ways my ways, declares the Lord."
      - ESV: "For my thoughts are not your thoughts, neither are your ways my ways, declares the Lord."
      - NLT: "My thoughts are nothing like your thoughts, says the Lord. And my ways are far beyond anything you could imagine."
      - AMP: "For My thoughts are not your thoughts, nor are your ways My ways, declares the Lord."
      - NKJV: "For My thoughts are not your thoughts, nor are your ways My ways, says the Lord."
      
      CRITICAL: You MUST include the translation field in your response. The translation field is REQUIRED and must be exactly "${randomTranslation}".
      
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

      const recentConfessions = Array.from(this.usedConfessions).slice(-10)
      const recentConfessionsText = recentConfessions.length > 0 ? `\n\nAVOID THESE RECENT THEMES/STYLES (already used): ${recentConfessions.join(', ')}` : ''

      const prompt = `CRITICAL: Generate a UNIQUE, DEEPLY PERSONAL confession that applies the spiritual truth of this verse to the user's life: "${verseData.verse_text}" (${verseData.reference})

      USER NEEDS & CONTEXT:
      - The user wants to internalize this scripture to transform their mindset and reality.
      - The confession should bridge the gap between ancient scripture and modern daily life.
      - It should feel like a "soul anchor" - something they can repeat to find peace, strength, or direction.

      STRICT ALIGNMENT RULE:
      - The confession MUST be derived 100% from the content and meaning of this specific verse.
      - Do NOT generate a generic Christian confession. It must be specific to this scripture.
      - Use KEYWORDS and PHRASES from the verse itself in the confession.
      - If the verse says "The Lord is my shepherd", the confession MUST say "The Lord is MY shepherd".
      - If the verse says "By his stripes we are healed", the confession MUST say "By His stripes I AM healed".
      
      TRANSFORMATION PROCESS:
      1. Read the verse carefully: "${verseData.verse_text}"
      2. Identify the core promise, truth, or command.
      3. Ask: "How does this truth solve a human problem (fear, lack, confusion)?"
      4. Rewrite that truth as a first-person present-tense declaration ("I am...", "I have...", "I believe...").
      5. Ensure the tone matches the ${randomStyle} style.

      EXAMPLES OF PERFECT ALIGNMENT:
      - Verse: "The Lord is my light and my salvation; whom shall I fear?" (Psalm 27:1)
      -> Confession: "I declare that because the Lord is MY light and MY salvation, I am liberated from all fear and darkness."
      
      - Verse: "My God shall supply all your need according to his riches in glory." (Phil 4:19)
      -> Confession: "I confess that God is actively supplying all MY needs according to His limitless riches in glory by Christ Jesus."

      REQUIREMENTS:
      - 1-2 sentences maximum.
      - Must be personal ("I", "My", "Me").
      - Must be powerful, faith-filled, and authoritative.
      - AVOID generic phrases like "I love God" unless the verse is specifically about loving God.
      - Create something UNIQUE that hasn't been used recently${recentConfessionsText}
      
      FORMAT: Return as JSON with fields: confession_text, theme, style`

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

      USER NEEDS & EMOTIONAL CONTEXT:
      - Users exploring the topic "${topic}" are likely seeking specific spiritual answers, comfort, or empowerment.
      - Select verses that address the *root* of the human need associated with "${topic}".
      - Avoid surface-level verses; choose ones that offer deep theological insight or practical spiritual application.

      TOPIC-SPECIFIC FOCUS - MUST MATCH EXACTLY:
      - Each verse MUST directly relate to the spiritual theme of "${topic}"
      - If topic is "Faith" → choose verses that build confidence in God's character during uncertainty (e.g., Hebrews 11:1, Romans 4:20-21).
      - If topic is "Peace" → choose verses that address anxiety, turmoil, and the need for divine rest (e.g., Philippians 4:7, Isaiah 26:3).
      - If topic is "Love" → choose verses about the depth of God's love or the call to sacrificial love (e.g., 1 John 4:19, Romans 5:8).
      - If topic is "Wisdom" → choose verses about divine direction, discernment, and understanding God's will (e.g., James 1:5, Proverbs 3:5-6).
      - If topic is "Prosperity" → choose verses about stewardship, God's provision, and spiritual abundance (e.g., 2 Corinthians 9:8, Philippians 4:19).
      - If topic is "Relationships" → choose verses about unity, forgiveness, and godly conduct in community (e.g., Ephesians 4:2-3, Colossians 3:13).
      - If topic is "Healing" → choose verses about God's power to restore body, soul, and spirit (e.g., Psalm 103:2-3, Jeremiah 30:17).
      - If topic is "Victory" → choose verses about overcoming spiritual battles and standing firm (e.g., Ephesians 6:10-11, Romans 8:37).
      - If topic is "Hope" → choose verses about future glory, endurance, and God's faithfulness (e.g., Lamentations 3:22-23, Romans 15:13).
      - If topic is "Forgiveness" → choose verses about the freedom of letting go and God's mercy (e.g., Psalm 103:12, Micah 7:18-19).
      - DO NOT choose generic verses that could apply to any topic
      - Each verse must be a perfect match for the specific spiritual theme of "${topic}"
      - If you cannot find verses that directly relate to "${topic}", do not generate generic verses
      - REJECT any verse that doesn't directly relate to "${topic}" - be strict about topic matching

      SPIRITUAL DEPTH & DOCTRINAL BALANCE:
      - Choose from diverse biblical books (not just popular ones like John, Psalms)
      - Include books like: Isaiah, Jeremiah, Ezekiel, Daniel, Hosea, Joel, Amos, Obadiah, Jonah, Micah, Nahum, Habakkuk, Zephaniah, Haggai, Zechariah, Malachi, Lamentations, Song of Solomon, Ecclesiastes, Proverbs, Job, Ruth, Esther, Ezra, Nehemiah, Chronicles, Kings, Samuel, Judges, Joshua, Deuteronomy, Numbers, Leviticus, Exodus, Genesis, Acts, Corinthians, Galatians, Ephesians, Philippians, Colossians, Thessalonians, Timothy, Titus, Philemon, Hebrews, James, Peter, John's epistles, Jude, Revelation
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

        // Return what we got from the API call (no recursive generation to avoid duplicates)
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

      USER NEEDS & TRANSFORMATIONAL GOAL:
      - The goal is to help the user SHIFT their mindset and spiritual reality regarding "${topic}".
      - Address the specific pain points or desires associated with "${topic}" (e.g., fear, loneliness, lack, confusion).
      - The confession should feel like a spiritual weapon or a comforting embrace.

      TOPIC-SPECIFIC ALIGNMENT - MUST MATCH EXACTLY:
      - Each confession must DIRECTLY relate to the specific spiritual theme of "${topic}"
      - If topic is "Faith" → confessions should replace doubt with unshakeable confidence (e.g., "I declare that my faith is an anchor in the storm, holding me steady in God's promises").
      - If topic is "Peace" → confessions should silence internal noise and anxiety (e.g., "I release all anxiety and receive the supernatural peace of God that surpasses all understanding").
      - If topic is "Love" → confessions should affirm self-worth and the capacity to love others (e.g., "I am securely rooted in God's love, and I overflow with compassion for those around me").
      - If topic is "Wisdom" → confessions should claim clarity and divine direction (e.g., "I possess the mind of Christ, and I make decisions with clarity and divine insight").
      - If topic is "Prosperity" → confessions should align with stewardship and trust in God's provision (e.g., "I am a faithful steward, and God's abundance flows through me to bless others").
      - If topic is "Relationships" → confessions should speak life into connections and unity (e.g., "I cultivate healthy, God-honoring relationships that bring life and encouragement").
      - If topic is "Healing" → confessions should enforce the reality of restoration (e.g., "Every cell in my body aligns with the healing power of God's Word").
      - If topic is "Victory" → confessions should declare triumph over specific struggles (e.g., "I stand in victory, for the One in me is greater than any challenge I face").
      - If topic is "Hope" → confessions should reignite expectation for the future (e.g., "I look forward with joyful expectation, knowing God's plans for me are good").
      - If topic is "Forgiveness" → confessions should release the weight of bitterness (e.g., "I choose to forgive freely, releasing all bitterness and walking in the freedom of grace").
      - DO NOT create generic confessions that could apply to any topic
      - Each confession must be a personal declaration of the topic's specific spiritual truth
      - Make each confession laser-focused on the exact spiritual theme of "${topic}"
      - If you cannot create confessions that directly relate to "${topic}", do not generate generic confessions
      - REJECT any confession that doesn't directly relate to "${topic}" - be strict about topic matching

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
      - CRITICAL: You MUST provide a valid Bible verse reference (Book Chapter:Verse) AND the full text of that verse.
      ${existingConfessionsList}
      
      IMPORTANT: Return ONLY valid JSON. Do not include any markdown formatting, explanations, or additional text. Just the JSON array.
      
      FORMAT: Return as JSON array:
      [
        {
          "title": "Powerful confession title",
          "confession_text": "Short, spiritually profound confession/declaration text",
          "reference": "Book Chapter:Verse (e.g., Philippians 4:13)",
          "verse_text": "The full text of the bible verse..."
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
            console.log(`Duplicate confession detected: ${confession.title} `)
          }
        }

        // Return what we got from the API call (no recursive generation to avoid duplicates)
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

      // Validate verse data
      if (!verseData || !verseData.verse_text || !verseData.reference) {
        console.error('❌ Invalid verse data generated:', verseData)
        throw new Error('Failed to generate valid verse data')
      }

      console.log('✅ Daily verse generated:', verseData.reference)

      // Generate confession based on the verse
      console.log('🙏 Generating confession for verse...')
      const confessionData = await this.generateConfessionForVerse(verseData)

      // Validate confession data
      if (!confessionData || !confessionData.confession_text) {
        console.error('❌ Invalid confession data generated:', confessionData)
        throw new Error('Failed to generate valid confession data')
      }

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
    const jsonArrayMatch = cleaned.match(/\[[\s\S]*\]/)
    const jsonObjectMatch = cleaned.match(/\{[\s\S]*\}/)

    if (jsonArrayMatch) {
      cleaned = jsonArrayMatch[0]
    } else if (jsonObjectMatch) {
      cleaned = jsonObjectMatch[0]
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

  // Get random model for variety
  getRandomModel() {
    // Return any available free model
    return this.freeModels[Math.floor(Math.random() * this.freeModels.length)]
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

      // Use specified model or default model (Grok)
      // We prioritize the default model as requested by the user
      const selectedModel = model || this.model

      console.log('📡 Making API call to OpenRouter...', {
        model: selectedModel,
        promptLength: prompt.length,
        apiKeyLength: this.apiKey.length
      })

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

      console.log('📡 API call completed, processing response...')

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
      console.log('🤖 AI Response received:', {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length || 0,
        hasContent: !!data.choices?.[0]?.message?.content,
        contentLength: data.choices?.[0]?.message?.content?.length || 0
      })

      const content = data.choices[0].message.content
      console.log('📝 Raw AI content:', content.substring(0, 200) + '...')

      return content
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

  /**
   * Generate a complete reading plan based on a topic
   * @param {string} topic - The topic or theme for the reading plan
   * @param {number} duration - Number of days (default 7)
   * @returns {Promise<Object>} - The generated plan with days
   */
  async generateReadingPlan(topic, duration = 7) {
    try {
      console.log(`🤖 Generating ${duration}-day reading plan for: ${topic}`)

      // Bible book data for smart prompting
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
        'ecclesiastes': 'Ecclesiastes', 'songofsolomon': 'Song of Solomon', 'isaiah': 'Isaiah', 'jeremiah': 'Jeremiah', 'lamentations': 'Lamentations',
        'ezekiel': 'Ezekiel', 'daniel': 'Daniel', 'hosea': 'Hosea', 'joel': 'Joel', 'amos': 'Amos',
        'obadiah': 1, 'jonah': 'Jonah', 'micah': 'Micah', 'nahum': 'Nahum', 'habakkuk': 'Habakkuk',
        'zephaniah': 'Zephaniah', 'haggai': 'Haggai', 'zechariah': 'Zechariah', 'malachi': 'Malachi',
        'matthew': 'Matthew', 'mark': 'Mark', 'luke': 'Luke', 'john': 'John', 'acts': 'Acts',
        'romans': 'Romans', '1corinthians': '1 Corinthians', '2corinthians': '2 Corinthians', 'galatians': 'Galatians', 'ephesians': 'Ephesians',
        'philippians': 'Philippians', 'colossians': 'Colossians', '1thessalonians': '1 Thessalonians', '2thessalonians': '2 Thessalonians',
        '1timothy': '1 Timothy', '2timothy': '2 Timothy', 'titus': 'Titus', 'philemon': 'Philemon', 'hebrews': 'Hebrews',
        'james': 'James', '1peter': '1 Peter', '2peter': '2 Peter', '1john': '1 John', '2john': '2 John',
        '3john': '3 John', 'jude': 'Jude', 'revelation': 'Revelation'
      }

      // Helper to normalize book names
      const normalizeBookName = (input) => {
        return input.toLowerCase()
          .replace(/the /g, '')
          .replace(/book of /g, '')
          .replace(/gospel of /g, '')
          .replace(/epistle of /g, '')
          .replace(/first /g, '1')
          .replace(/second /g, '2')
          .replace(/third /g, '3')
          .replace(/\s+/g, '') // Remove all spaces: "1 john" -> "1john"
          .trim()
      }

      // Detect if topic is a book by checking if any book name is contained in the topic
      const normalizedTopic = normalizeBookName(topic)

      // Sort books by length (descending) so we match "1john" before "john"
      const sortedBooks = Object.keys(bookChapterCounts).sort((a, b) => b.length - a.length)
      const matchedBook = sortedBooks.find(book => normalizedTopic.includes(book))

      const isBookStudy = !!matchedBook
      const totalChapters = isBookStudy ? bookChapterCounts[matchedBook] : 0

      console.log(`📚 Book Study Check: "${topic}" -> "${normalizedTopic}" (Matched: ${matchedBook}, Chapters: ${totalChapters})`)

      let prompt = ''
      let preDefinedSchedule = []

      if (isBookStudy) {
        // Deterministic Schedule Calculation
        const ratio = totalChapters / duration
        let currentChapter = 1

        for (let day = 1; day <= duration; day++) {
          let targetEndChapter = Math.round(day * ratio)

          // Clamp to total chapters
          if (targetEndChapter > totalChapters) targetEndChapter = totalChapters

          let endChapter = targetEndChapter

          // If we are "squeezing" (duration < chapters), ensure we move forward
          if (endChapter < currentChapter) {
            endChapter = currentChapter
          }

          // If we run out of chapters (duration > chapters), clamp to max
          if (currentChapter > totalChapters) {
            currentChapter = totalChapters
            endChapter = totalChapters
          }

          const start = currentChapter
          const end = endChapter

          let ref = ''
          const bookName = bookNameMap[matchedBook] || topic

          if (start === end) {
            ref = `${bookName} ${start}`
          } else {
            ref = `${bookName} ${start}-${end}`
          }

          preDefinedSchedule.push({
            day_number: day,
            reading_reference: ref
          })

          currentChapter = end + 1
        }

        console.log('📅 Calculated Schedule:', preDefinedSchedule)

        prompt = `
          I have a specific Bible reading schedule for the "${topic}".
          
          Here is the schedule you MUST use for context:
          ${JSON.stringify(preDefinedSchedule, null, 2)}

          Your task is to generate the metadata and devotional content for this schedule.

          Return ONLY a valid JSON object with this structure:
          {
            "title": "A catchy title for this study",
            "description": "An inspiring description...",
            "duration_days": ${duration},
            "image_gradient": "from-blue-500 to-cyan-500",
            "days": [
              {
                "day_number": 1,
                "devotional_content": "A short, encouraging devotional thought (2-3 sentences) specific to the reading for this day."
              }
              // ... for all ${duration} days
            ]
          }
          `
      } else {
        // Thematic Plan (Original Logic)
        prompt = `
          Create a ${duration}-day Bible reading plan on the topic: "${topic}".
          
          The plan should be structured, spiritually enriching, and suitable for a mobile app.
          
          Return ONLY a valid JSON object with this exact structure:
          {
            "title": "A catchy, short title for the plan",
            "description": "A 2-3 sentence inspiring description...",
            "duration_days": ${duration},
            "image_gradient": "from-blue-500 to-cyan-500",
            "days": [
              {
                "day_number": 1,
                "reading_reference": "Book Chapter:Verse-Verse",
                "devotional_content": "A short, encouraging devotional thought (2-3 sentences) related to this reading."
              }
              // ... for all ${duration} days
            ]
          }

          Rules:
          1. "reading_reference" must be a valid standard Bible reference.
          2. Do NOT include any explanation or text outside the JSON.
          3. Ensure the readings are relevant to the topic.
          4. Vary the books (OT and NT) if appropriate for the topic.
          `
      }

      const response = await this.callOpenRouter(prompt)

      // Parse the response
      let planData
      try {
        // Clean up markdown code blocks if present
        const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim()
        planData = JSON.parse(cleanJson)
      } catch (e) {
        console.error('Failed to parse AI response:', response)
        throw new Error('AI returned invalid JSON format')
      }

      // Validate structure
      if (!planData.title || !planData.days || !Array.isArray(planData.days)) {
        throw new Error('AI returned incomplete plan structure')
      }

      // If it was a book study, FORCE the correct references back into the plan
      if (isBookStudy && preDefinedSchedule.length > 0) {
        console.log('🔄 Merging deterministic schedule with AI content...')

        // Use the deterministic schedule as the MASTER list
        const mergedDays = preDefinedSchedule.map((scheduleItem, index) => {
          // Try to find matching content from AI, or fallback to index
          const aiDay = planData.days.find(d => d.day_number === scheduleItem.day_number) || planData.days[index]

          return {
            day_number: scheduleItem.day_number,
            reading_reference: scheduleItem.reading_reference,
            // Use AI content if available, otherwise generic fallback
            devotional_content: aiDay?.devotional_content || `Reflect on God's word in ${scheduleItem.reading_reference} today.`
          }
        })

        planData.days = mergedDays
        planData.duration_days = preDefinedSchedule.length
      }

      return planData

    } catch (error) {
      console.error('Error generating reading plan:', error)
      throw error
    }
  }
}

const aiGenerationService = new AIGenerationService()
export default aiGenerationService
