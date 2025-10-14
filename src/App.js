import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { Box, Text, VStack, Spinner } from '@chakra-ui/react'

function App() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopics = async () => {
      const { data, error } = await supabase.from('topics').select('*')
      if (error) {
        console.error('Error fetching topics:', error)
      } else {
        setTopics(data)
      }
      setLoading(false)
    }
    fetchTopics()
  }, [])

  if (loading) {
    return (
      <Box bg="blue.50" minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="blue.700" />
      </Box>
    )
  }

  return (
    <Box bg="blue.50" minH="100vh" p={10}>
      <VStack spacing={4}>
        <Text fontSize="4xl" fontWeight="bold" color="blue.800">SpeakLife Topics 🔥</Text>
        {topics.length === 0 ? (
          <Text color="gray.600">No topics found. Add some in your Supabase dashboard.</Text>
        ) : (
          topics.map(topic => (
            <Box key={topic.id} bg="white" p={5} shadow="md" borderRadius="md" w="full" maxW="md">
              <Text fontSize="xl" fontWeight="bold">{topic.title}</Text>
              <Text color="gray.600">{topic.description}</Text>
            </Box>
          ))
        )}
      </VStack>
    </Box>
  )
}

export default App
