import { useState, useEffect, useRef } from 'react'
import { X, Play, Pause, SkipForward, Check, Mic, MicOff, Volume2, Timer, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

const PracticeSession = ({ declarations = [], onComplete, onClose }) => {
    const { user } = useAuth()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [sessionStartTime] = useState(Date.now())
    const [elapsedSeconds, setElapsedSeconds] = useState(0)
    const [completedDeclarations, setCompletedDeclarations] = useState(new Set())
    const [isRecording, setIsRecording] = useState(false)
    const timerRef = useRef(null)

    const [mediaRecorder, setMediaRecorder] = useState(null)
    const [audioChunks, setAudioChunks] = useState([])
    const [audioUrl, setAudioUrl] = useState(null)
    const [audioBlob, setAudioBlob] = useState(null)
    const [isUploading, setIsUploading] = useState(false)
    const [recordingUrls, setRecordingUrls] = useState({}) // Track recording URLs by declaration ID

    const currentDeclaration = declarations[currentIndex]
    const progress = ((currentIndex + 1) / declarations.length) * 100
    const allCompleted = completedDeclarations.size === declarations.length

    // Load existing recordings for these declarations
    useEffect(() => {
        const loadRecordings = async () => {
            if (!user || !declarations.length) return

            const declarationIds = declarations.map(d => d.id)
            const { data, error } = await supabase
                .from('session_declarations')
                .select('declaration_id, recording_url')
                .eq('was_spoken', true)
                .in('declaration_id', declarationIds)
                .not('recording_url', 'is', null)
                .order('created_at', { ascending: false })

            if (!error && data) {
                // Keep only the most recent recording for each declaration
                const urlMap = {}
                data.forEach(record => {
                    if (!urlMap[record.declaration_id]) {
                        urlMap[record.declaration_id] = record.recording_url
                    }
                })
                setRecordingUrls(urlMap)
            }
        }

        loadRecordings()
    }, [user, declarations])

    useEffect(() => {
        if (isPlaying) {
            timerRef.current = setInterval(() => {
                setElapsedSeconds(prev => prev + 1)
            }, 1000)
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [isPlaying])

    // Update audioUrl when changing declarations if a saved recording exists
    useEffect(() => {
        const savedRecording = recordingUrls[currentDeclaration?.id]
        if (savedRecording && !audioBlob) {
            setAudioUrl(savedRecording)
        } else if (!audioBlob) {
            setAudioUrl(null)
        }
    }, [currentIndex, recordingUrls, currentDeclaration?.id, audioBlob])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = new MediaRecorder(stream)
            const chunks = []

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data)
                }
            }

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' })
                const url = URL.createObjectURL(blob)
                setAudioUrl(url)
                setAudioBlob(blob)
                setAudioChunks([])
            }

            recorder.start()
            setMediaRecorder(recorder)
            setIsRecording(true)
        } catch (error) {
            console.error('Error accessing microphone:', error)
            toast.error('Could not access microphone')
        }
    }

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop()
            setIsRecording(false)
            mediaRecorder.stream.getTracks().forEach(track => track.stop())
        }
    }

    const uploadRecording = async (declarationId) => {
        if (!audioBlob || !user) return null

        try {
            setIsUploading(true)
            const filename = `${user.id}/${declarationId}/${Date.now()}.webm`
            const { data, error } = await supabase.storage
                .from('recordings')
                .upload(filename, audioBlob)

            if (error) throw error

            const { data: { publicUrl } } = supabase.storage
                .from('recordings')
                .getPublicUrl(filename)

            return publicUrl
        } catch (error) {
            console.error('Error uploading recording:', error)
            toast.error('Failed to save recording')
            return null
        } finally {
            setIsUploading(false)
        }
    }

    const handleNext = () => {
        if (currentIndex < declarations.length - 1) {
            setCurrentIndex(currentIndex + 1)
            // Reset local recording state when moving to next
            setAudioBlob(null)
        }
    }

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
            // Reset local recording state when moving to previous
            setAudioBlob(null)
        }
    }

    const handleMarkComplete = async () => {
        let recordingUrl = null
        if (audioBlob) {
            recordingUrl = await uploadRecording(currentDeclaration.id)
            if (recordingUrl) {
                // Update local state with new recording
                setRecordingUrls(prev => ({
                    ...prev,
                    [currentDeclaration.id]: recordingUrl
                }))
                // Update audioUrl to the cloud URL so user can still listen
                setAudioUrl(recordingUrl)
            }
        }

        const newCompleted = new Set(completedDeclarations)
        newCompleted.add(currentDeclaration.id)
        setCompletedDeclarations(newCompleted)

        // Reset blob (but keep audioUrl for playback)
        setAudioBlob(null)

        // Auto-advance if not the last one
        if (currentIndex < declarations.length - 1) {
            setTimeout(() => handleNext(), 500)
        }
    }

    const handleFinishSession = async () => {
        try {
            const durationSeconds = Math.floor((Date.now() - sessionStartTime) / 1000)

            // Create practice session
            const { data: sessionData, error: sessionError } = await supabase
                .from('practice_sessions')
                .insert([{
                    user_id: user.id,
                    session_date: new Date().toISOString().split('T')[0],
                    duration_seconds: durationSeconds,
                    declarations_count: completedDeclarations.size
                }])
                .select()
                .single()

            if (sessionError) {
                // If session already exists for today, update it
                if (sessionError.code === '23505') {
                    const { data: existingSession } = await supabase
                        .from('practice_sessions')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('session_date', new Date().toISOString().split('T')[0])
                        .single()

                    if (existingSession) {
                        await supabase
                            .from('practice_sessions')
                            .update({
                                duration_seconds: existingSession.duration_seconds + durationSeconds,
                                declarations_count: existingSession.declarations_count + completedDeclarations.size
                            })
                            .eq('id', existingSession.id)
                    }
                } else {
                    throw sessionError
                }
            }

            // Record which declarations were practiced WITH recording URLs
            if (sessionData) {
                const sessionDeclarations = Array.from(completedDeclarations).map(declarationId => ({
                    session_id: sessionData.id,
                    declaration_id: declarationId,
                    was_spoken: true,
                    recording_url: recordingUrls[declarationId] || null
                }))

                await supabase
                    .from('session_declarations')
                    .insert(sessionDeclarations)
            }

            toast.success('🎉 Practice session completed!', {
                description: `You practiced ${completedDeclarations.size} declarations in ${formatTime(elapsedSeconds)}`
            })

            onComplete?.()
            onClose()
        } catch (error) {
            console.error('Error saving session:', error)
            toast.error('Failed to save session')
        }
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')} `
    }



    if (!currentDeclaration) {
        return null
    }

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
            {/* Simple Header */}
            <div className="bg-purple-600 text-white p-4 sm:p-6">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-purple-700 px-3 py-2 rounded-lg">
                            <Timer size={18} />
                            <span className="font-bold text-sm">{formatTime(elapsedSeconds)}</span>
                        </div>
                        <span className="text-sm">
                            {currentIndex + 1} of {declarations.length}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-purple-700 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-200 h-2">
                <div
                    className="bg-purple-600 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Life Area Badge */}
                    {currentDeclaration.life_areas && (
                        <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full">
                            <span className="text-xl">{currentDeclaration.life_areas.icon}</span>
                            <span className="text-purple-800 font-semibold text-sm">
                                {currentDeclaration.life_areas.name}
                            </span>
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {currentDeclaration.title}
                    </h1>

                    {/* Declaration Text */}
                    <div className="bg-white border-2 border-purple-300 rounded-xl p-6">
                        <p className="text-lg sm:text-xl text-gray-800 leading-relaxed">
                            "{currentDeclaration.declaration_text}"
                        </p>
                    </div>

                    {/* Bible Reference */}
                    {currentDeclaration.bible_reference && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm font-semibold text-yellow-800 mb-1 flex items-center gap-2">
                                <BookOpen size={16} />
                                {currentDeclaration.bible_reference}
                            </p>
                            {currentDeclaration.bible_verse_text && (
                                <p className="text-sm text-gray-700 italic">
                                    "{currentDeclaration.bible_verse_text}"
                                </p>
                            )}
                        </div>
                    )}

                    {/* Recording Section */}
                    <div className="bg-white border-2 border-gray-300 rounded-xl p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Record Your Voice</h3>

                        {/* Recording Button */}
                        <div className="flex flex-col items-center gap-3">
                            {!isRecording ? (
                                <button
                                    onClick={startRecording}
                                    className="flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-md"
                                >
                                    <Mic size={24} />
                                    Start Recording
                                </button>
                            ) : (
                                <button
                                    onClick={stopRecording}
                                    className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-md animate-pulse"
                                >
                                    <div className="w-6 h-6 bg-white rounded" />
                                    Stop Recording
                                </button>
                            )}

                            <p className="text-sm text-gray-600">
                                {isRecording ? "Recording in progress..." : audioUrl ? "✓ Recording saved" : "Click to record yourself speaking"}
                            </p>
                        </div>

                        {/* Audio Player */}
                        {audioUrl && !isRecording && (
                            <div className="bg-gray-100 rounded-lg p-4 space-y-2">
                                <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Volume2 size={16} />
                                    Your Recording:
                                </p>
                                <audio
                                    src={audioUrl}
                                    controls
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-center pt-4">
                        {!completedDeclarations.has(currentDeclaration.id) ? (
                            <button
                                onClick={handleMarkComplete}
                                disabled={isUploading}
                                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-10 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg disabled:cursor-not-allowed flex items-center gap-3"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Check size={24} />
                                        Mark as Complete
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="bg-green-100 border-2 border-green-500 text-green-700 px-10 py-4 rounded-lg font-bold text-lg flex items-center gap-3">
                                <Check size={24} />
                                Completed ✓
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="bg-white border-t border-gray-300 p-4 sm:p-6">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-800 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
                    >
                        <ArrowLeft size={20} />
                        Previous
                    </button>

                    {allCompleted && (
                        <button
                            onClick={handleFinishSession}
                            className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold text-lg transition-colors shadow-lg"
                        >
                            🎉 Finish Session
                        </button>
                    )}

                    <button
                        onClick={handleNext}
                        disabled={currentIndex === declarations.length - 1}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-800 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
                    >
                        Next
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PracticeSession
