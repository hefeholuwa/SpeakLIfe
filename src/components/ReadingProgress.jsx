import { Card } from './ui/card'
import { Progress } from './ui/progress'
import { Button } from './ui/button'

const ReadingProgress = ({ onNavigate }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)]"></div>
      
      <Card className="relative p-4 sm:p-6 border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
        {/* Premium Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6">
          <div className="flex items-center gap-4 mb-4 lg:mb-0">
            <div className="relative">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-2xl">
                <span className="text-white text-2xl">📖</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
                Reading Journey
              </h2>
              <p className="text-sm text-gray-600 mt-1">Continue your spiritual growth</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="lg" 
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => {
              // Show coming soon popup
              const modal = document.createElement('div')
              modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in'
              modal.innerHTML = `
                <div class="bg-white rounded-3xl p-8 max-w-md mx-4 shadow-2xl animate-scale-in border border-gray-100">
                  <div class="text-center">
                    <div class="text-8xl mb-6 animate-bounce">📈</div>
                    <h3 class="text-3xl font-bold text-gray-800 mb-3">Reading Statistics</h3>
                    <p class="text-gray-600 mb-8 text-lg">Track your Bible reading progress with detailed analytics and insights.</p>
                    
                    <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8 border border-purple-100">
                      <div class="flex items-center justify-center gap-3 mb-3">
                        <div class="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                        <div class="w-3 h-3 bg-pink-500 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                        <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                      </div>
                      <p class="text-purple-700 font-semibold text-lg">✨ Coming Soon!</p>
                      <p class="text-purple-600 text-sm mt-2">We're working hard to bring you detailed reading analytics</p>
                    </div>
                    
                    <button class="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105" onclick="this.closest('.fixed').remove()">
                      Got it! 🙌
                    </button>
          </div>
        </div>
              `
              
              // Add custom styles
              const style = document.createElement('style')
              style.textContent = `
                @keyframes fade-in {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                @keyframes scale-in {
                  from { transform: scale(0.8); opacity: 0; }
                  to { transform: scale(1); opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                .animate-scale-in { animation: scale-in 0.3s ease-out; }
              `
              document.head.appendChild(style)
              document.body.appendChild(modal)
              
              // Close modal when clicking outside
              modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                  modal.remove()
                  style.remove()
                }
              })
              
              // Auto close after 5 seconds
              setTimeout(() => {
                if (modal.parentNode) {
                  modal.remove()
                  style.remove()
                }
              }, 5000)
            }}
          >
            <span className="mr-2">📈</span>
          Stats
        </Button>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Reading Plans Card */}
          <Card className="group relative p-4 cursor-pointer bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 rounded-2xl overflow-hidden">
            {/* Premium Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10 space-y-4">
              {/* Premium Icon */}
              <div className="relative">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-2xl bg-gradient-to-br from-green-500 to-blue-500">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">📖</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
              </div>
              
              {/* Premium Content */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                    Reading Plans
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Create and manage your daily Bible reading schedule. Track your progress and stay consistent in your spiritual journey.
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-purple-600">Coming Soon</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Plans</span>
                    <div className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300">→</div>
                  </div>
          </div>
          </div>
        </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
          </Card>

          {/* Progress Tracking Card */}
          <Card className="group relative p-4 cursor-pointer bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 rounded-2xl overflow-hidden">
            {/* Premium Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10 space-y-4">
              {/* Premium Icon */}
              <div className="relative">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-2xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">📊</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
              </div>
              
              {/* Premium Content */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                    Progress Tracking
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Monitor your reading progress with detailed analytics and insights. See your spiritual growth over time.
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-purple-600">Coming Soon</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Analytics</span>
                    <div className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300">→</div>
                  </div>
          </div>
          </div>
            </div>
            
            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
          </Card>
        </div>

        <Button 
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 font-bold text-sm py-4 mt-6" 
          size="sm" 
          onClick={() => onNavigate?.('bible')}
        >
          <span className="text-lg mr-2">🚀</span>
          Start Reading Bible
        </Button>
      </Card>
      
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
      </div>
  )
}

export default ReadingProgress