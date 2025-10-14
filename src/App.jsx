import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient.jsx'

function App() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopics = async () => {
      const { data, error } = await supabase.from('topics').select('*')
      console.log("DATA:", data)
      console.log("ERROR:", error)
      if (!error) setTopics(data)
      setLoading(false)
    }
    fetchTopics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">✨</div>
          <p className="text-slate-600 text-lg font-light tracking-wide animate-pulse">
            Loading meaningful content...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 sticky top-0 z-50 animate-fade-in-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="text-2xl">✨</div>
              <h1 className="text-xl font-semibold text-slate-800 tracking-tight">SpeakLife</h1>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#topics" className="text-slate-600 hover:text-slate-900 transition-colors duration-200 font-medium text-sm tracking-wide">
                Topics
              </a>
              <a href="#about" className="text-slate-600 hover:text-slate-900 transition-colors duration-200 font-medium text-sm tracking-wide">
                About
              </a>
              <a href="#contact" className="text-slate-600 hover:text-slate-900 transition-colors duration-200 font-medium text-sm tracking-wide">
                Contact
              </a>
              <button className="bg-slate-800 text-white px-5 py-2 rounded-full hover:bg-slate-900 transition-all duration-200 font-medium text-sm tracking-wide shadow-sm hover:shadow-md">
                Get Started
              </button>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-slate-600 hover:text-slate-900 transition-colors duration-200">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-slate-800 mb-6 animate-fade-in-down tracking-tight">
            SpeakLife
          </h1>
          <p className="text-xl text-slate-600 mb-8 animate-fade-in-down" style={{animationDelay: '0.2s', animationFillMode: 'forwards'}}>
            Discover meaningful topics that inspire and uplift
          </p>
          <div className="flex justify-center animate-fade-in-down" style={{animationDelay: '0.4s', animationFillMode: 'forwards'}}>
            <button className="bg-slate-800 text-white px-8 py-3 rounded-full hover:bg-slate-900 transition-all duration-200 font-medium text-sm tracking-wide shadow-lg hover:shadow-xl">
              Explore Topics
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20" id="topics">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light text-slate-800 mb-4 tracking-tight">
            Featured Topics
          </h2>
          <div className="w-16 h-px bg-slate-300 mx-auto"></div>
        </div>

        {topics.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📖</div>
            <p className="text-slate-500 text-lg animate-fade-in">
              No topics found. Add some meaningful content to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic, index) => (
              <div
                key={topic.id}
                className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 hover:border-slate-300/50 hover:shadow-lg transition-all duration-500 hover:-translate-y-1 animate-fade-in-up opacity-0"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'forwards'
                }}
              >
                <div className="mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-colors duration-300">
                    <span className="text-xl">💭</span>
                  </div>
                  <h3 className="text-xl font-medium text-slate-800 mb-3 tracking-tight group-hover:text-slate-900 transition-colors duration-300">
                    {topic.title}
                  </h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm tracking-wide">
                  {topic.description}
                </p>
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button className="text-slate-500 hover:text-slate-700 text-sm font-medium tracking-wide transition-colors duration-200">
                    Read More →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
