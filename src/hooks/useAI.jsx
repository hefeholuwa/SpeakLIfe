import { useState, useCallback } from 'react'
import { supabase } from '../supabaseClient.jsx'

// AI Service Hook for React + Vite + Tailwind
export const useAI = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)


  // Generate spiritual guidance
  const generateSpiritualGuidance = useCallback(async (userId, question) => {
    try {
      setLoading(true)
      setError(null)

      const isDemoUser = userId === 'demo-user-id'
      
      let user = null
      let aiModel = null

      if (!isDemoUser) {
        const { data: userData } = await supabase
          .from('users')
          .select('spiritual_maturity_level, spiritual_focus')
          .eq('id', userId)
          .single()

        const { data: modelData } = await supabase
          .from('ai_models')
          .select('*')
          .eq('name', 'openai/gpt-oss-20b:free')
          .single()

        user = userData
        aiModel = modelData
      } else {
        // Demo mode
        user = {
          spiritual_maturity_level: 'beginner',
          spiritual_focus: ['faith', 'guidance']
        }
        aiModel = { name: 'openai/gpt-oss-20b:free', id: 'demo-model' }
      }

      const prompt = createGuidancePrompt(user, question)
      let aiResponse
      try {
        aiResponse = await callAI(prompt, aiModel.name)
        
        if (!isDemoUser) {
          await storeAIInteraction(userId, aiModel.id, 'guidance_given', prompt, aiResponse)
        }
        
        return aiResponse
      } catch (apiError) {
        console.error('AI API failed:', apiError.message)
        throw new Error(`AI service unavailable: ${apiError.message}`)
      }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get personalized verses
  const getPersonalizedVerses = useCallback(async (userId, limit = 5) => {
    try {
      setLoading(true)
      setError(null)

      const isDemoUser = userId === 'demo-user-id'
      
      // Use default user data for demo mode
      let user = {
        spiritual_focus: ['faith', 'strength', 'purpose'],
        ai_preferences: {}
      }
      
      if (!isDemoUser) {
        // Get user's spiritual focus and preferences
        const { data: userData } = await supabase
          .from('users')
          .select('spiritual_focus, ai_preferences')
          .eq('id', userId)
          .single()
        
        if (userData) {
          user = userData
        }
      }

      // Get personalized content or generate new (skip for demo)
      let existingContent = []
      if (!isDemoUser) {
        const { data: contentData } = await supabase
          .from('ai_personalized_content')
          .select('*')
          .eq('user_id', userId)
          .eq('content_type', 'verse')
          .eq('expires_at', null)
          .limit(limit)
        
        existingContent = contentData || []
      }

      if (existingContent && existingContent.length >= limit) {
        return existingContent
      }

      // Generate new personalized verses using AI
      const aiModel = { name: 'openai/gpt-oss-20b:free', id: isDemoUser ? 'demo-model' : null }
      const prompt = createVersePrompt(user)
      let verses
      try {
        const aiResponse = await callAI(prompt, aiModel.name)
        
        // Parse AI response safely
        try {
          console.log('AI Response:', aiResponse) // Debug log
          
          // Try multiple parsing strategies
          let jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
          if (!jsonMatch) {
            // Try to find JSON after markdown code blocks
            jsonMatch = aiResponse.match(/```(?:json)?\s*(\[[\s\S]*?\])/i)
            if (jsonMatch) {
              jsonMatch[0] = jsonMatch[1]
            }
          }
          
          if (jsonMatch) {
            verses = JSON.parse(jsonMatch[0])
          } else {
            // Try to parse the entire response as JSON
            try {
              verses = JSON.parse(aiResponse)
            } catch {
              throw new Error('AI response format invalid - no JSON array found')
            }
          }
        } catch (parseError) {
          console.error('JSON parse error for verses:', parseError)
          console.error('Raw AI response:', aiResponse)
          throw new Error(`Failed to parse AI response: ${parseError.message}`)
        }
      } catch (apiError) {
        console.error('AI API failed:', apiError.message)
        throw new Error(`AI service unavailable: ${apiError.message}`)
      }
      
      // Store personalized content (skip for demo)
      if (!isDemoUser && aiModel.id) {
        await storePersonalizedContent(userId, aiModel.id, 'verse', verses)
      }
      
      return verses
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Call AI API
  const callAI = async (prompt, modelName) => {
    // Add delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SpeakLife AI'
      },
      body: JSON.stringify({
        model: modelName,
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
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      if (response.status === 429) {
        // Wait 5 seconds and retry once
        console.log('Rate limit hit, waiting 5 seconds before retry...')
        await new Promise(resolve => setTimeout(resolve, 5000))
        
        // Retry the request
        const retryResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'SpeakLife AI'
          },
          body: JSON.stringify({
            model: modelName,
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
            max_tokens: 1000,
            temperature: 0.7
          })
        })
        
        if (!retryResponse.ok) {
          throw new Error('API rate limit exceeded. Please try again in a few minutes.')
        }
        
        const retryData = await retryResponse.json()
        return retryData.choices[0].message.content
      } else if (response.status === 402) {
        throw new Error('API usage limit reached. Please check your OpenRouter account.')
      } else {
        throw new Error(`AI API Error: ${response.status} - ${errorText}`)
      }
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  // Store AI interaction for learning
  const storeAIInteraction = async (userId, modelId, type, prompt, response) => {
    await supabase
      .from('ai_interactions')
      .insert({
        user_id: userId,
        ai_model_id: modelId,
        interaction_type: type,
        prompt_used: prompt,
        ai_response: response,
        created_at: new Date().toISOString()
      })
  }

  // Store personalized content
  const storePersonalizedContent = async (userId, modelId, type, content) => {
    await supabase
      .from('ai_personalized_content')
      .insert({
        user_id: userId,
        ai_model_id: modelId,
        content_type: type,
        content_text: JSON.stringify(content),
        created_at: new Date().toISOString()
      })
  }


  return {
    loading,
    error,
    generateSpiritualGuidance,
    getPersonalizedVerses
  }
}

// Helper functions

const createGuidancePrompt = (user, question) => {
  const { spiritual_maturity_level = 'beginner', spiritual_focus = [] } = user || {}
  
  return `Provide spiritual guidance for a ${spiritual_maturity_level} Christian.
  Focus areas: ${spiritual_focus.join(', ')}
  Question: ${question}
  
  Provide biblical, practical guidance in a loving, encouraging tone.`
}

const createVersePrompt = (user) => {
  const { spiritual_focus = [] } = user || {}
  
  return `You are a deeply spiritual AI assistant with extensive knowledge of the Bible. Generate 3 unique, powerful Bible verses that are NOT commonly quoted (avoid John 3:16, Jeremiah 29:11, Philippians 4:13, Romans 8:28, etc.).

  User's spiritual focus: ${spiritual_focus.join(', ')}
  
  Requirements:
  - Choose verses from different books of the Bible
  - Select verses that are less commonly known but deeply powerful
  - Include verses from both Old and New Testament
  - Choose different Bible versions (NIV, ESV, NKJV, NLT, etc.)
  - Make confessions deeply spiritual and anointed
  - Ensure each verse speaks to their spiritual journey
  
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
  
  Make each verse unique, powerful, and spiritually profound. Avoid generic or overused verses.`
}
