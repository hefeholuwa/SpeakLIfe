import { supabase } from '../supabaseClient.jsx'

class AIGenerationService {
  constructor() {
    // Use import.meta.env for Vite or fallback to empty string
    this.apiKey = import.meta.env?.VITE_OPENROUTER_API_KEY || import.meta.env?.REACT_APP_OPENROUTER_API_KEY || ''
    this.baseURL = 'https://openrouter.ai/api/v1'
    this.model = 'mistralai/mixtral-8x7b-instruct' // BEST FREE model - outperforms GPT-3.5
    this.freeModels = [
      'mistralai/mixtral-8x7b-instruct', // BEST FREE - Outperforms Llama 2 70B, 6x faster
      'meta-llama/llama-3.1-8b-instruct', // EXCELLENT - Strong reasoning, 128K context
      'deepseek/deepseek-chat', // VERY GOOD - Strong reasoning, 128K context
      'google/gemini-flash-1.5', // GOOD - 1M token context, multimodal
      'microsoft/phi-3-mini-4k-instruct', // GOOD - Microsoft's efficient model
      'meta-llama/llama-3.2-3b-instruct', // GOOD - Meta's efficient model
      'google/gemma-2-9b-it', // GOOD - Google's lightweight model
      'qwen/qwen-2.5-7b-instruct' // GOOD - Alibaba's multilingual model
    ]
  }

