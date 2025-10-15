import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.jsx'

export default function FullCRUDAdmin() {
  const [activeTab, setActiveTab] = useState('topics')
  const [loading, setLoading] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  // Data states
  const [topics, setTopics] = useState([])
  const [verses, setVerses] = useState([])
  const [users, setUsers] = useState([])
  const [userConfessions, setUserConfessions] = useState([])
  const [favorites, setFavorites] = useState([])

  // Form states
  const [formData, setFormData] = useState({})

  // Load all data on mount
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
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
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e, table) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (editingItem) {
        // Update existing record
        const { error } = await supabase
          .from(table)
          .update(formData)
          .eq('id', editingItem.id)
        
        if (error) throw error
        console.log(`${table} updated successfully`)
      } else {
        // Create new record
        const { error } = await supabase
          .from(table)
          .insert([formData])
        
        if (error) throw error
        console.log(`${table} created successfully`)
      }
      
      setEditingItem(null)
      setFormData({})
      fetchAllData()
    } catch (error) {
      console.error(`Error with ${table}:`, error)
      alert(`Error: ${error.message}`)
    }
    setLoading(false)
  }

  const handleEdit = (item, table) => {
    setEditingItem(item)
    setFormData(item)
    setActiveTab(table)
  }

  const handleDelete = async (table, id) => {
    if (!confirm(`Are you sure you want to delete this ${table}?`)) return
    
    setLoading(true)
    try {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error
      console.log(`${table} deleted successfully`)
      fetchAllData()
    } catch (error) {
      console.error(`Error deleting ${table}:`, error)
      alert(`Error: ${error.message}`)
    }
    setLoading(false)
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setFormData({})
  }

  const tabs = [
    { id: 'topics', label: '📚 Topics', count: topics.length, color: 'blue' },
    { id: 'verses', label: '📖 Verses', count: verses.length, color: 'green' },
    { id: 'users', label: '👥 Users', count: users.length, color: 'purple' },
    { id: 'confessions', label: '🙏 Confessions', count: userConfessions.length, color: 'orange' },
    { id: 'favorites', label: '❤️ Favorites', count: favorites.length, color: 'pink' }
  ]

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">🗄️ Full CRUD Database Admin</h1>
            <div className="flex gap-2">
              <button
                onClick={fetchAllData}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : '🔄 Refresh All'}
              </button>
              {editingItem && (
                <button
                  onClick={cancelEdit}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  ❌ Cancel Edit
                </button>
              )}
            </div>
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
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">📚 Topics Management</h2>
              
              {/* Add/Edit Topic Form */}
              <form onSubmit={(e) => handleSubmit(e, 'topics')} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3">
                  {editingItem ? 'Edit Topic' : 'Add New Topic'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Topic Title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Icon (emoji)"
                    value={formData.icon || ''}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingItem ? 'Update Topic' : 'Add Topic')}
                </button>
              </form>

              {/* Topics List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topics.map(topic => (
                  <div key={topic.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-2xl">{topic.icon}</div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(topic, 'topics')}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete('topics', topic.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
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
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">📖 Verses Management</h2>
              
              {/* Add/Edit Verse Form */}
              <form onSubmit={(e) => handleSubmit(e, 'verses')} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3">
                  {editingItem ? 'Edit Verse' : 'Add New Verse'}
                </h3>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <select
                    value={formData.topic_id || ''}
                    onChange={(e) => setFormData({...formData, topic_id: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Topic</option>
                    {topics.map(topic => (
                      <option key={topic.id} value={topic.id}>{topic.title}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Reference (e.g., John 3:16)"
                    value={formData.reference || ''}
                    onChange={(e) => setFormData({...formData, reference: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <textarea
                    placeholder="Scripture Text"
                    value={formData.scripture_text || ''}
                    onChange={(e) => setFormData({...formData, scripture_text: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                  <textarea
                    placeholder="Confession Text (personalized)"
                    value={formData.confession_text || ''}
                    onChange={(e) => setFormData({...formData, confession_text: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Version (e.g., NIV)"
                    value={formData.version || ''}
                    onChange={(e) => setFormData({...formData, version: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingItem ? 'Update Verse' : 'Add Verse')}
                </button>
              </form>

              {/* Verses List */}
              <div className="space-y-4">
                {verses.map(verse => (
                  <div key={verse.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-800">{verse.reference}</h3>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(verse, 'verses')}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete('verses', verse.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
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
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">👥 Users Management</h2>
              
              {/* Add/Edit User Form */}
              <form onSubmit={(e) => handleSubmit(e, 'users')} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3">
                  {editingItem ? 'Edit User' : 'Add New User'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.full_name || ''}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="url"
                    placeholder="Avatar URL"
                    value={formData.avatar_url || ''}
                    onChange={(e) => setFormData({...formData, avatar_url: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Streak Count"
                    value={formData.streak_count || ''}
                    onChange={(e) => setFormData({...formData, streak_count: parseInt(e.target.value) || 0})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingItem ? 'Update User' : 'Add User')}
                </button>
              </form>

              {/* Users List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map(user => (
                  <div key={user.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-800">{user.full_name || 'No Name'}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(user, 'users')}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete('users', user.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
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
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">🙏 User Confessions Management</h2>
              
              {/* Add/Edit Confession Form */}
              <form onSubmit={(e) => handleSubmit(e, 'user_confessions')} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3">
                  {editingItem ? 'Edit Confession' : 'Add New Confession'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <select
                    value={formData.user_id || ''}
                    onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.full_name || user.email}</option>
                    ))}
                  </select>
                  <select
                    value={formData.verse_id || ''}
                    onChange={(e) => setFormData({...formData, verse_id: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Verse</option>
                    {verses.map(verse => (
                      <option key={verse.id} value={verse.id}>{verse.reference}</option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Note (optional)"
                    value={formData.note || ''}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingItem ? 'Update Confession' : 'Add Confession')}
                </button>
              </form>

              {/* Confessions List */}
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
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(confession, 'confessions')}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete('user_confessions', confession.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
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
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">❤️ Favorites Management</h2>
              
              {/* Add/Edit Favorite Form */}
              <form onSubmit={(e) => handleSubmit(e, 'favorites')} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3">
                  {editingItem ? 'Edit Favorite' : 'Add New Favorite'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <select
                    value={formData.user_id || ''}
                    onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.full_name || user.email}</option>
                    ))}
                  </select>
                  <select
                    value={formData.verse_id || ''}
                    onChange={(e) => setFormData({...formData, verse_id: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Verse</option>
                    {verses.map(verse => (
                      <option key={verse.id} value={verse.id}>{verse.reference}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingItem ? 'Update Favorite' : 'Add Favorite')}
                </button>
              </form>

              {/* Favorites List */}
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
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(favorite, 'favorites')}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete('favorites', favorite.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
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
