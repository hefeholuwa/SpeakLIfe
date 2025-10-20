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
    action: "bible"
  },
  {
    name: "Confession Journal",
    icon: "📝",
    description: "Write your thoughts",
    gradient: "from-purple-500 to-pink-500",
    textColor: "text-white",
    action: "confessions"
  },
  {
    name: "Reading Plans",
    icon: "📚",
    description: "Daily Bible reading",
    gradient: "from-green-500 to-teal-600",
    textColor: "text-white",
    action: "plans"
  },
  {
    name: "Bookmarks",
    icon: "🔖",
    description: "Saved verses",
    gradient: "from-orange-500 to-red-500",
    textColor: "text-white",
    action: "bookmarks"
  },
  {
    name: "Highlights",
    icon: "✨",
    description: "Marked verses",
    gradient: "from-yellow-500 to-orange-500",
    textColor: "text-white",
    action: "highlights"
  },
  {
    name: "Notifications",
    icon: "🔔",
    description: "Set reminders",
    gradient: "from-indigo-500 to-purple-600",
    textColor: "text-white",
    action: "notifications"
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
          console.log('Unknown action:', action)
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
    <Card className="p-8 bg-gradient-to-br from-white to-gray-50 border-0 shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
          <span className="text-white text-2xl">⚡</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
          <p className="text-gray-600 text-sm">Access your spiritual tools</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <Button
            key={action.name}
            className={`group h-auto p-6 flex-col items-start gap-4 bg-gradient-to-br ${action.gradient} ${action.textColor} hover:scale-102 transition-all duration-200 shadow-lg hover:shadow-2xl border-0 ${loading === action.action ? 'opacity-75' : ''}`}
            onClick={() => handleAction(action.action)}
            disabled={loading === action.action}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-3xl group-hover:scale-105 transition-transform duration-200">{action.icon}</span>
              <div className="w-2 h-2 bg-white/30 rounded-full group-hover:bg-white/60 transition-colors"></div>
            </div>
            <div className="text-left w-full">
              <p className="font-bold text-lg mb-1">{action.name}</p>
              <p className="text-sm opacity-90">{action.description}</p>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  )
}

export default QuickActions