  // Generate daily verse with AI
  async generateDailyVerse() {
    try {
      const themes = [
        'faith and trust in God', 'divine love and grace', 'spiritual warfare and victory', 
        'prayer and communion', 'hope and restoration', 'wisdom and understanding',
        'peace and comfort', 'strength and endurance', 'salvation and redemption',
        'holiness and sanctification', 'worship and praise', 'servanthood and humility',
        'forgiveness and mercy', 'courage and boldness', 'joy and gladness',
        'perseverance and patience', 'divine protection', 'spiritual growth',
        'kingdom principles', 'eternal perspective', 'divine purpose', 'spiritual authority'
      ]
      
      const randomTheme = themes[Math.floor(Math.random() * themes.length)]
      
      const translations = ['KJV', 'NIV', 'ESV', 'NASB', 'NLT', 'NKJV', 'AMP', 'MSG', 'CEV', 'NRSV']
      const randomTranslation = translations[Math.floor(Math.random() * translations.length)]
      
      const prompt = `Generate a spiritually profound Bible verse for today's daily devotion. CRITICAL: You must use REAL, EXISTING Bible verses only. Do not create or make up any verse references.

      SPIRITUAL DEPTH & DOCTRINAL BALANCE:
      - Choose from diverse biblical books (not just popular ones like John, Psalms)
      - Include books like: Isaiah, Jeremiah, Ezekiel, Daniel, Hosea, Joel, Amos, Obadiah, Jonah, Micah, Nahum, Habakkuk, Zephaniah, Haggai, Zechariah, Malachi, Lamentations, Song of Solomon, Ecclesiastes, Proverbs, Job, Ruth, Esther, Ezra, Nehemiah, Chronicles, Kings, Samuel, Judges, Joshua, Deuteronomy, Numbers, Leviticus, Exodus, Genesis, Acts, Corinthians, Galatians, Ephesians, Philippians, Colossians, Thessalonians, Timothy, Titus, Philemon, Hebrews, James, Peter, John's epistles, Jude, Revelation
      - Focus on the theme: "${randomTheme}"
      - Ensure doctrinal balance and spiritual depth
      - Avoid only well-known verses - include lesser-known but powerful scriptures
      - Use the ${randomTranslation} translation for the verse text
      
      CRITICAL REQUIREMENTS:
      - MUST use REAL, EXISTING Bible verse references only
      - Do NOT create or invent any verse references
      - Provide exact verse text as it appears in the ${randomTranslation} Bible
      - Include complete reference (e.g., "Isaiah 43:2", "Hebrews 11:1")
      - Specify book name, chapter number, and verse number
      - Ensure the verse is encouraging, faith-building, and spiritually enriching
      
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
      
      FORMAT: Return as JSON with fields: verse_text, reference, book, chapter, verse, translation, theme
      
      Example: {"verse_text": "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.", "reference": "Isaiah 40:31", "book": "Isaiah", "chapter": 40, "verse": 31, "translation": "KJV", "theme": "strength and endurance"}`

      const response = await this.callOpenRouter(prompt)
      return JSON.parse(response)
    } catch (error) {
      console.error('Error generating daily verse:', error)
      throw new Error('Failed to generate daily verse')
    }
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
      
      const randomStyle = confessionStyles[Math.floor(Math.random() * confessionStyles.length)]
      
      const prompt = `Based on this Bible verse: "${verseData.verse_text}" (${verseData.reference}), generate a short, powerful spiritual confession/declaration that:

      SPIRITUAL DEPTH & DOCTRINAL BALANCE:
      - Create a ${randomStyle} that aligns with the verse
      - Ensure doctrinal soundness and biblical accuracy
      - Include spiritual warfare elements, kingdom principles, and divine promises
      - Make it personal, powerful, and faith-building
      - Use spiritual language that resonates with believers
      - Include elements of: divine identity, spiritual authority, kingdom inheritance, prophetic declaration
      - Avoid generic or cliché confessions - create something unique and powerful
      
      CONFESSION REQUIREMENTS:
      - Keep it SHORT: 1-2 sentences maximum (not a paragraph)
      - Include "I declare", "I confess", "I believe", or similar powerful language
      - Connect to the verse's theme while expanding on spiritual truths
      - Make it applicable to daily Christian walk
      - Include elements of faith, hope, victory, and spiritual authority
      - Sound spiritual but concise - not lengthy or verbose
      
      FORMAT: Return as JSON:
      {
        "title": "Powerful confession title (e.g., 'Declaration of Divine Authority', 'Confession of Kingdom Inheritance')",
        "confession_text": "Short, spiritually profound confession/declaration text (1-2 sentences only)",
        "theme": "Theme that matches the verse theme",
        "style": "${randomStyle}"
      }`

      const response = await this.callOpenRouter(prompt)
      return JSON.parse(response)
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
      return JSON.parse(response)
    } catch (error) {
      console.error(`Error generating ${contentType} for topic ${topic}:`, error)
      throw new Error(`Failed to generate ${contentType} for topic`)
    }
  }

  // Generate multiple verses for a topic
  async generateTopicVerses(topic, count = 3) {
    try {
      const translations = ['KJV', 'NIV', 'ESV', 'NASB', 'NLT', 'NKJV', 'AMP', 'MSG', 'CEV', 'NRSV']
      
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
      
      FORMAT: Return as JSON array:
      [
        {
          "verse_text": "Exact verse text from the specified translation",
          "reference": "Book Chapter:Verse",
          "book": "Book name",
          "chapter": chapter_number,
          "verse": verse_number,
          "translation": "Bible translation used (e.g., KJV, NIV, ESV, etc.)",
          "explanation": "Brief explanation of relevance to ${topic}"
        }
      ]`

      const response = await this.callOpenRouter(prompt)
      return JSON.parse(response)
    } catch (error) {
      console.error(`Error generating verses for topic ${topic}:`, error)
      throw new Error(`Failed to generate verses for topic`)
    }
  }

  // Generate multiple confessions for a topic
  async generateTopicConfessions(topic, count = 3) {
    try {
      const confessionTypes = [
        'prophetic declaration', 'spiritual warfare confession', 'kingdom identity',
        'divine inheritance', 'healing and restoration', 'victory and triumph',
        'spiritual authority', 'divine protection', 'spiritual breakthrough',
        'faith declaration', 'hope proclamation', 'love manifestation'
      ]
      
      const prompt = `Generate ${count} different short, powerful spiritual confessions/declarations specifically for the topic "${topic}". Requirements:

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
      
      FORMAT: Return as JSON array:
      [
        {
          "title": "Powerful confession title (e.g., 'Declaration of Divine Authority', 'Confession of Kingdom Inheritance')",
          "confession_text": "Short, spiritually profound confession/declaration text (1-2 sentences only)"
        }
      ]`

      const response = await this.callOpenRouter(prompt)
      return JSON.parse(response)
    } catch (error) {
      console.error(`Error generating confessions for topic ${topic}:`, error)
      throw new Error(`Failed to generate confessions for topic`)
    }
  }

  // Generate complete daily content (verse + confession)
  async generateDailyContent() {
    try {
      console.log('🤖 Generating daily content with AI...')
      
      // Generate verse first
      const verseData = await this.generateDailyVerse()
      console.log('✅ Generated verse:', verseData.reference)
      
      // Generate confession based on the verse
      const confessionData = await this.generateConfessionForVerse(verseData)
      console.log('✅ Generated confession:', confessionData.title)
      
      return {
        verse: verseData,
        confession: confessionData,
        theme: verseData.theme
      }
    } catch (error) {
      console.error('Error generating daily content:', error)
      throw error
    }
  }

  // Get a random free model for better reliability
  getRandomFreeModel() {
    const randomIndex = Math.floor(Math.random() * this.freeModels.length)
    return this.freeModels[randomIndex]
  }

  // Call OpenRouter API with free models
  async callOpenRouter(prompt, model = null) {
    try {
      if (!this.apiKey) {
        throw new Error('OpenRouter API key not configured. Please set VITE_OPENROUTER_API_KEY or REACT_APP_OPENROUTER_API_KEY in your environment variables.')
      }

      // Use specified model, default model, or random free model
      const selectedModel = model || this.model || this.getRandomFreeModel()

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
          max_tokens: 1000,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
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

    const fallbackConfessions = [
      {
        title: "Declaration of Hope",
        confession_text: "I declare that God's plans for me are good, and I walk in divine expectation."
      },
      {
        title: "Confession of Faith",
        confession_text: "I believe God is working all things for my good, and I trust His perfect timing."
      },
      {
        title: "Declaration of Strength",
        confession_text: "I confess that Christ strengthens me, and I am empowered for every challenge."
      }
    ]

    const randomVerse = fallbackVerses[Math.floor(Math.random() * fallbackVerses.length)]
    const randomConfession = fallbackConfessions[Math.floor(Math.random() * fallbackConfessions.length)]

    return {
      verse: randomVerse,
      confession: randomConfession,
      theme: randomVerse.theme
    }
  }

  // Test AI connection
  async testAIConnection() {
    try {
      const response = await this.callOpenRouter('Generate a simple Bible verse about love. Format as JSON with verse_text, reference, book, chapter, verse fields.')
      const parsed = JSON.parse(response)
      return { success: true, data: parsed }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

const aiGenerationService = new AIGenerationService()
export default aiGenerationService
