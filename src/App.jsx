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
      <div className="flex items-center justify-center min-h-screen bg-blue-50">
        <p className="text-blue-700 text-xl font-medium animate-pulse">
          Loading SpeakLife Topics...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center py-10">
      <h1 className="text-4xl font-extrabold text-blue-800 mb-8 animate-fade-in-down">
        SpeakLife Topics 🔥
      </h1>

      {topics.length === 0 ? (
        <p className="text-gray-600 text-lg animate-fade-in">
          No topics found. Add some in your Supabase dashboard.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 px-4 w-full max-w-5xl">
          {topics.map((topic, index) => (
            <div
              key={topic.id}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in-up opacity-0"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'forwards'
              }}
            >
              <h2 className="text-2xl font-bold text-blue-700 mb-2 animate-fade-in">
                {topic.title}
              </h2>
              <p className="text-gray-600 text-base leading-relaxed animate-fade-in">
                {topic.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
