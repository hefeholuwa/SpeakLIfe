import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookmarks: 0,
    totalHighlights: 0,
    totalConfessions: 0,
    totalReadingPlans: 0
  });

  // Daily content management
  const [dailyContent, setDailyContent] = useState({
    verse: '',
    confession: '',
    isGenerated: false
  });

  // User management
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load statistics
      const [bookmarksResult, highlightsResult, confessionsResult, plansResult] = await Promise.all([
        supabase.from('bible_bookmarks').select('*', { count: 'exact' }),
        supabase.from('bible_highlights').select('*', { count: 'exact' }),
        supabase.from('confession_journal').select('*', { count: 'exact' }),
        supabase.from('reading_plans').select('*', { count: 'exact' })
      ]);

      setStats({
        totalUsers: 0, // Will be updated when we get user data
        totalBookmarks: bookmarksResult.count || 0,
        totalHighlights: highlightsResult.count || 0,
        totalConfessions: confessionsResult.count || 0,
        totalReadingPlans: plansResult.count || 0
      });

      // Load recent activity
      await loadRecentActivity();
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Load recent bookmarks
      const { data: recentBookmarks } = await supabase
        .from('bible_bookmarks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Load recent confessions
      const { data: recentConfessions } = await supabase
        .from('confession_journal')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setUserStats({
        recentBookmarks: recentBookmarks || [],
        recentConfessions: recentConfessions || []
      });
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const generateDailyContent = async () => {
    try {
      setLoading(true);
      
      // Generate daily verse and confession using AI
      const response = await fetch('/api/generate-daily-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0]
        })
      });

      if (response.ok) {
        const data = await response.json();
        setDailyContent({
          verse: data.verse,
          confession: data.confession,
          isGenerated: true
        });
        
        // Save to database
        await supabase
          .from('daily_verses')
          .upsert({
            date: new Date().toISOString().split('T')[0],
            verse: data.verse,
            confession: data.confession,
            created_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error generating daily content:', error);
      alert('Failed to generate daily content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async (tableName) => {
    if (!confirm(`Are you sure you want to clear all ${tableName}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from(tableName)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) throw error;
      
      alert(`All ${tableName} data has been cleared.`);
      await loadDashboardData();
    } catch (error) {
      console.error(`Error clearing ${tableName}:`, error);
      alert(`Failed to clear ${tableName} data.`);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (tableName) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*');

      if (error) throw error;

      const csvContent = convertToCSV(data);
      downloadCSV(csvContent, `${tableName}_export.csv`);
    } catch (error) {
      console.error(`Error exporting ${tableName}:`, error);
      alert(`Failed to export ${tableName} data.`);
    }
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ];
    
    return csvRows.join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && activeTab === 'overview') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">🔧 Admin Dashboard</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    activeTab === 'overview' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  📊 Overview
                </button>
                <button
                  onClick={() => setActiveTab('content')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    activeTab === 'content' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  📝 Content
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    activeTab === 'users' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  👥 Users
                </button>
                <button
                  onClick={() => setActiveTab('data')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    activeTab === 'data' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  💾 Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    👥
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    🔖
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Bookmarks</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBookmarks}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    ✨
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Highlights</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalHighlights}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    💭
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Confessions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalConfessions}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                    📚
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Reading Plans</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalReadingPlans}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔖 Recent Bookmarks</h3>
                <div className="space-y-3">
                  {userStats.recentBookmarks?.map((bookmark) => (
                    <div key={bookmark.id} className="border border-gray-200 rounded-lg p-3">
                      <p className="font-medium text-sm text-gray-900">
                        {bookmark.book} {bookmark.chapter}:{bookmark.verse}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {bookmark.text}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(bookmark.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  )) || <p className="text-gray-500 text-sm">No recent bookmarks</p>}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💭 Recent Confessions</h3>
                <div className="space-y-3">
                  {userStats.recentConfessions?.map((confession) => (
                    <div key={confession.id} className="border border-gray-200 rounded-lg p-3">
                      <p className="font-medium text-sm text-gray-900">
                        {confession.title || 'Untitled Entry'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {confession.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(confession.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  )) || <p className="text-gray-500 text-sm">No recent confessions</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Management Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Daily Content Management</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Today's Verse
                  </label>
                  <textarea
                    value={dailyContent.verse}
                    onChange={(e) => setDailyContent({...dailyContent, verse: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-20"
                    placeholder="Enter today's Bible verse..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Today's Confession
                  </label>
                  <textarea
                    value={dailyContent.confession}
                    onChange={(e) => setDailyContent({...dailyContent, confession: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-20"
                    placeholder="Enter today's confession..."
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={generateDailyContent}
                    disabled={loading}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : '🤖 Generate with AI'}
                  </button>
                  
                  <button
                    onClick={() => setDailyContent({...dailyContent, isGenerated: true})}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    💾 Save Content
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Management Tab */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💾 Data Management</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Export Data</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => exportData('bible_bookmarks')}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      📤 Export Bookmarks
                    </button>
                    <button
                      onClick={() => exportData('bible_highlights')}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      📤 Export Highlights
                    </button>
                    <button
                      onClick={() => exportData('confession_journal')}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      📤 Export Confessions
                    </button>
                    <button
                      onClick={() => exportData('reading_plans')}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      📤 Export Reading Plans
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Clear Data</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => clearAllData('bible_bookmarks')}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      🗑️ Clear Bookmarks
                    </button>
                    <button
                      onClick={() => clearAllData('bible_highlights')}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      🗑️ Clear Highlights
                    </button>
                    <button
                      onClick={() => clearAllData('confession_journal')}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      🗑️ Clear Confessions
                    </button>
                    <button
                      onClick={() => clearAllData('reading_plans')}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      🗑️ Clear Reading Plans
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 User Management</h3>
              <p className="text-gray-600">User management features will be available here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
