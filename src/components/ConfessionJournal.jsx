import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ConfessionJournal = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'confession',
    mood: 'grateful',
    is_private: true,
    tags: []
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('confession_journal')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async (e) => {
    e.preventDefault();
    try {
      if (editingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('confession_journal')
          .update(formData)
          .eq('id', editingEntry.id);
        
        if (error) throw error;
      } else {
        // Create new entry
        const { error } = await supabase
          .from('confession_journal')
          .insert([formData]);
        
        if (error) throw error;
      }
      
      await loadEntries();
      resetForm();
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const deleteEntry = async (entryId) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      const { error } = await supabase
        .from('confession_journal')
        .delete()
        .eq('id', entryId);
      
      if (error) throw error;
      await loadEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'confession',
      mood: 'grateful',
      is_private: true,
      tags: []
    });
    setEditingEntry(null);
    setShowForm(false);
  };

  const startEdit = (entry) => {
    setFormData({
      title: entry.title || '',
      content: entry.content,
      category: entry.category || 'confession',
      mood: entry.mood || 'grateful',
      is_private: entry.is_private,
      tags: entry.tags || []
    });
    setEditingEntry(entry);
    setShowForm(true);
  };

  const filteredEntries = entries.filter(entry => {
    const matchesFilter = filter === 'all' || entry.category === filter;
    const matchesSearch = entry.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      grateful: '🙏',
      repentant: '😔',
      hopeful: '✨',
      joyful: '😊',
      peaceful: '🕊️',
      anxious: '😰',
      blessed: '🙌',
      reflective: '🤔'
    };
    return moodEmojis[mood] || '😊';
  };

  const getCategoryEmoji = (category) => {
    const categoryEmojis = {
      prayer: '🙏',
      confession: '💭',
      reflection: '🤔',
      testimony: '✨',
      gratitude: '🙌',
      request: '📝'
    };
    return categoryEmojis[category] || '📝';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Confession Journal</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  ✍️ New Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      filter === 'all' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All ({entries.length})
                  </button>
                  <button
                    onClick={() => setFilter('confession')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      filter === 'confession' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    💭 Confessions
                  </button>
                  <button
                    onClick={() => setFilter('prayer')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      filter === 'prayer' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🙏 Prayers
                  </button>
                  <button
                    onClick={() => setFilter('reflection')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      filter === 'reflection' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🤔 Reflections
                  </button>
                </div>
                
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Entries List */}
            <div className="space-y-4">
              {filteredEntries.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No entries yet</h3>
                  <p className="text-gray-600 mb-4">Start your spiritual journey by writing your first entry</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    ✍️ Write First Entry
                  </button>
                </div>
              ) : (
                filteredEntries.map((entry) => (
                  <div key={entry.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getCategoryEmoji(entry.category)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {entry.title || 'Untitled Entry'}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span className="capitalize">{entry.category}</span>
                            <span>•</span>
                            <span>{getMoodEmoji(entry.mood)} {entry.mood}</span>
                            <span>•</span>
                            <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(entry)}
                          className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {entry.content}
                      </p>
                    </div>
                    
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {entry.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Your Journey</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Entries</span>
                  <span className="font-semibold">{entries.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-semibold">
                    {entries.filter(e => new Date(e.created_at).getMonth() === new Date().getMonth()).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Confessions</span>
                  <span className="font-semibold">
                    {entries.filter(e => e.category === 'confession').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prayers</span>
                  <span className="font-semibold">
                    {entries.filter(e => e.category === 'prayer').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Tags */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🏷️ Recent Tags</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(entries.flatMap(e => e.tags || []))).slice(0, 10).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Entry Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={saveEntry} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Give your entry a title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-40"
                    placeholder="Share your thoughts, prayers, confessions, or reflections..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="confession">💭 Confession</option>
                      <option value="prayer">🙏 Prayer</option>
                      <option value="reflection">🤔 Reflection</option>
                      <option value="testimony">✨ Testimony</option>
                      <option value="gratitude">🙌 Gratitude</option>
                      <option value="request">📝 Request</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mood
                    </label>
                    <select
                      value={formData.mood}
                      onChange={(e) => setFormData({...formData, mood: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="grateful">🙏 Grateful</option>
                      <option value="repentant">😔 Repentant</option>
                      <option value="hopeful">✨ Hopeful</option>
                      <option value="joyful">😊 Joyful</option>
                      <option value="peaceful">🕊️ Peaceful</option>
                      <option value="anxious">😰 Anxious</option>
                      <option value="blessed">🙌 Blessed</option>
                      <option value="reflective">🤔 Reflective</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_private"
                    checked={formData.is_private}
                    onChange={(e) => setFormData({...formData, is_private: e.target.checked})}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_private" className="ml-2 block text-sm text-gray-700">
                    Keep this entry private
                  </label>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {editingEntry ? 'Update Entry' : 'Save Entry'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfessionJournal;
