import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../supabaseClient.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  Book,
  PenTool,
  Plus,
  Search,
  Filter,
  X,
  MoreVertical,
  Calendar,
  Heart,
  Smile,
  Frown,
  Meh,
  Sun,
  CloudRain,
  Trash2,
  Edit2,
  Lock,
  Unlock,
  ChevronDown,
  Sparkles,
  Quote
} from 'lucide-react';

const ConfessionJournal = ({ initialData }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'confession',
    mood: 'grateful',
    is_private: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        title: initialData.title || '',
        content: initialData.content || '',
        category: initialData.category || 'confession'
      }));
      setShowForm(true);
    }
  }, [initialData]);

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
    if (!user) return;

    try {
      const entryData = {
        ...formData,
        user_id: user.id
      };

      if (editingEntry) {
        const { error } = await supabase
          .from('confession_journal')
          .update(entryData)
          .eq('id', editingEntry.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('confession_journal')
          .insert([entryData]);

        if (error) throw error;
      }

      await loadEntries();
      resetForm();
      toast.success(editingEntry ? 'Entry updated successfully' : 'New entry created successfully');
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Failed to save entry. Please try again.');
    }
  };

  const deleteEntry = async (entryId) => {
    if (!user || !confirm('Are you sure you want to delete this entry?')) return;

    try {
      const { error } = await supabase
        .from('confession_journal')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadEntries();
      toast.success('Entry deleted successfully');
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry. Please try again.');
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
    setFormData(prev => ({ ...prev, content: promptText }));
    setShowForm(true);
  };

  const getRandomPrompt = () => {
    const prompts = [
      "What am I grateful for today?",
      "How has God shown His faithfulness recently?",
      "What am I struggling with that I need to surrender?",
      "Who needs my prayers today?",
      "What is God teaching me in this season?",
      "How can I be a blessing to someone today?"
    ];
    handlePromptClick(prompts[Math.floor(Math.random() * prompts.length)]);
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
    const matchesSearch = entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const actionConfig = {
    confession: {
      label: 'Declare',
      icon: Sparkles,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      description: "Speak life over your situation",
      defaultMood: 'hopeful'
    },
    prayer: {
      label: 'Pray',
      icon: Heart,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      description: "Talk to God",
      defaultMood: 'peaceful'
    },
    gratitude: {
      label: 'Thank',
      icon: Sun,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      description: "Count your blessings",
      defaultMood: 'grateful'
    },
    reflection: {
      label: 'Reflect',
      icon: Book,
      color: 'bg-teal-500',
      lightColor: 'bg-teal-50',
      textColor: 'text-teal-700',
      borderColor: 'border-teal-200',
      description: "Process your thoughts",
      defaultMood: 'reflective'
    }
  };

  const handleActionSelect = (category) => {
    setFormData(prev => ({
      ...prev,
      category,
      mood: actionConfig[category].defaultMood
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Spiritual Journal</h1>
          <p className="text-gray-500">Your sacred space to speak, pray, and reflect.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 flex items-center gap-2 active:scale-95 w-full md:w-auto justify-center"
          >
            <Plus size={20} />
            New Entry
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 animate-fade-in-up">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  {editingEntry ? 'Edit Entry' : 'New Entry'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">What's on your heart today?</p>
              </div>
              <button
                onClick={resetForm}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <form onSubmit={saveEntry} className="space-y-8">

              {/* Visual Action Chips */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">I want to...</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(actionConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    const isSelected = formData.category === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleActionSelect(key)}
                        className={`relative p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${isSelected
                          ? `${config.borderColor} ${config.lightColor}`
                          : 'border-transparent bg-gray-50 hover:bg-gray-100'
                          }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-white shadow-sm' : 'bg-gray-200'} transition-colors`}>
                          <Icon size={20} className={isSelected ? config.textColor : 'text-gray-500'} />
                        </div>
                        <span className={`text-sm font-bold ${isSelected ? config.textColor : 'text-gray-600'}`}>
                          {config.label}
                        </span>
                        {isSelected && (
                          <div className={`absolute inset-0 rounded-2xl border-2 ${config.borderColor} pointer-events-none`} />
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {actionConfig[formData.category]?.description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Content</label>
                <div className={`relative rounded-2xl border-2 transition-colors focus-within:border-gray-900 focus-within:ring-0 ${actionConfig[formData.category].borderColor} ${actionConfig[formData.category].lightColor} bg-opacity-30`}>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 pt-4 pb-2 bg-transparent border-none focus:ring-0 text-lg font-bold text-gray-900 placeholder-gray-400"
                    placeholder="Title (Optional)"
                  />
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 pb-4 pt-2 bg-transparent border-none focus:ring-0 min-h-[150px] resize-y text-gray-700 placeholder-gray-400 leading-relaxed"
                    placeholder={`Write your ${actionConfig[formData.category].label.toLowerCase()} here...`}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_private: !prev.is_private }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${formData.is_private
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-gray-50 text-gray-500'
                    }`}
                >
                  {formData.is_private ? <Lock size={16} /> : <Unlock size={16} />}
                  {formData.is_private ? 'Private' : 'Public'}
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 text-gray-500 font-bold hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-8 py-3 text-white rounded-xl font-bold shadow-lg transition-all transform active:scale-95 ${actionConfig[formData.category].color} hover:opacity-90`}
                  >
                    {editingEntry ? 'Save Changes' : 'Save Entry'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Entries List */}
          <div className="lg:col-span-2 space-y-6">

            {/* Search and Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search your journey..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 rounded-xl transition-all outline-none text-sm"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  All
                </button>
                {Object.entries(actionConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${filter === key
                      ? `${config.color} text-white`
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <config.icon size={14} />
                    {config.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Entries Grid */}
            <div className="space-y-4">
              {filteredEntries.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 border-dashed">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PenTool className="text-gray-400" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No entries found</h3>
                  <p className="text-gray-500 text-sm mb-6">Start your spiritual journey today.</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="text-purple-600 font-bold text-sm hover:underline"
                  >
                    Create New Entry
                  </button>
                </div>
              ) : (
                filteredEntries.map((entry) => {
                  const config = actionConfig[entry.category] || actionConfig.confession;
                  const Icon = config.icon;

                  return (
                    <div key={entry.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${config.lightColor} ${config.textColor}`}>
                            <Icon size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{entry.title || config.label}</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                              <span className={`${config.textColor}`}>{config.label}</span>
                              <span>•</span>
                              <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                              {entry.is_private && (
                                <>
                                  <span>•</span>
                                  <Lock size={12} />
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(entry)}
                            className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-base pl-16">
                        {entry.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar - Prompts & Stats */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl shadow-gray-900/20">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Sparkles size={18} className="text-yellow-400" />
                Your Journey
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="text-3xl font-black mb-1">{entries.length}</div>
                  <div className="text-xs text-gray-300 font-medium">Total Entries</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="text-3xl font-black mb-1">
                    {entries.filter(e => new Date(e.created_at).getMonth() === new Date().getMonth()).length}
                  </div>
                  <div className="text-xs text-gray-300 font-medium">This Month</div>
                </div>
              </div>
            </div>

            {/* Writing Prompts */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Quote size={18} className="text-purple-500" />
                  Inspiration
                </h3>
                <button
                  onClick={getRandomPrompt}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700"
                >
                  Shuffle
                </button>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => handlePromptClick("What am I grateful for today?")}
                  className="w-full text-left p-4 rounded-xl bg-gray-50 hover:bg-amber-50 hover:text-amber-700 transition-colors text-sm font-medium text-gray-600 group"
                >
                  <span className="block text-xs text-gray-400 mb-1 group-hover:text-amber-500">Gratitude</span>
                  What am I grateful for today?
                </button>
                <button
                  onClick={() => handlePromptClick("How has God shown His faithfulness?")}
                  className="w-full text-left p-4 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors text-sm font-medium text-gray-600 group"
                >
                  <span className="block text-xs text-gray-400 mb-1 group-hover:text-blue-500">Reflection</span>
                  How has God shown His faithfulness?
                </button>
                <button
                  onClick={() => handlePromptClick("What is God teaching me right now?")}
                  className="w-full text-left p-4 rounded-xl bg-gray-50 hover:bg-purple-50 hover:text-purple-700 transition-colors text-sm font-medium text-gray-600 group"
                >
                  <span className="block text-xs text-gray-400 mb-1 group-hover:text-purple-500">Growth</span>
                  What is God teaching me right now?
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfessionJournal;
