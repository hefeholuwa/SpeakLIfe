import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

const ConfessionJournal = () => {
  const { user } = useAuth();
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
    is_private: true
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      if (!user) {
        setEntries([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('confession_journal')
        .select('*')
        .eq('user_id', user.id)
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
    if (!user) {
      alert('Please log in to save your confession journal entries.');
      return;
    }
    
    try {
      const entryData = {
        ...formData,
        user_id: user.id
      };
      
      if (editingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('confession_journal')
          .update(entryData)
          .eq('id', editingEntry.id)
          .eq('user_id', user.id); // Ensure user can only update their own entries
        
        if (error) throw error;
      } else {
        // Create new entry
        const { error } = await supabase
          .from('confession_journal')
          .insert([entryData]);
        
        if (error) throw error;
      }
      
      await loadEntries();
      resetForm();
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry. Please try again.');
    }
  };

  const deleteEntry = async (entryId) => {
    if (!user) {
      alert('Please log in to delete entries.');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      const { error } = await supabase
        .from('confession_journal')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.id); // Ensure user can only delete their own entries
      
      if (error) throw error;
      await loadEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'confession',
      mood: 'grateful',
      is_private: true
    });
    setEditingEntry(null);
    setShowForm(false);
  };

  const handlePromptClick = (promptText) => {
    setFormData(prev => ({
      ...prev,
      content: promptText
    }));
    setShowForm(true);
  };


  const getRandomPrompt = () => {
    const allPrompts = [
      "What am I grateful for today? How has God blessed me in unexpected ways?",
      "How has God shown His faithfulness in my life recently? What answered prayers can I celebrate?",
      "What am I struggling with today? How can I surrender this to God and trust in His plan?",
      "How did God speak to me today? What scripture, song, or moment touched my heart?",
      "Who needs my prayers today? How can I intercede for others and be a blessing?",
      "What am I praying for? How can I align my heart with God's will in this situation?",
      "How am I growing in my faith? What spiritual disciplines am I practicing?",
      "What sin or habit do I need to confess? How can I seek God's forgiveness and strength?",
      "What is God teaching me through my current circumstances?",
      "How can I be more like Jesus in my daily interactions?",
      "What areas of my life need God's healing and restoration?",
      "How can I better serve others and show God's love today?"
    ];
    
    const randomPrompt = allPrompts[Math.floor(Math.random() * allPrompts.length)];
    handlePromptClick(randomPrompt);
  };

  const getDailyPrompt = () => {
    const dailyPrompts = [
      "What am I grateful for today? How has God blessed me in unexpected ways?",
      "How has God shown His faithfulness in my life recently? What answered prayers can I celebrate?",
      "What am I struggling with today? How can I surrender this to God and trust in His plan?",
      "How did God speak to me today? What scripture, song, or moment touched my heart?",
      "Who needs my prayers today? How can I intercede for others and be a blessing?",
      "What am I praying for? How can I align my heart with God's will in this situation?",
      "How am I growing in my faith? What spiritual disciplines am I practicing?",
      "What sin or habit do I need to confess? How can I seek God's forgiveness and strength?",
      "What is God teaching me through my current circumstances?",
      "How can I be more like Jesus in my daily interactions?",
      "What areas of my life need God's healing and restoration?",
      "How can I better serve others and show God's love today?",
      "What is God's purpose for my life? How can I align with His calling?",
      "How can I be a light for Christ in my workplace/community today?",
      "What spiritual fruit am I developing? Love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control?",
      "How can I better steward the gifts and resources God has given me?",
      "What relationships in my life need God's healing and restoration?",
      "How can I practice forgiveness and extend grace to others today?",
      "What fears or anxieties am I holding onto that I need to surrender to God?",
      "How can I be more intentional about spending time with God today?",
      "What is God revealing about my character through my current challenges?",
      "How can I better love and serve my family/friends today?",
      "What areas of my life need God's wisdom and guidance?",
      "How can I be more generous with my time, talents, and resources?",
      "What is God calling me to let go of or change in my life?",
      "How can I better reflect God's character in my words and actions?",
      "What spiritual disciplines do I need to develop or strengthen?",
      "How can I be more aware of God's presence throughout my day?",
      "What is God teaching me about trust and faith through my circumstances?",
      "How can I be a better witness for Christ in my daily life?"
    ];
    
    // Use the day of the year to get a consistent daily prompt
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const dailyPrompt = dailyPrompts[dayOfYear % dailyPrompts.length];
    handlePromptClick(dailyPrompt);
  };

  const startEdit = (entry) => {
    setFormData({
      title: entry.title || '',
      content: entry.content,
      category: entry.category || 'confession',
      mood: entry.mood || 'grateful',
      is_private: entry.is_private
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access your confession journal.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]"></div>
      
      {/* Premium Header */}
      <div className="relative bg-white/90 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 shadow-2xl">
                  <span className="text-white text-2xl">📝</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
                  Confession Journal
                </h1>
                <p className="text-sm text-gray-600 mt-1">Your sacred space for reflection and growth</p>
              </div>
            </div>
            <div className="flex space-x-3">
                <button
                  onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  ✍️ New Entry
                </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Premium Filters */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      filter === 'all' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                        : 'bg-white/80 text-gray-600 hover:bg-purple-50 hover:text-purple-700 border border-gray-200'
                    }`}
                  >
                    📚 All ({entries.length})
                  </button>
                  <button
                    onClick={() => setFilter('confession')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      filter === 'confession' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                        : 'bg-white/80 text-gray-600 hover:bg-purple-50 hover:text-purple-700 border border-gray-200'
                    }`}
                  >
                    💭 Confessions
                  </button>
                  <button
                    onClick={() => setFilter('prayer')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      filter === 'prayer' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                        : 'bg-white/80 text-gray-600 hover:bg-purple-50 hover:text-purple-700 border border-gray-200'
                    }`}
                  >
                    🙏 Prayers
                  </button>
                  <button
                    onClick={() => setFilter('reflection')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      filter === 'reflection' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                        : 'bg-white/80 text-gray-600 hover:bg-purple-50 hover:text-purple-700 border border-gray-200'
                    }`}
                  >
                    🤔 Reflections
                  </button>
                </div>
                
                <div className="flex-1">
                  <div className="relative">
                  <input
                    type="text"
                      placeholder="🔍 Search your entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 pl-12 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      🔍
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Entries List */}
            <div className="space-y-4">
              {filteredEntries.length === 0 ? (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
                  <div className="relative mb-8">
                    <div className="text-8xl mb-4 animate-bounce">📝</div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Your Journey Awaits</h3>
                  <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                    Start your spiritual journey by writing your first entry. This is your sacred space for reflection and growth.
                  </p>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8 border border-purple-100">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                      <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <p className="text-purple-700 font-semibold text-lg mb-2">✨ Begin Your Story</p>
                    <p className="text-purple-600 text-sm">Every journey starts with a single step</p>
                  </div>
                  
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-bold text-lg"
                  >
                    ✍️ Write First Entry
                  </button>
                </div>
              ) : (
                filteredEntries.map((entry, index) => (
                  <div 
                    key={entry.id} 
                    className="group relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20 overflow-hidden"
                    style={{ 
                      animationDelay: `${index * 0.1}s`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    {/* Premium Background Effects */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 group-hover:scale-110 transition-transform duration-300">
                              <span className="text-white text-xl">{getCategoryEmoji(entry.category)}</span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                          </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                            {entry.title || 'Untitled Entry'}
                          </h3>
                            <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold capitalize">
                                {entry.category}
                              </span>
                              <span className="flex items-center gap-1">
                                {getMoodEmoji(entry.mood)} {entry.mood}
                              </span>
                            <span>•</span>
                            <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(entry)}
                            className="text-blue-600 hover:text-blue-800 p-3 hover:bg-blue-50 rounded-xl transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
                            title="Edit entry"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                            className="text-red-600 hover:text-red-800 p-3 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
                            title="Delete entry"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                      <div className="prose max-w-none mb-6">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                        {entry.content}
                      </p>
                    </div>
                    
                      </div>
                    
                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Premium Sidebar */}
          <div className="space-y-6">
            {/* Journey Stats */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                  <span className="text-white text-lg">📊</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Your Journey</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <span className="text-gray-700 font-medium">Total Entries</span>
                  <span className="text-2xl font-bold text-purple-600">{entries.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <span className="text-gray-700 font-medium">This Month</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {entries.filter(e => new Date(e.created_at).getMonth() === new Date().getMonth()).length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <span className="text-gray-700 font-medium">Confessions</span>
                  <span className="text-2xl font-bold text-green-600">
                    {entries.filter(e => e.category === 'confession').length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-100">
                  <span className="text-gray-700 font-medium">Prayers</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {entries.filter(e => e.category === 'prayer').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Writing Prompts */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                    <span className="text-white text-lg">💡</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Writing Prompts</h3>
                </div>
                <button 
                  onClick={getRandomPrompt}
                  className="text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                >
                  Random
                </button>
              </div>
              
              {/* Prompt Categories */}
              <div className="space-y-4">
                {/* Gratitude Prompts */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="text-yellow-500">🙏</span> Gratitude & Blessings
                  </h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => handlePromptClick("What am I grateful for today? How has God blessed me in unexpected ways?")}
                      className="w-full text-left p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100 hover:from-yellow-100 hover:to-orange-100 transition-all duration-300 group"
                    >
                      <p className="font-medium text-gray-800 group-hover:text-yellow-700">What am I grateful for today?</p>
                      <p className="text-sm text-gray-600">Reflect on your blessings</p>
                    </button>
                    <button 
                      onClick={() => handlePromptClick("How has God shown His faithfulness in my life recently? What answered prayers can I celebrate?")}
                      className="w-full text-left p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100 hover:from-yellow-100 hover:to-orange-100 transition-all duration-300 group"
                    >
                      <p className="font-medium text-gray-800 group-hover:text-yellow-700">How has God been faithful?</p>
                      <p className="text-sm text-gray-600">Celebrate answered prayers</p>
                    </button>
                  </div>
                </div>

                {/* Reflection Prompts */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="text-blue-500">🤔</span> Reflection & Growth
                  </h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => handlePromptClick("What am I struggling with today? How can I surrender this to God and trust in His plan?")}
                      className="w-full text-left p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 group"
                    >
                      <p className="font-medium text-gray-800 group-hover:text-blue-700">What am I struggling with?</p>
                      <p className="text-sm text-gray-600">Be honest and open</p>
                    </button>
                    <button 
                      onClick={() => handlePromptClick("How did God speak to me today? What scripture, song, or moment touched my heart?")}
                      className="w-full text-left p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 group"
                    >
                      <p className="font-medium text-gray-800 group-hover:text-blue-700">How did God speak to me?</p>
                      <p className="text-sm text-gray-600">Listen to His voice</p>
                    </button>
                  </div>
                </div>

                {/* Prayer Prompts */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="text-green-500">🙏</span> Prayer & Intercession
                  </h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => handlePromptClick("Who needs my prayers today? How can I intercede for others and be a blessing?")}
                      className="w-full text-left p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 group"
                    >
                      <p className="font-medium text-gray-800 group-hover:text-green-700">Who needs my prayers?</p>
                      <p className="text-sm text-gray-600">Intercede for others</p>
                    </button>
                    <button 
                      onClick={() => handlePromptClick("What am I praying for? How can I align my heart with God's will in this situation?")}
                      className="w-full text-left p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 group"
                    >
                      <p className="font-medium text-gray-800 group-hover:text-green-700">What am I praying for?</p>
                      <p className="text-sm text-gray-600">Align with God's will</p>
                    </button>
                  </div>
                </div>

                {/* Spiritual Growth */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="text-purple-500">✨</span> Spiritual Growth
                  </h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => handlePromptClick("How am I growing in my faith? What spiritual disciplines am I practicing?")}
                      className="w-full text-left p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 group"
                    >
                      <p className="font-medium text-gray-800 group-hover:text-purple-700">How am I growing in faith?</p>
                      <p className="text-sm text-gray-600">Spiritual disciplines</p>
                    </button>
                    <button 
                      onClick={() => handlePromptClick("What sin or habit do I need to confess? How can I seek God's forgiveness and strength?")}
                      className="w-full text-left p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 group"
                    >
                      <p className="font-medium text-gray-800 group-hover:text-purple-700">What do I need to confess?</p>
                      <p className="text-sm text-gray-600">Seek forgiveness</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Entries */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                  <span className="text-white text-lg">📝</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Recent Entries</h3>
                <span className="text-xs text-gray-500">({entries.length} total)</span>
              </div>
              <div className="space-y-4">
                {(() => {
                  const recentEntries = entries.slice(0, 3);
                  
                  if (recentEntries.length === 0) {
                    return (
                      <div className="text-center py-6">
                        <div className="text-4xl mb-3">📝</div>
                        <p className="text-gray-500 text-sm">No entries yet</p>
                        <p className="text-gray-400 text-xs">Start your spiritual journey</p>
                      </div>
                    );
                  }
                  
                  return recentEntries.map((entry, index) => (
                    <div key={entry.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">
                          {entry.title || `Untitled ${entry.category}`}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                        {entry.content}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-purple-200 text-purple-700 rounded-full">
                            {getCategoryEmoji(entry.category)} {entry.category}
                          </span>
                          <span className="text-xs px-2 py-1 bg-pink-200 text-pink-700 rounded-full">
                            {getMoodEmoji(entry.mood)} {entry.mood}
                  </span>
                        </div>
                        <button
                          onClick={() => startEdit(entry)}
                          className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                        >
                          View →
                        </button>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>


          </div>
        </div>
      </div>
      
      <style jsx="true">{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

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
