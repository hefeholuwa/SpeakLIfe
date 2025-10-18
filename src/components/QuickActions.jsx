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
    name: "Focus Mode",
    icon: "🎯",
    description: "Distraction-free meditation",
    gradient: "from-green-500 to-teal-600",
    textColor: "text-white",
    action: "focus"
  },
  {
    name: "Daily Reminder",
    icon: "🔔",
    description: "Set your time",
    gradient: "from-orange-500 to-red-500",
    textColor: "text-white",
    action: "reminder"
  },
  {
    name: "Saved Verses",
    icon: "📚",
    description: "Your favorites",
    gradient: "from-purple-500 to-pink-500",
    textColor: "text-white",
    action: "favorites"
  },
  {
    name: "AI Insights",
    icon: "✨",
    description: "Personalized wisdom",
    gradient: "from-yellow-500 to-orange-500",
    textColor: "text-white",
    action: "insights"
  },
]

const QuickActions = ({ onNavigate }) => {
  const [loading, setLoading] = useState(null)

  const handleAction = async (action) => {
    try {
      setLoading(action)
      
      switch (action) {
        case 'bible':
          // Navigate to Bible section
          if (onNavigate) {
            onNavigate('bible')
          } else {
            // Fallback: scroll to Bible section or show Bible modal
            const bibleSection = document.querySelector('[data-section="bible"]')
            if (bibleSection) {
              bibleSection.scrollIntoView({ behavior: 'smooth' })
            } else {
              alert('Bible section will be available soon!')
            }
          }
          break
          
        case 'focus':
          // Open focus mode (meditation timer)
          openFocusMode()
          break
          
        case 'reminder':
          // Open reminder settings
          openReminderSettings()
          break
          
        case 'favorites':
          // Navigate to saved verses
          if (onNavigate) {
            onNavigate('favorites')
          } else {
            alert('Your saved verses will be available soon!')
          }
          break
          
        case 'insights':
          // Navigate to AI insights
          if (onNavigate) {
            onNavigate('insights')
          } else {
            alert('AI insights will be available soon!')
          }
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

  const openReminderSettings = () => {
    // Create reminder settings modal
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50'
    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        <div class="text-center">
          <div class="text-6xl mb-4">🔔</div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">Daily Reminder</h3>
          <p class="text-gray-600 mb-6">Set your daily confession time</p>
          <div class="space-y-4">
            <div class="text-left">
              <label class="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <input type="time" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value="08:00">
            </div>
            <div class="text-left">
              <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <input type="text" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Time for your daily confession!" value="Time for your daily confession!">
            </div>
            <button class="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
              Save Reminder
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