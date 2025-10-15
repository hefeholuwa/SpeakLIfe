import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.jsx'

export default function DatabaseAdmin() {
  const [topics, setTopics] = useState([])
  const [verses, setVerses] = useState([])
  const [users, setUsers] = useState([])
  const [userConfessions, setUserConfessions] = useState([])
  const [favorites, setFavorites] = useState([])
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('topics')
  
  // Form states
  const [newTopic, setNewTopic] = useState({ title: '', description: '', icon: '' })
  const [newVerse, setNewVerse] = useState({ 
    reference: '', 
    scripture_text: '', 
    confession_text: '', 
    version: 'NIV' 
  })
  const [newUser, setNewUser] = useState({ 
    full_name: '', 
    email: '', 
    avatar_url: '', 
    streak_count: 0 
  })
  const [newUserConfession, setNewUserConfession] = useState({ 
    user_id: '', 
    verse_id: '', 
    note: '' 
  })
  const [newFavorite, setNewFavorite] = useState({ 
    user_id: '', 
    verse_id: '' 
  })

  // Load data on component mount
  useEffect(() => {
    fetchTopics()
    fetchUsers()
    fetchUserConfessions()
    fetchFavorites()
  }, [])

  // Load verses when topic is selected
  useEffect(() => {
    if (selectedTopic) {
      fetchVerses(selectedTopic.id)
    }
  }, [selectedTopic])

  const fetchTopics = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('topics').select('*').order('created_at', { ascending: false })
    if (error) console.error('Error fetching topics:', error)
    else setTopics(data || [])
    setLoading(false)
  }

  const fetchVerses = async (topicId) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('verses')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: false })
    if (error) console.error('Error fetching verses:', error)
    else setVerses(data || [])
    setLoading(false)
  }

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    if (error) console.error('Error fetching users:', error)
    else setUsers(data || [])
    setLoading(false)
  }

  const fetchUserConfessions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('user_confessions')
      .select(`
        *,
        users(full_name, email),
        verses(reference, scripture_text)
      `)
      .order('confessed_at', { ascending: false })
    if (error) console.error('Error fetching user confessions:', error)
    else setUserConfessions(data || [])
    setLoading(false)
  }

  const fetchFavorites = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        users(full_name, email),
        verses(reference, scripture_text)
      `)
      .order('created_at', { ascending: false })
    if (error) console.error('Error fetching favorites:', error)
    else setFavorites(data || [])
    setLoading(false)
  }

  const addTopic = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase
      .from('topics')
      .insert([newTopic])
      .select()
    
    if (error) {
      console.error('Error adding topic:', error)
      alert('Error adding topic: ' + error.message)
    } else {
      console.log('Topic added successfully:', data)
      setNewTopic({ title: '', description: '', icon: '' })
      fetchTopics()
    }
    setLoading(false)
  }

  const addVerse = async (e) => {
    e.preventDefault()
    if (!selectedTopic) {
      alert('Please select a topic first')
      return
    }
    
    setLoading(true)
    const verseData = {
      ...newVerse,
      topic_id: selectedTopic.id
    }
    
    const { data, error } = await supabase
      .from('verses')
      .insert([verseData])
      .select()
    
    if (error) {
      console.error('Error adding verse:', error)
      alert('Error adding verse: ' + error.message)
    } else {
      console.log('Verse added successfully:', data)
      setNewVerse({ reference: '', scripture_text: '', confession_text: '', version: 'NIV' })
      fetchVerses(selectedTopic.id)
    }
    setLoading(false)
  }

  const deleteTopic = async (topicId) => {
    if (!confirm('Are you sure you want to delete this topic? This will also delete all verses in this topic.')) return
    
    setLoading(true)
    const { error } = await supabase.from('topics').delete().eq('id', topicId)
    
    if (error) {
      console.error('Error deleting topic:', error)
      alert('Error deleting topic: ' + error.message)
    } else {
      console.log('Topic deleted successfully')
      fetchTopics()
      setSelectedTopic(null)
    }
    setLoading(false)
  }

  const deleteVerse = async (verseId) => {
    if (!confirm('Are you sure you want to delete this verse?')) return
    
    setLoading(true)
    const { error } = await supabase.from('verses').delete().eq('id', verseId)
    
    if (error) {
      console.error('Error deleting verse:', error)
      alert('Error deleting verse: ' + error.message)
    } else {
      console.log('Verse deleted successfully')
      fetchVerses(selectedTopic.id)
    }
    setLoading(false)
  }

  // User management functions
  const addUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
      .select()
    
    if (error) {
      console.error('Error adding user:', error)
      alert('Error adding user: ' + error.message)
    } else {
      console.log('User added successfully:', data)
      setNewUser({ full_name: '', email: '', avatar_url: '', streak_count: 0 })
      fetchUsers()
    }
    setLoading(false)
  }

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    setLoading(true)
    const { error } = await supabase.from('users').delete().eq('id', userId)
    
    if (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user: ' + error.message)
    } else {
      console.log('User deleted successfully')
      fetchUsers()
    }
    setLoading(false)
  }

  // User Confession management functions
  const addUserConfession = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase
      .from('user_confessions')
      .insert([newUserConfession])
      .select()
    
    if (error) {
      console.error('Error adding user confession:', error)
      alert('Error adding user confession: ' + error.message)
    } else {
      console.log('User confession added successfully:', data)
      setNewUserConfession({ user_id: '', verse_id: '', note: '' })
      fetchUserConfessions()
    }
    setLoading(false)
  }

  const deleteUserConfession = async (confessionId) => {
    if (!confirm('Are you sure you want to delete this confession?')) return
    
    setLoading(true)
    const { error } = await supabase.from('user_confessions').delete().eq('id', confessionId)
    
    if (error) {
      console.error('Error deleting user confession:', error)
      alert('Error deleting user confession: ' + error.message)
    } else {
      console.log('User confession deleted successfully')
      fetchUserConfessions()
    }
    setLoading(false)
  }

  // Favorites management functions
  const addFavorite = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase
      .from('favorites')
      .insert([newFavorite])
      .select()
    
    if (error) {
      console.error('Error adding favorite:', error)
      alert('Error adding favorite: ' + error.message)
    } else {
      console.log('Favorite added successfully:', data)
      setNewFavorite({ user_id: '', verse_id: '' })
      fetchFavorites()
    }
    setLoading(false)
  }

  const deleteFavorite = async (favoriteId) => {
    if (!confirm('Are you sure you want to delete this favorite?')) return
    
    setLoading(true)
    const { error } = await supabase.from('favorites').delete().eq('id', favoriteId)
    
    if (error) {
      console.error('Error deleting favorite:', error)
      alert('Error deleting favorite: ' + error.message)
    } else {
      console.log('Favorite deleted successfully')
      fetchFavorites()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">🗄️ Database Admin Panel</h1>
          
          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {[
                { id: 'topics', label: '📚 Topics', count: topics.length },
                { id: 'verses', label: '📖 Verses', count: verses.length },
                { id: 'users', label: '👥 Users', count: users.length },
                { id: 'confessions', label: '🙏 Confessions', count: userConfessions.length },
                { id: 'favorites', label: '❤️ Favorites', count: favorites.length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Topics Tab */}
          {activeTab === 'topics' && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">📚 Topics Management</h2>
            
            {/* Add Topic Form */}
            <form onSubmit={addTopic} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3">Add New Topic</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Topic Title"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newTopic.description}
                  onChange={(e) => setNewTopic({...newTopic, description: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Icon (emoji)"
                  value={newTopic.icon}
                  onChange={(e) => setNewTopic({...newTopic, icon: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Topic'}
              </button>
            </form>

            {/* Topics List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map(topic => (
                <div
                  key={topic.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedTopic?.id === topic.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTopic(topic)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl mb-1">{topic.icon}</div>
                      <h4 className="font-medium text-gray-800">{topic.title}</h4>
                      <p className="text-sm text-gray-600">{topic.description}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteTopic(topic.id)
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verses Section */}
          {selectedTopic && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                📖 Verses for "{selectedTopic.title}"
              </h2>
              
              {/* Add Verse Form */}
              <form onSubmit={addVerse} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3">Add New Verse</h3>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Reference (e.g., John 3:16)"
                    value={newVerse.reference}
                    onChange={(e) => setNewVerse({...newVerse, reference: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <textarea
                    placeholder="Scripture Text"
                    value={newVerse.scripture_text}
                    onChange={(e) => setNewVerse({...newVerse, scripture_text: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                  <textarea
                    placeholder="Confession Text (personalized)"
                    value={newVerse.confession_text}
                    onChange={(e) => setNewVerse({...newVerse, confession_text: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Version (e.g., NIV)"
                    value={newVerse.version}
                    onChange={(e) => setNewVerse({...newVerse, version: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Verse'}
                </button>
              </form>

              {/* Verses List */}
              <div className="space-y-4">
                {verses.map(verse => (
                  <div key={verse.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-800">{verse.reference}</h5>
                      <button
                        onClick={() => deleteVerse(verse.id)}
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
        </div>
      </div>
    </div>
  )
}
