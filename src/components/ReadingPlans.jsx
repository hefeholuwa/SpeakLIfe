import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.jsx';

const ReadingPlans = () => {
  const [plans, setPlans] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);

  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    plan_type: 'daily',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_active: true
  });

  const [entryForm, setEntryForm] = useState({
    day_number: 1,
    book: '',
    start_chapter: 1,
    end_chapter: 1,
    start_verse: 1,
    end_verse: null,
    notes: ''
  });

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (selectedPlan) {
      loadPlanEntries(selectedPlan.id);
    }
  }, [selectedPlan]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reading_plans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlanEntries = async (planId) => {
    try {
      const { data, error } = await supabase
        .from('reading_plan_entries')
        .select('*')
        .eq('plan_id', planId)
        .order('day_number', { ascending: true });
      
      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading plan entries:', error);
    }
  };

  const savePlan = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        const { error } = await supabase
          .from('reading_plans')
          .update(planForm)
          .eq('id', editingPlan.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reading_plans')
          .insert([planForm]);
        
        if (error) throw error;
      }
      
      await loadPlans();
      resetPlanForm();
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const saveEntry = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('reading_plan_entries')
        .insert([{
          ...entryForm,
          plan_id: selectedPlan.id
        }]);
      
      if (error) throw error;
      await loadPlanEntries(selectedPlan.id);
      resetEntryForm();
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const toggleEntryCompletion = async (entryId, isCompleted) => {
    try {
      const { error } = await supabase
        .from('reading_plan_entries')
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        })
        .eq('id', entryId);
      
      if (error) throw error;
      await loadPlanEntries(selectedPlan.id);
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const deletePlan = async (planId) => {
    if (!confirm('Are you sure you want to delete this reading plan?')) return;
    
    try {
      const { error } = await supabase
        .from('reading_plans')
        .delete()
        .eq('id', planId);
      
      if (error) throw error;
      await loadPlans();
      if (selectedPlan?.id === planId) {
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const resetPlanForm = () => {
    setPlanForm({
      name: '',
      description: '',
      plan_type: 'daily',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      is_active: true
    });
    setEditingPlan(null);
    setShowPlanForm(false);
  };

  const resetEntryForm = () => {
    setEntryForm({
      day_number: entries.length + 1,
      book: '',
      start_chapter: 1,
      end_chapter: 1,
      start_verse: 1,
      end_verse: null,
      notes: ''
    });
    setShowEntryForm(false);
  };

  const startEditPlan = (plan) => {
    setPlanForm({
      name: plan.name,
      description: plan.description || '',
      plan_type: plan.plan_type,
      start_date: plan.start_date,
      end_date: plan.end_date || '',
      is_active: plan.is_active
    });
    setEditingPlan(plan);
    setShowPlanForm(true);
  };

  const getProgressPercentage = (plan) => {
    if (!plan.entries) return 0;
    const completed = plan.entries.filter(e => e.is_completed).length;
    return Math.round((completed / plan.entries.length) * 100);
  };

  const getBibleBooks = () => [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
    'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
    'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
    'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
    'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
    'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
    'Matthew', 'Mark', 'Luke', 'John', 'Acts',
    'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy',
    '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
    '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
    'Jude', 'Revelation'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reading plans...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Reading Plans</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowPlanForm(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  📚 New Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plans List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Your Plans</h3>
              <div className="space-y-4">
                {plans.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📚</div>
                    <p className="text-gray-500 mb-4">No reading plans yet</p>
                    <button
                      onClick={() => setShowPlanForm(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Create First Plan
                    </button>
                  </div>
                ) : (
                  plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPlan?.id === plan.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditPlan(plan);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePlan(plan.id);
                            }}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="capitalize">{plan.plan_type}</span>
                        <span>{plan.is_active ? '🟢 Active' : '🔴 Inactive'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Plan Details */}
          <div className="lg:col-span-2">
            {selectedPlan ? (
              <div className="space-y-6">
                {/* Plan Header */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedPlan.name}</h2>
                      <p className="text-gray-600 mt-1">{selectedPlan.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="capitalize">{selectedPlan.plan_type}</span>
                        <span>•</span>
                        <span>Started {new Date(selectedPlan.start_date).toLocaleDateString()}</span>
                        {selectedPlan.end_date && (
                          <>
                            <span>•</span>
                            <span>Ends {new Date(selectedPlan.end_date).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowEntryForm(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      ➕ Add Reading
                    </button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{getProgressPercentage(selectedPlan)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(selectedPlan)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Reading Entries */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📖 Reading Schedule</h3>
                  <div className="space-y-3">
                    {entries.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">📖</div>
                        <p className="text-gray-500 mb-4">No readings scheduled yet</p>
                        <button
                          onClick={() => setShowEntryForm(true)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Add First Reading
                        </button>
                      </div>
                    ) : (
                      entries.map((entry) => (
                        <div
                          key={entry.id}
                          className={`border rounded-lg p-4 transition-all ${
                            entry.is_completed
                              ? 'border-green-200 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => toggleEntryCompletion(entry.id, !entry.is_completed)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  entry.is_completed
                                    ? 'border-green-500 bg-green-500 text-white'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                {entry.is_completed && '✓'}
                              </button>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  Day {entry.day_number}: {entry.book} {entry.start_chapter}
                                  {entry.end_chapter && entry.end_chapter !== entry.start_chapter && `-${entry.end_chapter}`}
                                  {entry.start_verse && `:${entry.start_verse}`}
                                  {entry.end_verse && entry.end_verse !== entry.start_verse && `-${entry.end_verse}`}
                                </h4>
                                {entry.notes && (
                                  <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {entry.is_completed && entry.completed_at && (
                                <span>Completed {new Date(entry.completed_at).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Reading Plan</h3>
                <p className="text-gray-600">Choose a plan from the sidebar to view its details and progress</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plan Form Modal */}
      {showPlanForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPlan ? 'Edit Plan' : 'New Reading Plan'}
                </h2>
                <button
                  onClick={resetPlanForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={savePlan} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 30-Day Bible Reading Challenge"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={planForm.description}
                    onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-20"
                    placeholder="Describe your reading plan..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan Type
                    </label>
                    <select
                      value={planForm.plan_type}
                      onChange={(e) => setPlanForm({...planForm, plan_type: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="daily">📅 Daily</option>
                      <option value="weekly">📆 Weekly</option>
                      <option value="custom">⚙️ Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={planForm.start_date}
                      onChange={(e) => setPlanForm({...planForm, start_date: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date (optional)
                  </label>
                  <input
                    type="date"
                    value={planForm.end_date}
                    onChange={(e) => setPlanForm({...planForm, end_date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={planForm.is_active}
                    onChange={(e) => setPlanForm({...planForm, is_active: e.target.checked})}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                    Active plan
                  </label>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                  </button>
                  <button
                    type="button"
                    onClick={resetPlanForm}
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

      {/* Entry Form Modal */}
      {showEntryForm && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Reading Entry</h2>
                <button
                  onClick={resetEntryForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={saveEntry} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Day Number
                    </label>
                    <input
                      type="number"
                      value={entryForm.day_number}
                      onChange={(e) => setEntryForm({...entryForm, day_number: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Book *
                    </label>
                    <select
                      value={entryForm.book}
                      onChange={(e) => setEntryForm({...entryForm, book: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a book</option>
                      {getBibleBooks().map((book) => (
                        <option key={book} value={book}>{book}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Chapter *
                    </label>
                    <input
                      type="number"
                      value={entryForm.start_chapter}
                      onChange={(e) => setEntryForm({...entryForm, start_chapter: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Chapter
                    </label>
                    <input
                      type="number"
                      value={entryForm.end_chapter}
                      onChange={(e) => setEntryForm({...entryForm, end_chapter: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Verse
                    </label>
                    <input
                      type="number"
                      value={entryForm.start_verse}
                      onChange={(e) => setEntryForm({...entryForm, start_verse: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Verse
                    </label>
                    <input
                      type="number"
                      value={entryForm.end_verse}
                      onChange={(e) => setEntryForm({...entryForm, end_verse: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={entryForm.notes}
                    onChange={(e) => setEntryForm({...entryForm, notes: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-20"
                    placeholder="Add any notes about this reading..."
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add Reading
                  </button>
                  <button
                    type="button"
                    onClick={resetEntryForm}
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

export default ReadingPlans;
