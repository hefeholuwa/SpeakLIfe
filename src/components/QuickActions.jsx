import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'

const actions = [
  {
    name: "Open Bible",
    icon: "📖",
    description: "Read Scripture",
    gradient: "from-blue-500 to-purple-600",
    textColor: "text-white",
    action: "bible",
    status: "available"
  },
  {
    name: "Confession Journal",
    icon: "📝",
    description: "Write your thoughts",
    gradient: "from-purple-500 to-pink-500",
    textColor: "text-white",
    action: "confessions",
    status: "available"
  },
  {
    name: "Reading Plans",
    icon: "📚",
    description: "Daily Bible reading",
    gradient: "from-green-500 to-teal-600",
    textColor: "text-white",
    action: "plans",
    status: "coming-soon"
  },
  {
    name: "Bookmarks",
    icon: "🔖",
    description: "Saved verses",
    gradient: "from-orange-500 to-red-500",
    textColor: "text-white",
    action: "bookmarks",
    status: "coming-soon"
  },
  {
    name: "Highlights",
    icon: "✨",
    description: "Marked verses",
    gradient: "from-yellow-500 to-orange-500",
    textColor: "text-white",
    action: "highlights",
    status: "coming-soon"
  },
  {
    name: "Notifications",
    icon: "🔔",
    description: "Set reminders",
    gradient: "from-indigo-500 to-purple-600",
    textColor: "text-white",
    action: "notifications",
    status: "coming-soon"
  },
]

const QuickActions = ({ onNavigate }) => {
  const [loading, setLoading] = useState(null)

  const showComingSoonPopup = (feature, icon, description) => {
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in'
    modal.innerHTML = `
      <div class="bg-white rounded-3xl p-8 max-w-md mx-4 shadow-2xl animate-scale-in border border-gray-100">
        <div class="text-center">
          <div class="text-8xl mb-6 animate-bounce">${icon}</div>
          <h3 class="text-3xl font-bold text-gray-800 mb-3">${feature}</h3>
          <p class="text-gray-600 mb-8 text-lg">${description}</p>
          
          <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8 border border-purple-100">
            <div class="flex items-center justify-center gap-3 mb-3">
              <div class="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <div class="w-3 h-3 bg-pink-500 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
              <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
            </div>
            <p class="text-purple-700 font-semibold text-lg">✨ Coming Soon!</p>
            <p class="text-purple-600 text-sm mt-2">We're working hard to bring you this amazing feature</p>
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
  }

  const handleAction = async (action) => {
    try {
      setLoading(action)
      
      switch (action) {
        case 'bible':
          // Navigate to Bible section
          if (onNavigate) {
            onNavigate('bible')
          } else {
            window.location.href = '/bible'
          }
          break
          
        case 'confessions':
          // Navigate to confession journal section
          if (onNavigate) {
            onNavigate('confessions')
          } else {
            window.location.href = '/confessions'
          }
          break
          
        case 'plans':
          // Show coming soon alert
          showComingSoonPopup('Reading Plans', '📚', 'Create and manage your daily Bible reading schedule. Track your progress and stay consistent in your spiritual journey.')
          break
          
        case 'bookmarks':
          // Show coming soon alert
          showComingSoonPopup('Bookmarks', '🔖', 'Access your saved Bible verses. All your favorite scriptures in one place for easy reference and meditation.')
          break
          
        case 'highlights':
          // Show coming soon alert
          showComingSoonPopup('Highlights', '✨', 'View your highlighted Bible verses with different colors. Organize and categorize your spiritual insights.')
          break
          
        case 'notifications':
          // Show coming soon alert
          showComingSoonPopup('Notifications', '🔔', 'Set up daily reminders for verses, confessions, and reading plans. Stay connected with your spiritual journey.')
          break
          
        default:
      }
    } catch (error) {
      console.error('Error handling action:', error)
    } finally {
      setLoading(null)
    }
  }

  const openFocusMode = () => {
    // Create a simple focus mode modal
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50'
    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        <div class="text-center">
          <div class="text-6xl mb-4">🎯</div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">Focus Mode</h3>
          <p class="text-gray-600 mb-6">Distraction-free meditation time</p>
          <div class="space-y-4">
            <button class="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors">
              Start 5 Minutes
            </button>
            <button class="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
              Start 10 Minutes
            </button>
            <button class="w-full bg-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-600 transition-colors">
              Start 15 Minutes
            </button>
            <button class="w-full bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition-colors" onclick="this.closest('.fixed').remove()">
              Close
            </button>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(modal)
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove()
      }
    })
  }

  const openNotificationSettings = () => {
    // Create notification settings modal
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50'
    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        <div class="text-center">
          <div class="text-6xl mb-4">🔔</div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">Notification Settings</h3>
          <p class="text-gray-600 mb-6">Manage your daily reminders</p>
          <div class="space-y-4">
            <div class="text-left">
              <label class="block text-sm font-medium text-gray-700 mb-2">Daily Verse Time</label>
              <input type="time" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" value="07:00">
            </div>
            <div class="text-left">
              <label class="block text-sm font-medium text-gray-700 mb-2">Confession Reminder</label>
              <input type="time" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" value="20:00">
            </div>
            <div class="text-left">
              <label class="block text-sm font-medium text-gray-700 mb-2">Reading Plan Reminder</label>
              <input type="time" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" value="19:00">
            </div>
            <div class="flex items-center">
              <input type="checkbox" id="enable-notifications" class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" checked>
              <label for="enable-notifications" class="ml-2 block text-sm text-gray-700">
                Enable notifications
              </label>
            </div>
            <button class="w-full bg-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-600 transition-colors">
              Save Settings
            </button>
            <button class="w-full bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition-colors" onclick="this.closest('.fixed').remove()">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(modal)
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove()
      }
    })
  }
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
          <span className="text-white text-2xl">⚡</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
        </div>
        <div>
              <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
                Quick Actions
              </h2>
              <p className="text-sm text-gray-600 mt-1">Access your spiritual tools and features</p>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <Card 
            key={action.name} 
            className="group relative p-4 cursor-pointer bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 rounded-2xl overflow-hidden"
            onClick={() => handleAction(action.action)}
          >
            {/* Premium Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${action.gradient.replace('from-', 'from-').replace('to-', 'to-')} rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700 opacity-20`}></div>
            
            <div className="relative z-10 space-y-4">
              {/* Premium Icon */}
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-2xl bg-gradient-to-br ${action.gradient}`}>
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{action.icon}</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
              </div>
              
              {/* Premium Content */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                    {action.name}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {action.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-purple-600">
                      {action.status === 'coming-soon' ? 'Coming Soon' : 'Available'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{action.name}</span>
                    <div className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300">→</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Hover Effect Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient.replace('from-', 'from-').replace('to-', 'to-')} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}></div>
          </Card>
        ))}
      </div>
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

export default QuickActions