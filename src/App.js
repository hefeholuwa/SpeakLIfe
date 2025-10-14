import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

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

  if (loading) return <p>Loading...</p>

  return (
    <div className="app-container">
      <h1 className="title">SpeakLife Topics 🔥</h1>
      {topics.length === 0 ? (
        <p className="subtitle">No topics found. Add some in your Supabase dashboard.</p>
      ) : (
        topics.map(topic => (
          <div key={topic.id} className="topic-card">
            <h2 className="title">{topic.title}</h2>
            <p className="subtitle">{topic.description}</p>
          </div>
        ))
      )}
    </div>
  )
}

export default App
