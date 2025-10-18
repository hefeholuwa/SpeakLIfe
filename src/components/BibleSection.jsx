import React, { useState, useEffect } from 'react'
import ESVBibleReader from './bible/ESVBibleReader'
import { supabase } from '../lib/supabase'

const BibleSection = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);

  // Load bookmarks and highlights on component mount
  useEffect(() => {
    loadBookmarks();
    loadHighlights();
  }, []);

  const loadBookmarks = async () => {
    try {
      const { data, error } = await supabase
        .from('bible_bookmarks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const loadHighlights = async () => {
    try {
      const { data, error } = await supabase
        .from('bible_highlights')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setHighlights(data || []);
    } catch (error) {
      console.error('Error loading highlights:', error);
    }
  };

  const addBookmark = async (verse) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Please log in to bookmark verses');
        return;
      }

      const { data, error } = await supabase
        .from('bible_bookmarks')
        .insert({
          user_id: user.id,
          book: verse.book,
          chapter: verse.chapter,
          verse: verse.verse,
          text: verse.text
        });
      
      if (error) throw error;
      await loadBookmarks();
    } catch (error) {
      console.error('Error adding bookmark:', error);
      alert('Failed to bookmark verse. Please try again.');
    }
  };

  const addHighlight = async (verse, color = 'yellow') => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Please log in to highlight verses');
        return;
      }

      const { data, error } = await supabase
        .from('bible_highlights')
        .insert({
          user_id: user.id,
          book: verse.book,
          chapter: verse.chapter,
          verse: verse.verse,
          text: verse.text,
          color: color
        });
      
      if (error) throw error;
      await loadHighlights();
    } catch (error) {
      console.error('Error adding highlight:', error);
      alert('Failed to highlight verse. Please try again.');
    }
  };

  const removeBookmark = async (bookmarkId) => {
    try {
      const { error } = await supabase
        .from('bible_bookmarks')
        .delete()
        .eq('id', bookmarkId);
      
      if (error) throw error;
      await loadBookmarks();
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const removeHighlight = async (highlightId) => {
    try {
      const { error } = await supabase
        .from('bible_highlights')
        .delete()
        .eq('id', highlightId);
      
      if (error) throw error;
      await loadHighlights();
    } catch (error) {
      console.error('Error removing highlight:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Bible Study</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowBookmarks(!showBookmarks)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    showBookmarks 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  📖 Bookmarks ({bookmarks.length})
                </button>
                <button
                  onClick={() => setShowHighlights(!showHighlights)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    showHighlights 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  ✨ Highlights ({highlights.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Bible Reader */}
          <div className="lg:col-span-2">
            <ESVBibleReader 
              onBookmark={addBookmark}
              onHighlight={addHighlight}
              bookmarks={bookmarks}
              highlights={highlights}
            />
          </div>

          {/* Sidebar - Bookmarks & Highlights */}
          <div className="space-y-6">
            {/* Bookmarks Panel */}
            {showBookmarks && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">📖 Bookmarks</h3>
                  <button
                    onClick={() => setShowBookmarks(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {bookmarks.length === 0 ? (
                    <p className="text-gray-500 text-sm">No bookmarks yet</p>
                  ) : (
                    bookmarks.map((bookmark) => (
                      <div key={bookmark.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">
                              {bookmark.book} {bookmark.chapter}:{bookmark.verse}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {bookmark.text}
                            </p>
                          </div>
                          <button
                            onClick={() => removeBookmark(bookmark.id)}
                            className="text-red-400 hover:text-red-600 ml-2"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Highlights Panel */}
            {showHighlights && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">✨ Highlights</h3>
                  <button
                    onClick={() => setShowHighlights(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {highlights.length === 0 ? (
                    <p className="text-gray-500 text-sm">No highlights yet</p>
                  ) : (
                    highlights.map((highlight) => (
                      <div key={highlight.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">
                              {highlight.book} {highlight.chapter}:{highlight.verse}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {highlight.text}
                            </p>
                            <div className="flex items-center mt-2">
                              <div 
                                className={`w-3 h-3 rounded-full mr-2 ${
                                  highlight.color === 'yellow' ? 'bg-yellow-300' :
                                  highlight.color === 'blue' ? 'bg-blue-300' :
                                  highlight.color === 'green' ? 'bg-green-300' :
                                  highlight.color === 'pink' ? 'bg-pink-300' :
                                  'bg-gray-300'
                                }`}
                              ></div>
                              <span className="text-xs text-gray-500 capitalize">{highlight.color}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeHighlight(highlight.id)}
                            className="text-red-400 hover:text-red-600 ml-2"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BibleSection