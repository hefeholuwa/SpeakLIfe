import { Card } from './ui/card'
import { Button } from './ui/button'

const topics = [
  { 
    name: "Faith", 
    icon: "✨", 
    gradient: "from-yellow-400 via-orange-500 to-red-500",
    verses: 42,
    description: "Believe and receive"
  },
  { 
    name: "Peace", 
    icon: "🛡️", 
    gradient: "from-blue-400 via-blue-500 to-indigo-600",
    verses: 38,
    description: "God's protection"
  },
  { 
    name: "Love", 
    icon: "❤️", 
    gradient: "from-pink-400 via-red-500 to-pink-600",
    verses: 51,
    description: "Unconditional love"
  },
  { 
    name: "Wisdom", 
    icon: "💡", 
    gradient: "from-amber-400 via-yellow-500 to-orange-500",
    verses: 35,
    description: "Divine understanding"
  },
  { 
    name: "Prosperity", 
    icon: "💰", 
    gradient: "from-green-400 via-emerald-500 to-teal-600",
    verses: 29,
    description: "Abundant blessings"
  },
  { 
    name: "Relationships", 
    icon: "👥", 
    gradient: "from-purple-400 via-violet-500 to-purple-600",
    verses: 33,
    description: "Godly connections"
  },
]

const TopicLibrary = () => {
  return (
    <Card className="p-8 bg-gradient-to-br from-white to-gray-50 border-0 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
            <span className="text-white text-2xl">📚</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Explore Topics</h2>
            <p className="text-gray-600">Discover spiritual themes</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="bg-purple-100 text-purple-600 border-purple-200 hover:bg-purple-200">
          View All
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic, index) => (
          <Card 
            key={topic.name}
            className="group p-6 cursor-pointer bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in rounded-2xl"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="space-y-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${topic.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <span className="text-3xl">{topic.icon}</span>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{topic.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{topic.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-purple-600">{topic.verses} verses</span>
                  <div className="w-8 h-1 bg-purple-200 rounded-full">
                    <div className="w-6 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  )
}

export default TopicLibrary