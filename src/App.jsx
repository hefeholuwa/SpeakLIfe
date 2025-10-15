import { useEffect, useState } from 'react'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading for smooth experience
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="text-6xl mb-6 animate-pulse">✨</div>
          <p className="text-slate-600 text-xl font-light tracking-wide animate-pulse">
            Preparing your spiritual journey...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation Bar */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-indigo-100/50 sticky top-0 z-50 animate-fade-in-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="text-2xl">✨</div>
              <h1 className="text-xl font-bold text-indigo-800 tracking-tight">SpeakLife</h1>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-slate-600 hover:text-indigo-600 transition-colors duration-200 font-medium text-sm tracking-wide">
                About
              </a>
              <a href="#features" className="text-slate-600 hover:text-indigo-600 transition-colors duration-200 font-medium text-sm tracking-wide">
                Features
              </a>
              <a href="#contact" className="text-slate-600 hover:text-indigo-600 transition-colors duration-200 font-medium text-sm tracking-wide">
                Contact
              </a>
              <button className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition-all duration-200 font-medium text-sm tracking-wide shadow-sm hover:shadow-md">
                Start Journey
              </button>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-slate-600 hover:text-indigo-600 transition-colors duration-200">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-screen flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/30 via-transparent to-purple-100/30"></div>
        
        {/* Floating Orbs with Complex Animations */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-indigo-400/30 to-purple-400/30 rounded-full blur-xl animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-float-medium"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-r from-pink-400/30 to-indigo-400/30 rounded-full blur-xl animate-float-fast"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-r from-indigo-300/20 to-purple-300/20 rounded-full blur-lg animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-gradient-to-r from-purple-300/25 to-pink-300/25 rounded-full blur-2xl animate-float-reverse"></div>
        
        {/* Particle Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-indigo-400/60 rounded-full animate-twinkle"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400/80 rounded-full animate-twinkle" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-pink-400/70 rounded-full animate-twinkle" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-indigo-300/90 rounded-full animate-twinkle" style={{animationDelay: '3s'}}></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center w-full">
          <div className="mb-8 animate-fade-in-down">
            {/* Animated Sparkle */}
            <div className="text-8xl mb-6 animate-bounce-gentle">✨</div>
            
            {/* Gradient Text with Animation */}
            <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-6 tracking-tight animate-gradient-x">
              SpeakLife
            </h1>
            
            {/* Staggered Text Animation */}
            <div className="space-y-2">
              <p className="text-2xl md:text-3xl text-slate-700 mb-4 font-light tracking-wide animate-slide-up" style={{animationDelay: '0.2s', animationFillMode: 'forwards', opacity: 0}}>
                Transform Your Life Through
              </p>
              <p className="text-3xl md:text-4xl text-indigo-600 font-bold mb-8 tracking-wide animate-slide-up" style={{animationDelay: '0.4s', animationFillMode: 'forwards', opacity: 0}}>
                The Power of Confession
              </p>
            </div>
          </div>
          
          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-down" style={{animationDelay: '0.6s', animationFillMode: 'forwards'}}>
            Discover the transformative power of speaking God's Word over your life. 
            Build your faith, strengthen your spirit, and watch your circumstances change 
            through the daily practice of biblical confession.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-down" style={{animationDelay: '0.8s', animationFillMode: 'forwards'}}>
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg tracking-wide shadow-lg hover:shadow-xl transform hover:-translate-y-2 hover:scale-105 animate-pulse-glow">
              Start Your Journey →
            </button>
            <button className="bg-white/80 text-indigo-600 px-8 py-4 rounded-full hover:bg-white transition-all duration-300 font-semibold text-lg tracking-wide shadow-lg hover:shadow-xl border border-indigo-200 hover:border-indigo-300 transform hover:-translate-y-1 hover:scale-105">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20" id="features">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-800 mb-4 tracking-tight animate-fade-in-up">
            Why Choose SpeakLife?
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto animate-fade-in-up" style={{animationDelay: '0.2s', animationFillMode: 'forwards', opacity: 0}}>
            Experience the life-changing power of speaking God's Word daily
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-indigo-100/50 hover:shadow-lg transition-all duration-500 hover:-translate-y-2 hover:scale-105 group animate-fade-in-up" style={{animationDelay: '0.1s', animationFillMode: 'forwards', opacity: 0}}>
            <div className="text-5xl mb-4 animate-bounce-gentle group-hover:animate-pulse">🙏</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors duration-300">Daily Confessions</h3>
            <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
              Start each day with powerful biblical confessions that align your heart with God's promises.
            </p>
          </div>
          
          <div className="text-center p-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-indigo-100/50 hover:shadow-lg transition-all duration-500 hover:-translate-y-2 hover:scale-105 group animate-fade-in-up" style={{animationDelay: '0.2s', animationFillMode: 'forwards', opacity: 0}}>
            <div className="text-5xl mb-4 animate-bounce-gentle group-hover:animate-pulse" style={{animationDelay: '0.5s'}}>📖</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors duration-300">Scripture-Based</h3>
            <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
              Every confession is rooted in God's Word, ensuring you speak truth and life into your circumstances.
            </p>
          </div>
          
          <div className="text-center p-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-indigo-100/50 hover:shadow-lg transition-all duration-500 hover:-translate-y-2 hover:scale-105 group animate-fade-in-up" style={{animationDelay: '0.3s', animationFillMode: 'forwards', opacity: 0}}>
            <div className="text-5xl mb-4 animate-bounce-gentle group-hover:animate-pulse" style={{animationDelay: '1s'}}>💪</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors duration-300">Transform Your Life</h3>
            <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
              Watch as your faith grows and your circumstances change through consistent confession practice.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
            </div>
            
            <div className="border-t border-white/20 pt-8 animate-fade-in-up" style={{animationDelay: '0.4s', animationFillMode: 'forwards', opacity: 0}}>
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-center md:text-left">
                  <p className="text-indigo-100 text-lg font-semibold mb-2">
                    Powered by The Pillars Prayer Network
                  </p>
                  <p className="text-indigo-200 text-sm">
                    Building lives around sound truth — one confession at a time
                  </p>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🙏</div>
                    <p className="text-xs text-indigo-200">Prayer</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">📖</div>
                    <p className="text-xs text-indigo-200">Word</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">💪</div>
                    <p className="text-xs text-indigo-200">Faith</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-indigo-200 text-sm">
                  © 2024 The Pillars Prayer Network. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
