import { Card } from './ui/card'
import { ScrollArea } from './ui/scroll-area'

const activities = [
  {
    verse: "Philippians 4:13",
    confession: "I can do all things through Christ who strengthens me. Today I declare that I am strong, capable, and victorious in every area of my life.",
    time: "2 hours ago",
    gradient: "from-green-400 to-emerald-500"
  },
  {
    verse: "Proverbs 3:5-6",
    confession: "I trust in the Lord with all my heart and lean not on my own understanding. In all my ways I acknowledge Him, and He directs my paths.",
    time: "Yesterday",
    gradient: "from-blue-400 to-cyan-500"
  },
  {
    verse: "Romans 8:28",
    confession: "All things are working together for my good because I love God and am called according to His purpose. Every situation is for my benefit.",
    time: "2 days ago",
    gradient: "from-purple-400 to-pink-500"
  },
  {
    verse: "Isaiah 40:31",
    confession: "As I wait on the Lord, He renews my strength. I will soar on wings like eagles, run and not grow weary, walk and not be faint.",
    time: "3 days ago",
    gradient: "from-orange-400 to-red-500"
  },
]

const RecentActivity = () => {
  return (
    <Card className="p-8 bg-gradient-to-br from-white to-gray-50 border-0 shadow-2xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
          <span className="text-white text-2xl">💬</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Recent Confessions</h2>
          <p className="text-gray-600">Your spiritual declarations</p>
        </div>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <div 
              key={index}
              className="group p-6 rounded-2xl bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${activity.gradient}`}></div>
                  <p className="font-bold text-lg text-purple-600">{activity.verse}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-lg">🕐</span>
                  {activity.time}
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-base">
                {activity.confession}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${activity.gradient}`}></div>
                  <span className="text-sm text-gray-500">Personal Declaration</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}

export default RecentActivity