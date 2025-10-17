import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.jsx'
import notificationService from '../services/notificationService.js'

const ConfessionArea = () => {
  const [confessionText, setConfessionText] = useState('')
  const [confessionType, setConfessionType] = useState('repentance')
  const [emotionalState, setEmotionalState] = useState('peaceful')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedConfessions, setSubmittedConfessions] = useState([])
  const [confessionStreak, setConfessionStreak] = useState(0)
  const [spiritualLevel, setSpiritualLevel] = useState(1)
  const [dailyReflection, setDailyReflection] = useState('')
  const [dailyScripture, setDailyScripture] = useState('')
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  // Removed isGeneratingReflection state - no longer using AI generation
  const [nextReflectionTime, setNextReflectionTime] = useState(null)
  const [timeUntilNext, setTimeUntilNext] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [confessionHistory, setConfessionHistory] = useState([])
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showReminders, setShowReminders] = useState(false)
  const [notificationEnabled, setNotificationEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState('20:00')
  const [weeklyReminderDay, setWeeklyReminderDay] = useState(0)

  const confessionTypes = [
    { id: 'repentance', name: 'Repentance', emoji: '🙏', description: 'Confessing sins and seeking forgiveness', color: 'red' },
    { id: 'gratitude', name: 'Gratitude', emoji: '🙌', description: 'Expressing thankfulness to God', color: 'green' },
    { id: 'commitment', name: 'Commitment', emoji: '💪', description: 'Making promises to God', color: 'blue' },
    { id: 'praise', name: 'Praise', emoji: '🎉', description: 'Praising God for His goodness', color: 'yellow' },
    { id: 'petition', name: 'Petition', emoji: '🤲', description: 'Making requests to God', color: 'purple' },
    { id: 'testimony', name: 'Testimony', emoji: '✨', description: 'Sharing what God has done', color: 'pink' },
    { id: 'struggle', name: 'Struggle', emoji: '💔', description: 'Sharing your spiritual battles', color: 'gray' },
    { id: 'victory', name: 'Victory', emoji: '🏆', description: 'Celebrating spiritual breakthroughs', color: 'gold' }
  ]

  const emotionalStates = [
    { id: 'peaceful', name: 'Peaceful', emoji: '😌', description: 'Feeling calm and centered' },
    { id: 'struggling', name: 'Struggling', emoji: '😔', description: 'Going through difficulties' },
    { id: 'grateful', name: 'Grateful', emoji: '😊', description: 'Feeling blessed and thankful' },
    { id: 'anxious', name: 'Anxious', emoji: '😰', description: 'Feeling worried or stressed' },
    { id: 'hopeful', name: 'Hopeful', emoji: '🌟', description: 'Looking forward with faith' },
    { id: 'broken', name: 'Broken', emoji: '💔', description: 'Feeling hurt or wounded' }
  ]

  const confessionPrompts = {
    repentance: [
      "What specific sin or behavior do you need to confess to God today?",
      "How has this sin affected your relationship with God and others?",
      "What steps will you take to turn away from this sin?",
      "How do you feel God is calling you to change?"
    ],
    gratitude: [
      "What specific blessings has God given you today?",
      "How has God shown His love to you recently?",
      "What answered prayers can you thank God for?",
      "How has God's grace been evident in your life?"
    ],
    commitment: [
      "What promise do you want to make to God today?",
      "How will you serve God in the coming days?",
      "What spiritual discipline do you want to commit to?",
      "How will you honor God with your life?"
    ],
    praise: [
      "What aspect of God's character are you praising today?",
      "How has God's faithfulness been evident to you?",
      "What miracles or wonders has God performed in your life?",
      "How do you want to worship God today?"
    ],
    petition: [
      "What specific need are you bringing to God?",
      "How do you want God to work in your life?",
      "What prayer request is on your heart today?",
      "How do you need God's intervention in your situation?"
    ],
    testimony: [
      "What has God done in your life recently?",
      "How has God answered your prayers?",
      "What spiritual growth have you experienced?",
      "How has God's love transformed you?"
    ],
    struggle: [
      "What spiritual battle are you facing?",
      "How is the enemy trying to discourage you?",
      "What temptation are you struggling with?",
      "How do you need God's strength today?"
    ],
    victory: [
      "What spiritual breakthrough have you experienced?",
      "How has God given you victory over sin?",
      "What answered prayer are you celebrating?",
      "How has God's power been evident in your life?"
    ]
  }

  const relevantScriptures = {
    repentance: [
      "1 John 1:9 - If we confess our sins, he is faithful and just to forgive us our sins and to cleanse us from all unrighteousness.",
      "Psalm 51:10 - Create in me a clean heart, O God, and renew a right spirit within me.",
      "Acts 3:19 - Repent therefore, and turn back, that your sins may be blotted out."
    ],
    gratitude: [
      "1 Thessalonians 5:18 - Give thanks in all circumstances; for this is the will of God in Christ Jesus for you.",
      "Psalm 107:1 - Oh give thanks to the Lord, for he is good, for his steadfast love endures forever!",
      "Colossians 3:17 - And whatever you do, in word or deed, do everything in the name of the Lord Jesus, giving thanks to God the Father through him."
    ],
    commitment: [
      "Romans 12:1 - I appeal to you therefore, brothers, by the mercies of God, to present your bodies as a living sacrifice, holy and acceptable to God.",
      "Joshua 24:15 - As for me and my house, we will serve the Lord.",
      "Matthew 16:24 - If anyone would come after me, let him deny himself and take up his cross and follow me."
    ],
    praise: [
      "Psalm 150:6 - Let everything that has breath praise the Lord!",
      "Psalm 34:1 - I will bless the Lord at all times; his praise shall continually be in my mouth.",
      "Revelation 4:11 - Worthy are you, our Lord and God, to receive glory and honor and power."
    ],
    petition: [
      "Matthew 7:7 - Ask, and it will be given to you; seek, and you will find; knock, and it will be opened to you.",
      "Philippians 4:6 - Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.",
      "Jeremiah 33:3 - Call to me and I will answer you, and will tell you great and hidden things that you have not known."
    ],
    testimony: [
      "Psalm 66:16 - Come and hear, all you who fear God, and I will tell what he has done for my soul.",
      "Revelation 12:11 - They have conquered him by the blood of the Lamb and by the word of their testimony.",
      "Mark 5:19 - Go home to your friends and tell them how much the Lord has done for you."
    ],
    struggle: [
      "2 Corinthians 12:9 - My grace is sufficient for you, for my power is made perfect in weakness.",
      "1 Corinthians 10:13 - No temptation has overtaken you that is not common to man. God is faithful, and he will not let you be tempted beyond your ability.",
      "Ephesians 6:10 - Be strong in the Lord and in the strength of his might."
    ],
    victory: [
      "1 Corinthians 15:57 - But thanks be to God, who gives us the victory through our Lord Jesus Christ.",
      "Romans 8:37 - In all these things we are more than conquerors through him who loved us.",
      "2 Corinthians 2:14 - But thanks be to God, who in Christ always leads us in triumphal procession."
    ]
  }

  // Check for existing daily reflection or generate new one
  useEffect(() => {
    checkAndLoadDailyReflection()
    setupNextReflectionTimer()
  }, [])

  // Timer countdown effect
  useEffect(() => {
    if (!nextReflectionTime) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const nextTime = new Date(nextReflectionTime).getTime()
      const timeLeft = nextTime - now

      if (timeLeft <= 0) {
        setTimeUntilNext('New reflection available!')
        // Just reload from database when timer expires
        checkAndLoadDailyReflection()
        setupNextReflectionTimer()
        return
      }

      const hours = Math.floor(timeLeft / (1000 * 60 * 60))
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

      setTimeUntilNext(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [nextReflectionTime])

  // Load reflection when confession type changes (database only)
  useEffect(() => {
    checkAndLoadDailyReflection()
  }, [confessionType])

  // Calculate spiritual level based on confessions
  useEffect(() => {
    const level = Math.floor(submittedConfessions.length / 10) + 1
    setSpiritualLevel(Math.min(level, 10))
  }, [submittedConfessions])

  // Calculate confession streak
  useEffect(() => {
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    
    let streak = 0
    const confessionDates = submittedConfessions.map(c => new Date(c.date).toDateString())
    
    for (let i = 0; i < confessionDates.length; i++) {
      const confessionDate = new Date(confessionDates[i])
      const expectedDate = new Date(Date.now() - (streak * 86400000))
      
      if (confessionDate.toDateString() === expectedDate.toDateString()) {
        streak++
      } else {
        break
      }
    }
    
    setConfessionStreak(streak)
  }, [submittedConfessions])

  // Load confession streak from database
  useEffect(() => {
    loadConfessionStreak()
    loadConfessionHistory()
    initializeNotifications()
  }, [])

  // Initialize notifications
  const initializeNotifications = async () => {
    try {
      const status = notificationService.getStatus()
      setNotificationEnabled(status.enabled)
      
      if (status.supported && status.permission === 'default') {
        // Request permission on first visit
        await notificationService.requestPermission()
        await notificationService.registerServiceWorker()
        setNotificationEnabled(true)
      }
    } catch (error) {
      console.error('Error initializing notifications:', error)
    }
  }

  // Enable notifications
  const enableNotifications = async () => {
    try {
      await notificationService.requestPermission()
      await notificationService.registerServiceWorker()
      setNotificationEnabled(true)
      
      // Schedule daily reminder
      notificationService.scheduleDailyReminder(reminderTime)
      
      // Schedule weekly reminder
      notificationService.scheduleWeeklyReminder(weeklyReminderDay)
      
      alert('Notifications enabled! You\'ll receive daily reminders for your spiritual practice.')
    } catch (error) {
      console.error('Error enabling notifications:', error)
      alert('Failed to enable notifications. Please check your browser settings.')
    }
  }

  // Disable notifications
  const disableNotifications = () => {
    notificationService.cancelAllNotifications()
    setNotificationEnabled(false)
    alert('Notifications disabled.')
  }

  // Update reminder time
  const updateReminderTime = (newTime) => {
    setReminderTime(newTime)
    if (notificationEnabled) {
      notificationService.cancelAllNotifications()
      notificationService.scheduleDailyReminder(newTime)
    }
  }

  // Update weekly reminder day
  const updateWeeklyReminderDay = (day) => {
    setWeeklyReminderDay(day)
    if (notificationEnabled) {
      notificationService.scheduleWeeklyReminder(day)
    }
  }

  const loadConfessionStreak = async () => {
    try {
      // Get confessions from the last 30 days to calculate streak
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { data: confessions, error } = await supabase
        .from('user_confessions')
        .select('*')
        .is('user_id', null)
        .gte('confessed_at', thirtyDaysAgo.toISOString())
        .order('confessed_at', { ascending: false })

      if (error) {
        console.error('Error loading confessions:', error)
        return
      }

      if (confessions && confessions.length > 0) {
        // Calculate streak from database confessions
        let streak = 0
        let currentDate = new Date()
        currentDate.setHours(0, 0, 0, 0)

        // Group confessions by date
        const confessionsByDate = {}
        confessions.forEach(confession => {
          const date = new Date(confession.confessed_at).toDateString()
          if (!confessionsByDate[date]) {
            confessionsByDate[date] = []
          }
          confessionsByDate[date].push(confession)
        })

        // Calculate consecutive days
        for (let i = 0; i < 30; i++) {
          const checkDate = new Date(currentDate)
          checkDate.setDate(checkDate.getDate() - i)
          const dateString = checkDate.toDateString()

          if (confessionsByDate[dateString]) {
            streak++
          } else {
            break
          }
        }

        setConfessionStreak(streak)
      }
    } catch (error) {
      console.error('Error loading confession streak:', error)
    }
  }

  const loadConfessionHistory = async () => {
    try {
      const { data: confessions, error } = await supabase
        .from('user_confessions')
        .select('*')
        .is('user_id', null)
        .order('confessed_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error loading confession history:', error)
        return
      }

      if (confessions) {
        setConfessionHistory(confessions)
      }
    } catch (error) {
      console.error('Error loading confession history:', error)
    }
  }

  const getAnalytics = () => {
    const totalConfessions = confessionHistory.length
    const thisWeek = confessionHistory.filter(c => {
      const confessionDate = new Date(c.confessed_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return confessionDate >= weekAgo
    }).length

    const typeCounts = confessionHistory.reduce((acc, confession) => {
      const type = confession.personalization_factors?.confession_type || 'unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    const emotionalCounts = confessionHistory.reduce((acc, confession) => {
      const emotion = confession.personalization_factors?.emotional_state || 'unknown'
      acc[emotion] = (acc[emotion] || 0) + 1
      return acc
    }, {})

    return {
      totalConfessions,
      thisWeek,
      typeCounts,
      emotionalCounts,
      averagePerWeek: totalConfessions > 0 ? Math.round((totalConfessions / Math.max(1, Math.floor((Date.now() - new Date(confessionHistory[0]?.confessed_at).getTime()) / (1000 * 60 * 60 * 24 * 7)))) * 10) / 10 : 0
    }
  }

  const exportConfessions = () => {
    const data = confessionHistory.map(confession => ({
      date: new Date(confession.confessed_at).toLocaleDateString(),
      time: new Date(confession.confessed_at).toLocaleTimeString(),
      confession: confession.note,
      type: confession.personalization_factors?.confession_type || 'Unknown',
      emotionalState: confession.personalization_factors?.emotional_state || 'Unknown',
      spiritualLevel: confession.personalization_factors?.spiritual_level || 1
    }))

    const csvContent = [
      ['Date', 'Time', 'Confession', 'Type', 'Emotional State', 'Spiritual Level'],
      ...data.map(row => [
        row.date,
        row.time,
        `"${row.confession.replace(/"/g, '""')}"`,
        row.type,
        row.emotionalState,
        row.spiritualLevel
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `confession-journal-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!confessionText.trim()) return

    setIsSubmitting(true)
    
    try {
      // Save confession to database
      const { data, error } = await supabase
        .from('user_confessions')
        .insert({
          user_id: null, // No user constraint for demo
          note: confessionText,
          ai_suggested: false,
          personalization_factors: {
            confession_type: confessionType,
            emotional_state: emotionalState,
            spiritual_level: spiritualLevel
          }
        })
        .select()

      if (error) {
        console.error('Error saving confession:', error)
        // Fallback to local storage if database fails
        const newConfession = {
          id: Date.now(),
          type: confessionType,
          emotionalState: emotionalState,
          text: confessionText,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          spiritualLevel: spiritualLevel
        }
        setSubmittedConfessions(prev => [newConfession, ...prev])
      } else {
        // Successfully saved to database
        const newConfession = {
          id: data[0].id,
          type: confessionType,
          emotionalState: emotionalState,
          text: confessionText,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          spiritualLevel: spiritualLevel
        }
        setSubmittedConfessions(prev => [newConfession, ...prev])
        
        // Reload streak and history from database
        loadConfessionStreak()
        loadConfessionHistory()
      }
    } catch (error) {
      console.error('Error saving confession:', error)
    }

    setConfessionText('')
    setIsSubmitting(false)
  }

  const setupNextReflectionTimer = () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0) // Set to midnight tomorrow
    
    setNextReflectionTime(tomorrow.toISOString())
  }

  const checkAndLoadDailyReflection = async () => {
    try {
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      
      // Check if reflection exists for today
      const { data: existingReflection, error } = await supabase
        .from('daily_reflections')
        .select('*')
        .eq('date', today)
        .maybeSingle()

      if (error) {
        console.error('Error checking daily reflection:', error)
        return
      }

      if (existingReflection) {
        // Load existing reflection
        setDailyReflection(existingReflection.reflection)
        setDailyScripture(existingReflection.scripture || '')
      } else {
        // No reflection for today, show fallback message
        setDailyReflection('No reflection available for today. Check back tomorrow!')
        setDailyScripture('')
      }
    } catch (error) {
      console.error('Error checking daily reflection:', error)
      // Fallback message
      setDailyReflection('Unable to load reflection. Please try again later.')
      setDailyScripture('')
    }
  }

  const saveDailyReflection = async (reflection, scripture) => {
    try {
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      
      // First try to update existing record
      const { data: existing, error: selectError } = await supabase
        .from('daily_reflections')
        .select('id')
        .eq('date', today)
        .maybeSingle()

      if (selectError) {
        console.error('Error checking existing reflection:', selectError)
        return
      }

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('daily_reflections')
          .update({
            reflection: reflection,
            scripture: scripture,
            confession_type: confessionType,
            spiritual_level: spiritualLevel,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)

        if (error) {
          console.error('Error updating daily reflection:', error)
        }
      } else {
        // Insert new record
        const { error } = await supabase
          .from('daily_reflections')
          .insert({
            date: today,
            reflection: reflection,
            scripture: scripture,
            confession_type: confessionType,
            spiritual_level: spiritualLevel,
            created_at: new Date().toISOString()
          })

        if (error) {
          console.error('Error inserting daily reflection:', error)
        }
      }
    } catch (error) {
      console.error('Error saving daily reflection:', error)
    }
  }

  // Removed generateDailyReflection function - now using database-only approach

  const getTypeInfo = (typeId) => {
    return confessionTypes.find(type => type.id === typeId)
  }

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6">
      {/* Spiritual Progress Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 sm:p-6 mb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🙏</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Your Spiritual Journey</h2>
              <p className="text-purple-100 text-sm">Level {spiritualLevel} • {confessionStreak} day streak</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-bold">{submittedConfessions.length}</div>
            <div className="text-purple-100 text-xs">Confessions</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="bg-white/20 rounded-full h-2 mb-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-500"
            style={{ width: `${(submittedConfessions.length % 10) * 10}%` }}
          ></div>
        </div>
        <div className="text-center text-purple-100 text-xs">
          {10 - (submittedConfessions.length % 10)} more confessions to level {spiritualLevel + 1}
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-3 sm:mb-4">
          <span className="text-white text-lg sm:text-2xl lg:text-3xl">🙏</span>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Create Your Confession</h2>
        <p className="text-gray-600 text-xs sm:text-sm lg:text-base">Share your heart with God through confession</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Daily AI Reflection */}
        {dailyReflection && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">✨</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">Daily Reflection</h4>
                <p className="text-blue-800 text-sm mb-2">{dailyReflection}</p>
                {timeUntilNext && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      ⏰ Next reflection in: {timeUntilNext}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


        {/* Confession Form */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Write Your Confession</h3>
          
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Confession Type */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Confession Type</label>
              <select
                value={confessionType}
                onChange={(e) => setConfessionType(e.target.value)}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {confessionTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.emoji} {type.name} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Emotional State */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">How are you feeling?</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {emotionalStates.map(state => (
                  <button
                    key={state.id}
                    type="button"
                    onClick={() => setEmotionalState(state.id)}
                    className={`p-2 rounded-lg text-xs transition-all duration-200 ${
                      emotionalState === state.id
                        ? 'bg-purple-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-lg mb-1">{state.emoji}</div>
                    <div className="font-medium">{state.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Confession Text */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Your Confession</label>
              <div className="relative">
                <textarea
                  value={confessionText}
                  onChange={(e) => setConfessionText(e.target.value)}
                  placeholder="Write your confession here... Share your heart with God."
                  className="w-full p-3 sm:p-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none pr-12"
                  rows={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                  className="absolute top-2 right-2 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
                >
                  <span className="text-sm">🎤</span>
                </button>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{confessionText.length} characters</span>
                <span>{emotionalStates.find(s => s.id === emotionalState)?.name}</span>
              </div>
            </div>

            {/* Voice Recorder */}
            {showVoiceRecorder && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-sm text-purple-800">
                      {isRecording ? 'Recording...' : 'Voice recorder ready'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRecording(!isRecording)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      isRecording 
                        ? 'bg-red-500 text-white' 
                        : 'bg-purple-500 text-white hover:bg-purple-600'
                    }`}
                  >
                    {isRecording ? 'Stop' : 'Start Recording'}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!confessionText.trim() || isSubmitting}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-xs sm:text-sm">Submitting...</span>
                </div>
              ) : (
                'Submit Confession'
              )}
            </button>
          </form>
        </div>

        {/* Enhanced Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span className="text-xl">📝</span>
            <span className="font-semibold">History</span>
          </button>
          
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span className="text-xl">📊</span>
            <span className="font-semibold">Analytics</span>
          </button>
          
          <button
            onClick={() => setShowReminders(!showReminders)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span className="text-xl">⏰</span>
            <span className="font-semibold">Reminders</span>
          </button>
          
          <button
            onClick={exportConfessions}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span className="text-xl">💾</span>
            <span className="font-semibold">Export</span>
          </button>
        </div>

        {/* Confession History */}
        {showHistory && (
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📝</span>
              Your Confession History ({confessionHistory.length} total)
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {confessionHistory.length > 0 ? (
                confessionHistory.map((confession, index) => (
                  <div key={confession.id} className="bg-gray-50 rounded-xl p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getTypeInfo(confession.personalization_factors?.confession_type)?.emoji}</span>
                        <span className="font-medium text-gray-900 text-sm">
                          {getTypeInfo(confession.personalization_factors?.confession_type)?.name || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                          Level {confession.personalization_factors?.spiritual_level || 1}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(confession.confessed_at).toLocaleDateString()} at {new Date(confession.confessed_at).toLocaleTimeString()}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {confession.note}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-2 block">📝</span>
                  <p>No confessions yet. Start your spiritual journey!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics */}
        {showAnalytics && (
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Spiritual Growth Analytics
            </h3>
            {(() => {
              const analytics = getAnalytics()
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{analytics.totalConfessions}</div>
                    <div className="text-sm text-blue-800">Total Confessions</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{analytics.thisWeek}</div>
                    <div className="text-sm text-green-800">This Week</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{analytics.averagePerWeek}</div>
                    <div className="text-sm text-purple-800">Avg/Week</div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{confessionStreak}</div>
                    <div className="text-sm text-orange-800">Day Streak</div>
                  </div>
                  
                  {/* Confession Types Chart */}
                  <div className="sm:col-span-2 lg:col-span-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Confession Types</h4>
                    <div className="space-y-2">
                      {Object.entries(analytics.typeCounts).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getTypeInfo(type)?.emoji}</span>
                            <span className="text-sm font-medium text-gray-700">{getTypeInfo(type)?.name || type}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${(count / analytics.totalConfessions) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-600">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Push Notifications & Reminders */}
        {showReminders && (
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">⏰</span>
              Push Notifications & Reminders
            </h3>
            <div className="space-y-4">
              {/* Notification Status */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Notification Status</h4>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    notificationEnabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {notificationEnabled ? '✅ Enabled' : '❌ Disabled'}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {notificationEnabled 
                    ? 'You\'ll receive daily reminders for your spiritual practice'
                    : 'Enable notifications to get daily confession reminders'
                  }
                </p>
                <div className="flex space-x-2">
                  {!notificationEnabled ? (
                    <button 
                      onClick={enableNotifications}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                      🔔 Enable Notifications
                    </button>
                  ) : (
                    <button 
                      onClick={disableNotifications}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      🔕 Disable Notifications
                    </button>
                  )}
                </div>
              </div>

              {/* Daily Reminder Settings */}
              {notificationEnabled && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Daily Confession Reminder</h4>
                  <p className="text-sm text-gray-600 mb-3">Get notified to make your daily confession</p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => updateReminderTime(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <span className="text-sm text-gray-600">Daily at {reminderTime}</span>
                  </div>
                </div>
              )}

              {/* Weekly Reflection Settings */}
              {notificationEnabled && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Weekly Spiritual Reflection</h4>
                  <p className="text-sm text-gray-600 mb-3">Review your spiritual progress each week</p>
                  <div className="flex items-center space-x-2">
                    <select 
                      value={weeklyReminderDay}
                      onChange={(e) => updateWeeklyReminderDay(parseInt(e.target.value))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value={0}>Sunday</option>
                      <option value={1}>Monday</option>
                      <option value={2}>Tuesday</option>
                      <option value={3}>Wednesday</option>
                      <option value={4}>Thursday</option>
                      <option value={5}>Friday</option>
                      <option value={6}>Saturday</option>
                    </select>
                    <span className="text-sm text-gray-600">
                      Weekly on {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][weeklyReminderDay]}
                    </span>
                  </div>
                </div>
              )}

              {/* Notification Features */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Notification Features</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🔔</span>
                    <span>Daily confession reminders</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">📊</span>
                    <span>Weekly progress reviews</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">⏰</span>
                    <span>Customizable timing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">📱</span>
                    <span>Works even when app is closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confession History */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Your Confessions</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                {submittedConfessions.length} total
              </span>
            </div>
          </div>
          
          {submittedConfessions.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <span className="text-gray-400 text-lg sm:text-xl">📝</span>
              </div>
              <p className="text-gray-500 text-xs sm:text-sm">No confessions yet</p>
              <p className="text-gray-400 text-xs mt-1">Your confessions will appear here</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
              {submittedConfessions.map(confession => {
                const typeInfo = getTypeInfo(confession.type)
                const emotionalInfo = emotionalStates.find(s => s.id === confession.emotionalState)
                return (
                  <div key={confession.id} className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm sm:text-lg">{typeInfo.emoji}</span>
                        <span className="text-xs sm:text-sm font-medium text-gray-700">{typeInfo.name}</span>
                        {emotionalInfo && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {emotionalInfo.emoji} {emotionalInfo.name}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {confession.date} {confession.time}
                      </div>
                    </div>
                    <p className="text-gray-800 text-xs sm:text-sm leading-relaxed mb-2">{confession.text}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Level {confession.spiritualLevel || 1}</span>
                      <span className="text-purple-600">#{confession.id.toString().slice(-4)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-blue-100">
        <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">💡 Confession Tips</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 text-xs sm:text-sm">•</span>
            <span>Be honest and authentic in your confessions</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 text-xs sm:text-sm">•</span>
            <span>Express gratitude for God's mercy and love</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 text-xs sm:text-sm">•</span>
            <span>Ask for strength to overcome challenges</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 text-xs sm:text-sm">•</span>
            <span>Share your heart openly with God</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfessionArea
