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
        // Auto-start timer when session begins
        timerRef.current = setInterval(() => {
            setElapsedSeconds(prev => prev + 1)
        }, 1000)

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [])

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
            const today = new Date().toISOString().split('T')[0]
            let sessionId = null

            // 1. Check for existing session first to avoid error-based logic
            const { data: existingSession } = await supabase
                .from('practice_sessions')
                .select('id, duration_seconds, declarations_count')
                .eq('user_id', user.id)
                .eq('session_date', today)
                .single()

            if (existingSession) {
                sessionId = existingSession.id
                // Update existing session
                await supabase
                    .from('practice_sessions')
                    .update({
                        duration_seconds: existingSession.duration_seconds + durationSeconds,
                        declarations_count: existingSession.declarations_count + completedDeclarations.size
                    })
                    .eq('id', sessionId)
            } else {
                // Create new session
                const { data: newSession, error } = await supabase
                    .from('practice_sessions')
                    .insert([{
                        user_id: user.id,
                        session_date: today,
                        duration_seconds: durationSeconds,
                        declarations_count: completedDeclarations.size
                    }])
                    .select()
                    .single()

                if (error) throw error
                sessionId = newSession.id
            }

            // 2. Record which declarations were practiced WITH recording URLs
            if (sessionId && completedDeclarations.size > 0) {
                const sessionDeclarations = Array.from(completedDeclarations).map(declarationId => ({
                    session_id: sessionId,
                    declaration_id: declarationId,
                    was_spoken: true,
                    recording_url: recordingUrls[declarationId] || null
                }))

                const { error: declError } = await supabase
                    .from('session_declarations')
                    .insert(sessionDeclarations)

                if (declError) throw declError
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
        <div className="fixed inset-0 z-[100] bg-divine-gradient flex flex-col text-white animate-fade-in">
            {/* Header */}
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all group"
                    >
                        <X size={24} className="text-white/80 group-hover:text-white" />
                    </button>
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                        <Timer size={16} className="text-yellow-400" />
                        <span className="font-bold text-sm font-mono tracking-wider">{formatTime(elapsedSeconds)}</span>
                    </div>
                </div>
                <div className="text-sm font-bold text-white/60 tracking-widest uppercase">
                    Declaration {currentIndex + 1} / {declarations.length}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="px-6">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-200 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 relative z-10 scrollbar-hide">
                <div className="min-h-full flex flex-col items-center justify-center py-4 md:py-8">
                    {/* Background Decor */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[100px] pointer-events-none animate-pulse-slow -z-10" />

                    <div className="w-full max-w-2xl relative">
                        {/* Card Container */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 md:p-10 shadow-divine text-center relative overflow-hidden group">
                            {/* Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                            {/* Life Area Icon */}
                            {currentDeclaration.life_areas && (
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-6 border border-white/10 shadow-glow animate-float-slow">
                                    <span className="text-2xl filter drop-shadow-lg">{currentDeclaration.life_areas.icon}</span>
                                </div>
                            )}

                            {/* Declaration Text */}
                            <h2 className="text-xl md:text-3xl font-black leading-snug mb-6 drop-shadow-sm">
                                "{(() => {
                                    const name = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Friend';
                                    let text = currentDeclaration.declaration_text;
                                    if (name) {
                                        text = text.replace(/\bI am\b/gi, `I, ${name}, am`);
                                        text = text.replace(/\bI declare\b/gi, `I, ${name}, declare`);
                                        text = text.replace(/\bI decree\b/gi, `I, ${name}, decree`);
                                        text = text.replace(/\bI believe\b/gi, `I, ${name}, believe`);
                                    }
                                    return text;
                                })()}"
                            </h2>

                            {/* Scripture */}
                            {currentDeclaration.bible_reference && (
                                <div className="inline-block relative">
                                    <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full" />
                                    <div className="relative bg-black/20 hover:bg-black/30 transition-colors border border-white/10 rounded-xl px-5 py-2.5 backdrop-blur-sm">
                                        <p className="text-yellow-300 font-bold text-xs md:text-sm flex items-center justify-center gap-2 mb-1">
                                            <BookOpen size={14} />
                                            {currentDeclaration.bible_reference}
                                        </p>
                                        {currentDeclaration.bible_verse_text && (
                                            <p className="text-white/80 text-xs md:text-sm italic font-serif">
                                                "{currentDeclaration.bible_verse_text}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Controls */}
            <div className="bg-black/20 backdrop-blur-lg border-t border-white/10 p-6 pb-8">
                <div className="max-w-4xl mx-auto flex flex-col gap-6">

                    {/* Recording Status / Player */}
                    <div className="flex justify-center h-12">
                        {isRecording ? (
                            <div className="flex items-center gap-3 text-red-400 animate-pulse font-bold bg-red-500/10 px-6 py-2 rounded-full border border-red-500/20">
                                <div className="w-3 h-3 bg-red-500 rounded-full" />
                                Recording...
                            </div>
                        ) : audioUrl ? (
                            <div className="flex items-center gap-4 bg-white/10 px-6 py-2 rounded-full border border-white/10">
                                <span className="text-white/60 text-sm font-medium">Recorded</span>
                                <audio src={audioUrl} controls className="h-8 w-48 opacity-80 hover:opacity-100 transition-opacity" />
                            </div>
                        ) : (
                            <div className="text-white/40 text-sm font-medium flex items-center gap-2">
                                <Mic size={14} />
                                Tap microphone to record
                            </div>
                        )}
                    </div>

                    {/* Main Controls Row */}
                    <div className="flex items-center justify-between gap-4">
                        {/* Previous */}
                        <button
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/5 text-white"
                        >
                            <ArrowLeft size={24} />
                        </button>

                        {/* Center Action Group */}
                        <div className="flex items-center gap-4 flex-1 justify-center max-w-md">
                            {/* Record Button */}
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`p-5 rounded-full transition-all duration-300 shadow-lg transform hover:scale-105 ${isRecording
                                    ? 'bg-red-500 text-white shadow-red-500/40'
                                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                                    }`}
                            >
                                {isRecording ? <Pause size={28} className="fill-current" /> : <Mic size={28} />}
                            </button>

                            {/* Complete / Next Button */}
                            {!completedDeclarations.has(currentDeclaration.id) ? (
                                <button
                                    onClick={handleMarkComplete}
                                    disabled={isUploading}
                                    className="flex-1 bg-white text-purple-900 h-[68px] rounded-2xl font-black text-lg hover:bg-gray-100 transition-all shadow-lg shadow-white/10 flex items-center justify-center gap-2 active:scale-95"
                                >
                                    {isUploading ? (
                                        <div className="w-6 h-6 border-2 border-purple-900/30 border-t-purple-900 rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Check size={24} strokeWidth={3} />
                                            Complete
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={allCompleted ? handleFinishSession : handleNext}
                                    className="flex-1 bg-green-500 text-white h-[68px] rounded-2xl font-black text-lg hover:bg-green-400 transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 active:scale-95"
                                >
                                    {allCompleted ? (
                                        <>🎉 Finish Session</>
                                    ) : (
                                        <>
                                            Next Declaration
                                            <ArrowRight size={24} strokeWidth={3} />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Next (Secondary) */}
                        <button
                            onClick={handleNext}
                            disabled={currentIndex === declarations.length - 1}
                            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/5 text-white"
                        >
                            <ArrowRight size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PracticeSession
