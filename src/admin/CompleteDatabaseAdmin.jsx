import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.jsx'

export default function CompleteDatabaseAdmin() {
  const [activeTab, setActiveTab] = useState('topics')
  const [loading, setLoading] = useState(false)
  
  // Data states
  const [topics, setTopics] = useState([])
  const [verses, setVerses] = useState([])
  const [users, setUsers] = useState([])
  const [userConfessions, setUserConfessions] = useState([])
  const [favorites, setFavorites] = useState([])
  
  // AI states
  const [aiContent, setAiContent] = useState([])
  const [aiPerformance, setAiPerformance] = useState({})
  const [aiSettings, setAiSettings] = useState({
    autoGenerate: false,
    preferredModel: 'deepseek-v3.1',
    dailyLimit: 10,
    autoCreateTopics: true
  })
  const [generatingContent, setGeneratingContent] = useState(false)

  // Load all data on mount
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      // Fetch all tables in parallel
      const [topicsRes, versesRes, usersRes, confessionsRes, favoritesRes] = await Promise.all([
        supabase.from('topics').select('*').order('created_at', { ascending: false }),
        supabase.from('verses').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('user_confessions').select(`
          *,
          users(full_name, email),
          verses(reference, scripture_text)
        `).order('confessed_at', { ascending: false }),
        supabase.from('favorites').select(`
          *,
          users(full_name, email),
          verses(reference, scripture_text)
        `).order('created_at', { ascending: false })
      ])

      setTopics(topicsRes.data || [])
      setVerses(versesRes.data || [])
      setUsers(usersRes.data || [])
      setUserConfessions(confessionsRes.data || [])
      setFavorites(favoritesRes.data || [])
      
      // Fetch AI performance data
      await fetchAiPerformance()
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  // AI Content Generation
  const generateAiContent = async (topic = null, count = 3) => {
    setGeneratingContent(true)
    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
      console.log('API Key present:', !!apiKey)
      console.log('API Key length:', apiKey ? apiKey.length : 0)
      
      if (!apiKey) {
        throw new Error('OpenRouter API key not found. Please add VITE_OPENROUTER_API_KEY to your .env file')
      }

      // Randomize topics to avoid predictability
      const topics = ['Faith', 'Healing', 'Strength', 'Peace', 'Love', 'Wisdom', 'Victory', 'Protection', 'Purpose', 'Prosperity']
      const selectedTopic = topic || topics[Math.floor(Math.random() * topics.length)]
      
      // Add randomization to the prompt
      const promptVariations = [
        'with deep spiritual insight',
        'using powerful declarations',
        'with prophetic authority',
        'in a transformative way',
        'with biblical depth',
        'using ancient wisdom',
        'with modern relevance',
        'in a life-changing manner'
      ]
      const randomVariation = promptVariations[Math.floor(Math.random() * promptVariations.length)]
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://speaklife.app',
          'X-Title': 'SpeakLife Admin'
        },
        body: JSON.stringify({
          model: aiSettings.preferredModel === 'deepseek-v3.1' ? 'deepseek/deepseek-chat' : 'openai/gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: `Generate ${count} DIVERSE and UNIQUE confession(s) about ${selectedTopic ? selectedTopic : 'various spiritual topics'} ${randomVariation} based on biblical principles. 

CRITICAL REQUIREMENTS:
- Use DIFFERENT Bible books (Old Testament, New Testament, Psalms, Proverbs, etc.)
- Include VARIOUS scripture types (promises, commands, declarations, prayers)
- Mix different Bible versions (NIV, ESV, KJV, NLT, AMP)
- Create UNIQUE confessions that are personal and specific
- Avoid common/predictable verses like John 3:16, Jeremiah 29:11
- Use lesser-known but powerful scriptures
- Make each confession feel fresh and original

VARIETY REQUIREMENTS:
- At least 2 different Bible books
- At least 2 different Bible versions  
- Mix of Old Testament and New Testament
- Include different types of verses (promises, commands, declarations)

IMPORTANT: Each piece of content should include a "topic" field that matches one of these categories:
Faith, Healing, Strength, Peace, Love, Wisdom, Victory, Protection, Purpose, Prosperity

If no specific topic is provided, choose the most appropriate topic for each piece of content based on the scripture and confession content.

Return ONLY valid JSON array in this exact format:
[
  {
    "topic": "Faith",
    "reference": "Psalm 91:1-2",
    "scripture_text": "Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the Lord, 'He is my refuge and my fortress, my God, in whom I trust.'",
    "confession_text": "I dwell in the shelter of the Most High and rest in the shadow of the Almighty. The Lord is my refuge and fortress, my God in whom I trust completely.",
    "version": "NIV"
  }
]

Do not include any other text, explanations, or markdown formatting. Just the JSON array.`
          }]
        })
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      if (response.ok) {
        const data = await response.json()
        console.log('AI Response:', data)
        
        // Try to parse the content with better JSON handling
        let generatedContent
        try {
          let content = data.choices[0].message.content
          console.log('Raw AI response:', content)
          
          // Clean up the JSON if it has markdown formatting
          if (content.includes('```json')) {
            content = content.split('```json')[1].split('```')[0]
          } else if (content.includes('```')) {
            content = content.split('```')[1].split('```')[0]
          }
          
          // Try to parse as JSON
          generatedContent = JSON.parse(content)
          
          // Ensure it's an array
          if (!Array.isArray(generatedContent)) {
            generatedContent = [generatedContent]
          }
          
        } catch (parseError) {
          console.log('JSON parse error, creating structured content:', parseError)
          
          // If JSON parsing fails, try to extract content from the text
          const rawContent = data.choices[0].message.content
          const lines = rawContent.split('\n').filter(line => line.trim())
          
          // Try to extract structured content from the text
          const extractedContent = []
          let currentItem = {}
          
          for (const line of lines) {
            if (line.toLowerCase().includes('reference:') || line.toLowerCase().includes('verse:')) {
              if (Object.keys(currentItem).length > 0) {
                extractedContent.push(currentItem)
              }
              currentItem = { reference: line.split(':')[1]?.trim() || 'Generated Verse' }
            } else if (line.toLowerCase().includes('scripture:') || line.toLowerCase().includes('text:')) {
              currentItem.scripture_text = line.split(':')[1]?.trim() || line
            } else if (line.toLowerCase().includes('confession:') || line.toLowerCase().includes('declare:')) {
              currentItem.confession_text = line.split(':')[1]?.trim() || line
            } else if (line.toLowerCase().includes('version:')) {
              currentItem.version = line.split(':')[1]?.trim() || 'NIV'
            } else if (line.trim() && !line.toLowerCase().includes('generate') && !line.toLowerCase().includes('confession')) {
              // If it looks like scripture text
              if (!currentItem.scripture_text) {
                currentItem.scripture_text = line.trim()
              } else if (!currentItem.confession_text) {
                currentItem.confession_text = line.trim()
              }
            }
          }
          
          // Add the last item
          if (Object.keys(currentItem).length > 0) {
            extractedContent.push(currentItem)
          }
          
          // If we still don't have structured content, create a simple one
          if (extractedContent.length === 0) {
            extractedContent.push({
              topic: selectedTopic,
              reference: 'Generated Verse',
              scripture_text: rawContent,
              confession_text: 'I speak this truth over my life',
              version: 'NIV'
            })
          }
          
          generatedContent = extractedContent
        }
        
        // Add to AI content for review
        const newAiContent = generatedContent.map((content, index) => ({
          id: `ai-${Date.now()}-${index}`,
          topic: content.topic || selectedTopic, // Use AI-generated topic or fallback to selected topic
          reference: content.reference,
          scripture_text: content.scripture_text,
          confession_text: content.confession_text,
          version: content.version || 'NIV',
          aiModel: aiSettings.preferredModel,
          status: 'pending',
          createdAt: new Date().toISOString()
        }))
        
        console.log('Adding new AI content:', newAiContent)
        setAiContent(prev => {
          console.log('Previous AI content:', prev)
          // Remove any existing content with the same IDs to prevent duplicates
          const filtered = prev.filter(existing => 
            !newAiContent.some(newContent => newContent.id === existing.id)
          )
          const updated = [...filtered, ...newAiContent]
          console.log('Updated AI content:', updated)
          return updated
        })
        alert(`Generated ${count} AI content(s) for ${topic}!`)
      } else {
        const errorText = await response.text()
        console.log('Error response:', errorText)
        throw new Error(`AI generation failed: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error('Error generating AI content:', error)
      alert('Error generating AI content. Please check your API key.')
    }
    setGeneratingContent(false)
  }

  // Approve AI Content
  const approveAiContent = async (contentId) => {
    const content = aiContent.find(c => c.id === contentId)
    if (!content) return

    try {
      // Smart topic matching - try multiple strategies
      let topic = null
      
      // 1. Exact match (case insensitive)
      topic = topics.find(t => t.title.toLowerCase() === content.topic.toLowerCase())
      
      // 2. Partial match (topic contains the content topic)
      if (!topic) {
        topic = topics.find(t => t.title.toLowerCase().includes(content.topic.toLowerCase()))
      }
      
      // 3. Reverse partial match (content topic contains existing topic)
      if (!topic) {
        topic = topics.find(t => content.topic.toLowerCase().includes(t.title.toLowerCase()))
      }
      
      // 4. Similar words match (for related concepts)
      if (!topic) {
        const similarTopics = {
          'power': ['strength', 'victory', 'authority'],
          'strength': ['power', 'victory', 'authority'],
          'victory': ['power', 'strength', 'triumph'],
          'authority': ['power', 'strength', 'dominion'],
          'healing': ['health', 'wholeness', 'restoration'],
          'health': ['healing', 'wholeness', 'restoration'],
          'peace': ['calm', 'tranquility', 'serenity'],
          'calm': ['peace', 'tranquility', 'serenity'],
          'faith': ['belief', 'trust', 'confidence'],
          'belief': ['faith', 'trust', 'confidence'],
          'love': ['affection', 'compassion', 'kindness'],
          'affection': ['love', 'compassion', 'kindness'],
          'wisdom': ['understanding', 'knowledge', 'insight'],
          'understanding': ['wisdom', 'knowledge', 'insight'],
          'prosperity': ['abundance', 'wealth', 'success'],
          'abundance': ['prosperity', 'wealth', 'success']
        }
        
        const contentTopicLower = content.topic.toLowerCase()
        const similarWords = similarTopics[contentTopicLower] || []
        
        topic = topics.find(t => {
          const topicTitleLower = t.title.toLowerCase()
          return similarWords.some(word => topicTitleLower.includes(word)) ||
                 similarWords.some(word => word.includes(topicTitleLower))
        })
      }
      
      // Log the matched topic
      if (topic) {
        console.log(`✅ Matched topic "${content.topic}" to existing topic: "${topic.title}"`)
      }
      
      // If topic doesn't exist, create it automatically (if enabled)
      if (!topic) {
        if (aiSettings.autoCreateTopics) {
          console.log(`Creating new topic: ${content.topic}`)
          
          // Create the new topic
          const { data: newTopic, error: topicError } = await supabase
            .from('topics')
            .insert([{
              title: content.topic,
              description: `AI-generated content about ${content.topic}`,
              icon: '✨' // Default icon for AI-generated topics
            }])
            .select()
            .single()
          
          if (topicError) {
            console.error('Error creating topic:', topicError)
            alert(`Error creating topic: ${topicError.message}`)
            return
          }
          
          topic = newTopic
          console.log('Created new topic:', topic)
          
          // Refresh topics list
          const { data: updatedTopics } = await supabase
            .from('topics')
            .select('*')
            .order('created_at', { ascending: false })
          
          setTopics(updatedTopics || [])
        } else {
          // Show available topics to help user
          const availableTopics = topics.map(t => t.title).join(', ')
          alert(`Topic "${content.topic}" not found. Available topics: ${availableTopics}\n\nEnable "Auto-create topics" in AI settings to automatically create new topics.`)
          return
        }
      }

      // Insert into verses table
      const { error } = await supabase
        .from('verses')
        .insert([{
          topic_id: topic.id,
          reference: content.reference,
          scripture_text: content.scripture_text,
          confession_text: content.confession_text,
          version: content.version
        }])

      if (error) throw error

      // Update AI content status
      setAiContent(prev => prev.map(c => 
        c.id === contentId ? { ...c, status: 'approved' } : c
      ))
      
      alert('AI content approved and added to database!')
      fetchAllData() // Refresh data
    } catch (error) {
      console.error('Error approving AI content:', error)
      alert('Error approving AI content')
    }
  }

  // Reject AI Content
  const rejectAiContent = (contentId) => {
    setAiContent(prev => prev.map(c => 
      c.id === contentId ? { ...c, status: 'rejected' } : c
    ))
    alert('AI content rejected')
  }

  // Clear all AI content
  const clearAiContent = () => {
    if (confirm('Are you sure you want to clear all AI content?')) {
      setAiContent([])
      alert('AI content cleared')
    }
  }

  // Remove duplicates from AI content
  const removeDuplicates = () => {
    setAiContent(prev => {
      const unique = prev.filter((content, index, self) => 
        index === self.findIndex(c => c.id === content.id)
      )
      console.log('Removed duplicates:', prev.length - unique.length)
      return unique
    })
  }

  // Fetch AI Performance
  const fetchAiPerformance = async () => {
    try {
      // Calculate AI performance metrics
      const today = new Date().toISOString().split('T')[0]
      const recentVerses = verses.filter(v => v.created_at.startsWith(today))
      
      setAiPerformance({
        totalContent: verses.length,
        todayContent: recentVerses.length,
        deepseekRequests: 0, // This would come from your API usage tracking
        gptossRequests: 0,   // This would come from your API usage tracking
        approvalRate: aiContent.filter(c => c.status === 'approved').length / Math.max(aiContent.length, 1) * 100
      })
    } catch (error) {
      console.error('Error fetching AI performance:', error)
    }
  }

  const deleteRecord = async (table, id) => {
    if (!confirm(`Are you sure you want to delete this ${table}?`)) return
    
    setLoading(true)
    const { error } = await supabase.from(table).delete().eq('id', id)
    
    if (error) {
      console.error(`Error deleting ${table}:`, error)
      alert(`Error deleting ${table}: ${error.message}`)
    } else {
      console.log(`${table} deleted successfully`)
      fetchAllData()
    }
    setLoading(false)
  }

  const tabs = [
    { id: 'topics', label: '📚 Topics', count: topics.length, color: 'blue' },
    { id: 'verses', label: '📖 Verses', count: verses.length, color: 'green' },
    { id: 'users', label: '👥 Users', count: users.length, color: 'purple' },
    { id: 'confessions', label: '🙏 Confessions', count: userConfessions.length, color: 'orange' },
    { id: 'favorites', label: '❤️ Favorites', count: favorites.length, color: 'pink' },
    { id: 'ai-content', label: '🤖 AI Content', count: aiContent.length, color: 'indigo' },
    { id: 'ai-analytics', label: '📊 AI Analytics', count: 0, color: 'teal' }
  ]

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">🗄️ Complete Database Admin</h1>
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : '🔄 Refresh All'}
            </button>
          </div>
          
          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? `bg-${tab.color}-100 text-${tab.color}-800 border-2 border-${tab.color}-300`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Topics Tab */}
          {activeTab === 'topics' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">📚 Topics ({topics.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topics.map(topic => (
                  <div key={topic.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-2xl">{topic.icon}</div>
                      <button
                        onClick={() => deleteRecord('topics', topic.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                    <h3 className="font-medium text-gray-800">{topic.title}</h3>
                    <p className="text-sm text-gray-600">{topic.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Created: {new Date(topic.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verses Tab */}
          {activeTab === 'verses' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">📖 Verses ({verses.length})</h2>
              <div className="space-y-4">
                {verses.map(verse => (
                  <div key={verse.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-800">{verse.reference}</h3>
                      <button
                        onClick={() => deleteRecord('verses', verse.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                    <p className="text-gray-600 mb-2 italic">"{verse.scripture_text}"</p>
                    <p className="text-gray-700 font-medium">Confession: "{verse.confession_text}"</p>
                    <p className="text-xs text-gray-500 mt-1">Version: {verse.version}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">👥 Users ({users.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map(user => (
                  <div key={user.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-800">{user.full_name || 'No Name'}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <button
                        onClick={() => deleteRecord('users', user.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>Streak: {user.streak_count} days</p>
                      <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Confessions Tab */}
          {activeTab === 'confessions' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">🙏 User Confessions ({userConfessions.length})</h2>
              <div className="space-y-4">
                {userConfessions.map(confession => (
                  <div key={confession.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {confession.users?.full_name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Confessed: {confession.verses?.reference || 'Unknown Verse'}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteRecord('user_confessions', confession.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                    <p className="text-gray-600 mb-2">"{confession.verses?.scripture_text || 'No scripture text'}"</p>
                    {confession.note && (
                      <p className="text-sm text-gray-500 italic">Note: {confession.note}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Confessed: {new Date(confession.confessed_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">❤️ Favorites ({favorites.length})</h2>
              <div className="space-y-4">
                {favorites.map(favorite => (
                  <div key={favorite.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {favorite.users?.full_name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Favorited: {favorite.verses?.reference || 'Unknown Verse'}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteRecord('favorites', favorite.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                    <p className="text-gray-600 mb-2">"{favorite.verses?.scripture_text || 'No scripture text'}"</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Favorited: {new Date(favorite.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Content Management Tab */}
          {activeTab === 'ai-content' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-700">🤖 AI Content Management</h2>
                <div className="flex gap-2">
                  <select
                    value={aiSettings.preferredModel}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, preferredModel: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="deepseek-v3.1">🤖 DeepSeek (Recommended)</option>
                    <option value="gpt-3.5-turbo">🧠 GPT-3.5 Turbo (Backup)</option>
                  </select>
                  <button
                    onClick={() => {
                      const topic = prompt('Enter topic for AI content generation:')
                      const count = prompt('How many content pieces? (1-5)', '1')
                      if (topic && count) {
                        generateAiContent(topic, parseInt(count))
                      }
                    }}
                    disabled={generatingContent}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm"
                  >
                    {generatingContent ? '🔄 Generating...' : '✨ Generate AI Content'}
                  </button>
                  
                  {/* Diverse Generation Options */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => generateAiContent(null, 3)}
                      disabled={generatingContent}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 disabled:opacity-50 text-xs"
                    >
                      🎲 AI Chooses Topics (3)
                    </button>
                    <button
                      onClick={() => generateAiContent('Faith', 2)}
                      disabled={generatingContent}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 disabled:opacity-50 text-xs"
                    >
                      🙏 Faith (2)
                    </button>
                    <button
                      onClick={() => generateAiContent('Healing', 2)}
                      disabled={generatingContent}
                      className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 disabled:opacity-50 text-xs"
                    >
                      💚 Healing (2)
                    </button>
                    <button
                      onClick={() => generateAiContent('Victory', 2)}
                      disabled={generatingContent}
                      className="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 disabled:opacity-50 text-xs"
                    >
                      🏆 Victory (2)
                    </button>
                    <button
                      onClick={() => generateAiContent('Peace', 2)}
                      disabled={generatingContent}
                      className="bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700 disabled:opacity-50 text-xs"
                    >
                      🕊️ Peace (2)
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Settings */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-gray-800 mb-3">⚙️ AI Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred AI Model</label>
                    <select
                      value={aiSettings.preferredModel}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, preferredModel: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="deepseek-v3.1">🤖 DeepSeek (Recommended)</option>
                      <option value="gpt-3.5-turbo">🧠 GPT-3.5 Turbo (Backup)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      DeepSeek: Best for spiritual content. GPT-3.5: Backup option.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Daily Content Limit</label>
                    <input
                      type="number"
                      value={aiSettings.dailyLimit}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, dailyLimit: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      min="1"
                      max="50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Max AI content pieces to generate per day (1-50)
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoGenerate"
                      checked={aiSettings.autoGenerate}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, autoGenerate: e.target.checked }))}
                      className="mr-2"
                    />
                    <label htmlFor="autoGenerate" className="text-sm font-medium text-gray-700">
                      Auto-generate daily content
                    </label>
                  </div>
                </div>
              </div>

              {/* AI Content Review */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-700">📝 AI Content Review ({aiContent.filter(c => c.status === 'pending').length} pending)</h3>
                  <div className="flex gap-2">
                    {aiContent.length > 0 && (
                      <button
                        onClick={removeDuplicates}
                        className="bg-yellow-600 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-700"
                      >
                        🔧 Remove Duplicates
                      </button>
                    )}
                    {aiContent.length > 0 && (
                      <button
                        onClick={clearAiContent}
                        className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                      >
                        🗑️ Clear All
                      </button>
                    )}
                  </div>
                </div>
                {aiContent.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No AI content generated yet. Click "Generate AI Content" to start!</p>
                  </div>
                ) : (
                  aiContent.map(content => (
                    <div key={content.id} className={`p-4 border rounded-lg ${
                      content.status === 'approved' ? 'border-green-200 bg-green-50' :
                      content.status === 'rejected' ? 'border-red-200 bg-red-50' :
                      'border-yellow-200 bg-yellow-50'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-800">{content.reference}</h3>
                          <p className="text-sm text-gray-600">Topic: {content.topic} | Model: {content.aiModel}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            content.status === 'approved' ? 'bg-green-100 text-green-800' :
                            content.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {content.status}
                          </span>
                        </div>
                        {content.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveAiContent(content.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => rejectAiContent(content.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                            >
                              ❌ Reject
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2 italic">"{content.scripture_text}"</p>
                      <p className="text-gray-700 font-medium">Confession: "{content.confession_text}"</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Generated: {new Date(content.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* AI Analytics Tab */}
          {activeTab === 'ai-analytics' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">📊 AI Performance Analytics</h2>
              
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800">Total Content</h3>
                  <p className="text-2xl font-bold text-blue-600">{aiPerformance.totalContent || 0}</p>
                  <p className="text-sm text-blue-600">Verses in Database</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-800">Today's Content</h3>
                  <p className="text-2xl font-bold text-green-600">{aiPerformance.todayContent || 0}</p>
                  <p className="text-sm text-green-600">Generated Today</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-800">Approval Rate</h3>
                  <p className="text-2xl font-bold text-purple-600">{Math.round(aiPerformance.approvalRate || 0)}%</p>
                  <p className="text-sm text-purple-600">AI Content Approved</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-medium text-orange-800">Pending Review</h3>
                  <p className="text-2xl font-bold text-orange-600">{aiContent.filter(c => c.status === 'pending').length}</p>
                  <p className="text-sm text-orange-600">Awaiting Approval</p>
                </div>
              </div>

              {/* AI Model Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <h3 className="font-medium text-indigo-800 mb-2">🤖 DeepSeek V3.1</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-indigo-600">Requests Today:</span>
                      <span className="font-medium">{aiPerformance.deepseekRequests || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-indigo-600">Status:</span>
                      <span className="text-green-600 font-medium">✅ Active</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-teal-50 rounded-lg">
                  <h3 className="font-medium text-teal-800 mb-2">🧠 GPT-OSS-20B</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-teal-600">Requests Today:</span>
                      <span className="font-medium">{aiPerformance.gptossRequests || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-teal-600">Status:</span>
                      <span className="text-green-600 font-medium">✅ Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent AI Activity */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-3">📈 Recent AI Activity</h3>
                <div className="space-y-2">
                  {aiContent.slice(0, 5).map(content => (
                    <div key={content.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{content.reference} - {content.topic}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        content.status === 'approved' ? 'bg-green-100 text-green-800' :
                        content.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {content.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}


          {/* AI Analytics Tab */}
          {activeTab === 'ai-analytics' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">📊 AI Performance Analytics</h2>
              
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800">Total Content</h3>
                  <p className="text-2xl font-bold text-blue-600">{aiPerformance.totalContent || 0}</p>
                  <p className="text-sm text-blue-600">Verses in Database</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-800">Today's Content</h3>
                  <p className="text-2xl font-bold text-green-600">{aiPerformance.todayContent || 0}</p>
                  <p className="text-sm text-green-600">Generated Today</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-800">Approval Rate</h3>
                  <p className="text-2xl font-bold text-purple-600">{Math.round(aiPerformance.approvalRate || 0)}%</p>
                  <p className="text-sm text-purple-600">AI Content Approved</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-medium text-orange-800">Pending Review</h3>
                  <p className="text-2xl font-bold text-orange-600">{aiContent.filter(c => c.status === 'pending').length}</p>
                  <p className="text-sm text-orange-600">Awaiting Approval</p>
                </div>
              </div>

              {/* AI Model Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <h3 className="font-medium text-indigo-800 mb-2">🤖 DeepSeek V3.1</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-indigo-600">Requests Today:</span>
                      <span className="font-medium">{aiPerformance.deepseekRequests || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-indigo-600">Status:</span>
                      <span className="text-green-600 font-medium">✅ Active</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-teal-50 rounded-lg">
                  <h3 className="font-medium text-teal-800 mb-2">🧠 GPT-OSS-20B</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-teal-600">Requests Today:</span>
                      <span className="font-medium">{aiPerformance.gptossRequests || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-teal-600">Status:</span>
                      <span className="text-green-600 font-medium">✅ Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent AI Activity */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-3">📈 Recent AI Activity</h3>
                <div className="space-y-2">
                  {aiContent.slice(0, 5).map(content => (
                    <div key={content.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{content.reference} - {content.topic}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        content.status === 'approved' ? 'bg-green-100 text-green-800' :
                        content.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {content.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
