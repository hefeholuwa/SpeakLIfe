import { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'
import { setupInstallPrompt, getInstallInstructions, isAppInstalled } from '../utils/pwa'

const InstallPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false)
    const [installHandler, setInstallHandler] = useState(null)
    const [instructions, setInstructions] = useState(null)

    useEffect(() => {
        // Don't show if already installed
        if (isAppInstalled()) {
            return
        }

        // Check if user has dismissed the prompt before
        const dismissed = localStorage.getItem('install-prompt-dismissed')
        if (dismissed) {
            const dismissedDate = new Date(dismissed)
            const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)

            // Show again after 7 days
            if (daysSinceDismissed < 7) {
                return
            }
        }

        // Set up install prompt
        setupInstallPrompt((handler) => {
            setInstallHandler(() => handler)
            setShowPrompt(true)
        })

        // Get platform-specific instructions
        const platformInstructions = getInstallInstructions()
        setInstructions(platformInstructions)

        // Auto-show after 30 seconds on first visit
        const timer = setTimeout(() => {
            if (!installHandler && !isAppInstalled()) {
                setShowPrompt(true)
            }
        }, 30000)

        return () => clearTimeout(timer)
    }, [])

    const handleInstall = async () => {
        if (installHandler) {
            const accepted = await installHandler()
            if (accepted) {
                setShowPrompt(false)
            }
        }
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        localStorage.setItem('install-prompt-dismissed', new Date().toISOString())
    }

    if (!showPrompt) {
        return null
    }

    return (
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-slide-up">
            <div className="bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Smartphone size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Install SpeakLife</h3>
                                <p className="text-xs text-purple-100">Get the app experience!</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm text-gray-700 leading-relaxed">
                            Install SpeakLife on your {instructions?.platform || 'device'} for:
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span>
                                Quick access from your home screen
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span>
                                Offline reading & notes
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span>
                                Push notifications for daily verses
                            </li>
                        </ul>
                    </div>

                    {/* Install Instructions for iOS */}
                    {instructions?.platform === 'iOS' && !installHandler && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs font-semibold text-blue-900 mb-2">How to install:</p>
                            <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                                {instructions.steps.map((step, index) => (
                                    <li key={index}>{step}</li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {/* Install Button */}
                    {installHandler && (
                        <button
                            onClick={handleInstall}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                            <Download size={20} />
                            Install Now
                        </button>
                    )}

                    <button
                        onClick={handleDismiss}
                        className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    )
}

export default InstallPrompt
