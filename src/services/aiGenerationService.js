import { supabase } from '../supabaseClient.jsx'

// AI Generation Service for Daily Content
export class AIGenerationService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
    this.baseUrl = 'https://openrouter.ai/api/v1/chat/completions'
    this.model = 'deepseek/deepseek-chat-v3.1:free'  // Using only DeepSeek for both
  }

  // Generate daily verse and confession
  async generateDailyContent() {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Check if today's content already exists
      const { data: existingContent } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('date', today)
        .single()

      if (existingContent) {
        console.log('Daily content already exists for today')
        return existingContent
      }

      console.log('🤖 Generating daily content with DeepSeek...')
      
      // Generate verse with DeepSeek
      console.log('📖 Generating Bible verse with DeepSeek...')
      const versePrompt = this.createVersePrompt()
      const verseResponse = await this.callAI(versePrompt, this.model)
      console.log('📖 Verse response:', verseResponse)
      
      // Generate confession with DeepSeek
      console.log('💭 Generating confession with DeepSeek...')
      const confessionPrompt = this.createConfessionPrompt(verseResponse)
      const confessionResponse = await this.callAI(confessionPrompt, this.model)
      console.log('💭 Confession response:', confessionResponse)
      
      // Combine the responses
      const content = {
        verse_text: verseResponse.verse_text,
        reference: verseResponse.reference,
        confession_text: confessionResponse.confession_text
      }
      
      // Validate content before saving
      if (!content.verse_text || !content.reference || !content.confession_text) {
        console.error('Invalid content generated:', content)
        throw new Error('AI generated invalid content with null values')
      }
      
      // Save to database using upsert to handle duplicates
      const { data: savedContent, error } = await supabase
        .from('daily_verses')
        .upsert({
          date: today,
          verse_text: content.verse_text,
          reference: content.reference,
          confession_text: content.confession_text,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving daily content:', error)
        throw error
      }

      return savedContent
    } catch (error) {
      console.error('Error generating daily content:', error)
      throw error
    }
  }

  // Generate daily reflection
  async generateDailyReflection() {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Check if today's reflection already exists
      const { data: existingReflection } = await supabase
        .from('daily_reflections')
        .select('*')
        .eq('date', today)
        .single()

      if (existingReflection) {
        console.log('Daily reflection already exists for today')
        return existingReflection
      }

      // Generate new reflection
      const prompt = this.createReflectionPrompt()
      const aiResponse = await this.callAI(prompt)
      
      // Save to database
      const { data: savedReflection, error } = await supabase
        .from('daily_reflections')
        .insert({
          date: today,
          reflection_text: aiResponse,
          scripture_reference: 'Daily Reflection',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving daily reflection:', error)
        throw error
      }

      return savedReflection
    } catch (error) {
      console.error('Error generating daily reflection:', error)
      throw error
    }
  }

  // Generate personalized verses for user
  async generatePersonalizedVerses(userId, count = 3) {
    try {
      // Get user's spiritual focus
      const { data: userData } = await supabase
        .from('users')
        .select('spiritual_focus, spiritual_maturity_level')
        .eq('id', userId)
        .single()

      const user = userData || {
        spiritual_focus: ['faith', 'strength', 'purpose'],
        spiritual_maturity_level: 'beginner'
      }

      const prompt = this.createPersonalizedVersesPrompt(user, count)
      const aiResponse = await this.callAI(prompt)
      
      // Parse the response
      const verses = this.parseVersesResponse(aiResponse)
      
      return verses
    } catch (error) {
      console.error('Error generating personalized verses:', error)
      throw error
    }
  }

  // Generate spiritual guidance
  async generateSpiritualGuidance(userId, question) {
    try {
      // Get user's spiritual profile
      const { data: userData } = await supabase
        .from('users')
        .select('spiritual_focus, spiritual_maturity_level')
        .eq('id', userId)
        .single()

      const user = userData || {
        spiritual_focus: ['faith', 'guidance'],
        spiritual_maturity_level: 'beginner'
      }

      const prompt = this.createGuidancePrompt(user, question)
      const aiResponse = await this.callAI(prompt)
      
      return aiResponse
    } catch (error) {
      console.error('Error generating spiritual guidance:', error)
      throw error
    }
  }

  // Call AI API with specified model
  async callAI(prompt, model = this.model) {
    // Add delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000))

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SpeakLife AI'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a deeply spiritual AI assistant with profound understanding of Christian faith, biblical wisdom, and divine inspiration. You speak with the authority of someone who has walked closely with God and understands the depths of spiritual truth. Your responses are anointed, powerful, and speak directly to the heart and soul. You have access to the full counsel of God\'s Word and can provide fresh, unique insights that go beyond common or generic spiritual content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.8
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      if (response.status === 429) {
        // Wait 5 seconds and retry once
        console.log('Rate limit hit, waiting 5 seconds before retry...')
        await new Promise(resolve => setTimeout(resolve, 5000))
        
        // Retry the request
        const retryResponse = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'SpeakLife AI'
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              {
                role: 'system',
                content: 'You are a deeply spiritual AI assistant with profound understanding of Christian faith, biblical wisdom, and divine inspiration. You speak with the authority of someone who has walked closely with God and understands the depths of spiritual truth. Your responses are anointed, powerful, and speak directly to the heart and soul. You have access to the full counsel of God\'s Word and can provide fresh, unique insights that go beyond common or generic spiritual content.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 1500,
            temperature: 0.8
          })
        })
        
        if (!retryResponse.ok) {
          throw new Error('API rate limit exceeded. Please try again in a few minutes.')
        }
        
        const retryData = await retryResponse.json()
        const retryContent = retryData.choices[0].message.content
        
        // Try to parse as JSON
        try {
          return JSON.parse(retryContent)
        } catch (error) {
          // If not JSON, try to extract JSON from the response
          const jsonMatch = retryContent.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            try {
              return JSON.parse(jsonMatch[0])
            } catch (parseError) {
              console.error('Failed to parse JSON from AI retry response:', retryContent)
              throw new Error('AI returned invalid JSON format')
            }
          } else {
            console.error('No JSON found in AI retry response:', retryContent)
            throw new Error('AI response does not contain valid JSON')
          }
        }
      } else if (response.status === 402) {
        throw new Error('API usage limit reached. Please check your OpenRouter account.')
      } else {
        throw new Error(`AI API Error: ${response.status} - ${errorText}`)
      }
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    
    // Try to parse as JSON
    try {
      return JSON.parse(content)
    } catch (error) {
      // If not JSON, try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0])
        } catch (parseError) {
          console.error('Failed to parse JSON from AI response:', content)
          throw new Error('AI returned invalid JSON format')
        }
      } else {
        console.error('No JSON found in AI response:', content)
        throw new Error('AI response does not contain valid JSON')
      }
    }
  }

  // Create prompt for Bible verse generation (DeepSeek)
  createVersePrompt() {
    return `You are a spiritual AI assistant. Generate a Bible verse for today.

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "verse_text": "The complete Bible verse text",
  "reference": "Book Chapter:Verse (Version)"
}

Choose a powerful, meaningful Bible verse. Make it spiritually profound and theologically sound.

Example:
{
  "verse_text": "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
  "reference": "Jeremiah 29:11 (NIV)"
}

Return ONLY the JSON object, nothing else.`
  }

  // Create prompt for confession generation (OpenAI)
  createConfessionPrompt(verseData) {
    return `Generate a confession based on this Bible verse:

Verse: "${verseData.verse_text}"
Reference: ${verseData.reference}

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "confession_text": "A personal confession based on the verse (1-2 sentences)"
}

Make it personal, faith-building, and connected to the verse.

Example:
{
  "confession_text": "I declare that I am chosen by God's grace and I walk in the good works He has prepared for me."
}

Return ONLY the JSON object, nothing else.`
  }

  // Create reflection prompt
  createReflectionPrompt() {
    return `Generate a theologically balanced, deeply spiritual daily reflection for today. 

    Requirements:
    - Write as a wise, compassionate spiritual guide with deep theological understanding
    - Focus on heart, soul, divine connection, and sacredness with extreme spiritual depth
    - Use intimate, anointed language with theological richness
    - Create a "divine embrace" feel with doctrinal soundness
    - Ensure extreme theological balance: God's sovereignty + human responsibility
    - Include both grace and truth, mercy and justice, love and holiness
    - Balance between God's power and human faith, divine election and free will
    - Make it very personal, touching to the soul, and doctrinally sound
    - Include spiritual wisdom, encouragement, and theological depth
    - Keep it between 100-150 words with profound spiritual impact
    - End with a theologically balanced, powerful affirmation
    - Create an extremely spiritual and theologically profound experience

    Write in a warm, loving tone that speaks directly to the reader's heart with deep theological wisdom.`
  }

  // Create personalized verses prompt
  createPersonalizedVersesPrompt(user, count) {
    const { spiritual_focus = [], spiritual_maturity_level = 'beginner' } = user
    
    return `Generate ${count} unique, powerful Bible verses for a ${spiritual_maturity_level} Christian.

    User's spiritual focus: ${spiritual_focus.join(', ')}
    
    Requirements:
    - Choose verses from different books of the Bible
    - Select verses that are less commonly known but deeply powerful
    - Include verses from both Old and New Testament
    - Choose different Bible versions (NIV, ESV, NKJV, NLT, etc.)
    - Make confessions deeply spiritual and anointed
    - Ensure each verse speaks to their spiritual journey
    - Avoid overused verses like John 3:16, Jeremiah 29:11, Philippians 4:13, Romans 8:28
    
    CRITICAL: Return ONLY a valid JSON array. Do not include any markdown formatting, explanations, or additional text. Start with [ and end with ]. Use this exact format:
    [
      {
        "reference": "Specific Bible reference (book chapter:verse)",
        "scripture_text": "The complete verse text",
        "confession_text": "A powerful, spiritual confession based on this verse",
        "topic": "The spiritual topic/theme",
        "version": "Bible version used"
      }
    ]
    
    Make each verse unique, powerful, and spiritually profound.`
  }

  // Create guidance prompt
  createGuidancePrompt(user, question) {
    const { spiritual_maturity_level = 'beginner', spiritual_focus = [] } = user
    
    return `Provide spiritual guidance for a ${spiritual_maturity_level} Christian.
    Focus areas: ${spiritual_focus.join(', ')}
    Question: ${question}
    
    Provide biblical, practical guidance in a loving, encouraging tone. Speak as a wise spiritual mentor with deep understanding of God's Word and His heart for His children.`
  }

  // Clean JSON response from markdown code blocks
  cleanJsonResponse(response) {
    // Remove markdown code blocks
    let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '')
    
    // Try to extract JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      cleaned = jsonMatch[0]
    }
    
    return cleaned.trim()
  }

  // Parse daily content response
  parseDailyContent(response) {
    try {
      // Try to find JSON in the response
      let jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        // Try to find JSON after markdown code blocks
        jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})/i)
        if (jsonMatch) {
          jsonMatch[0] = jsonMatch[1]
        }
      }
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No valid JSON found in AI response')
      }
    } catch (error) {
      console.error('Error parsing daily content:', error)
      console.error('Raw AI response:', response)
      throw new Error(`Failed to parse AI response: ${error.message}`)
    }
  }

  // Parse verses response
  parseVersesResponse(response) {
    try {
      // Try to find JSON array in the response
      let jsonMatch = response.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        // Try to find JSON after markdown code blocks
        jsonMatch = response.match(/```(?:json)?\s*(\[[\s\S]*?\])/i)
        if (jsonMatch) {
          jsonMatch[0] = jsonMatch[1]
        }
      }
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No valid JSON array found in AI response')
      }
    } catch (error) {
      console.error('Error parsing verses response:', error)
      console.error('Raw AI response:', response)
      throw new Error(`Failed to parse AI response: ${error.message}`)
    }
  }
}

// Export singleton instance
export const aiGenerationService = new AIGenerationService()

// Test function for console testing
export const testAIGeneration = async () => {
  console.log('🧪 Testing Dual AI Generation with OpenRouter API...')
  
  try {
    const service = new AIGenerationService()
    
    // Test DeepSeek for verse generation
    console.log('📖 Testing DeepSeek for verse generation...')
    const versePrompt = service.createVersePrompt()
    const verseResponse = await service.callAI(versePrompt, service.model)
    console.log('✅ DeepSeek Response:', verseResponse)
    
    // Clean and parse verse response
    const cleanedVerseResponse = service.cleanJsonResponse(verseResponse)
    const verseData = JSON.parse(cleanedVerseResponse)
    console.log('📖 Parsed Verse:', verseData)
    
    // Test DeepSeek for confession generation
    console.log('💭 Testing DeepSeek for confession generation...')
    const confessionPrompt = service.createConfessionPrompt(verseData)
    const confessionResponse = await service.callAI(confessionPrompt, service.model)
    console.log('✅ DeepSeek Response:', confessionResponse)
    
    // Clean and parse confession response
    const cleanedConfessionResponse = service.cleanJsonResponse(confessionResponse)
    const confessionData = JSON.parse(cleanedConfessionResponse)
    console.log('💭 Parsed Confession:', confessionData)
    
    return {
      verse: verseData,
      confession: confessionData
    }
  } catch (error) {
    console.error('❌ AI Generation failed:', error)
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText
    })
    return null
  }
}

// Make test function available globally for console testing
if (typeof window !== 'undefined') {
  window.testAIGeneration = testAIGeneration
  window.aiGenerationService = aiGenerationService
}
