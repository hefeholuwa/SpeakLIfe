import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Mail, X, ArrowRight, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react'
import { supabase } from '../supabaseClient.jsx'

const EmailVerification = ({ email, onClose, onVerified, onLogin }) => {
  const { user, resendVerification } = useAuth()
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60) // 60 seconds cooldown
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    // Check if user is verified
    if (user?.email_confirmed_at) {
      setIsVerifying(true)
      setTimeout(() => {
        onVerified?.()
      }, 1000) // Small delay to show success message
      return
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [user, onVerified])

  const handleResendVerification = async () => {
    try {
      setResendLoading(true)
      setResendSuccess(false)

      const result = await resendVerification(email)

      if (result.success) {
        setResendSuccess(true)
        setTimeLeft(60) // Reset timer
      } else {
        alert(result.error || 'Failed to resend verification email. Please try again.')
      }
    } catch (error) {
      console.error('Error resending verification:', error)
      alert('Failed to resend verification email. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  const handleCheckVerification = () => {
    // Since we can't check verification status without a session (and we don't have the password),
    // the best flow is to redirect the user to login.
    // If they are verified, login works.
    // If not, login will show "Email not confirmed" and bring them back here.
    onLogin?.()
  }

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
        >
          <X size={20} className="text-gray-600" />
        </button>

        <div className="p-8 pt-12 text-center">
          {/* Logo / Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center text-white shadow-xl mx-auto mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <Mail size={32} className="text-white" />
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-500 mb-8">
            We've sent a verification link to <br />
            <span className="font-bold text-gray-900">{email}</span>
          </p>

          {/* Status Cards */}
          {isVerifying ? (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-6 mb-6 animate-pulse">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-green-600" size={32} />
                <p className="font-bold text-green-800">Verifying your account...</p>
                <p className="text-xs text-green-600">Almost there!</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8 text-left">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs">1</span>
                Next Steps:
              </h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-gray-400 mt-0.5 shrink-0" />
                  <span>Check your inbox (and spam folder)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-gray-400 mt-0.5 shrink-0" />
                  <span>Click the <strong>"Verify Email"</strong> link</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-gray-400 mt-0.5 shrink-0" />
                  <span>Come back here and refresh</span>
                </li>
              </ul>
            </div>
          )}

          {/* Actions */}
          {!isVerifying && (
            <div className="space-y-3">
              <button
                onClick={handleCheckVerification}
                className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-lg shadow-xl shadow-gray-900/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>I've Verified My Email</span>
                <ArrowRight size={20} />
              </button>

              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="text-sm text-gray-500">Didn't receive it?</span>
                <button
                  onClick={handleResendVerification}
                  disabled={timeLeft > 0 || resendLoading}
                  className={`text - sm font - bold flex items - center gap - 1.5 ${timeLeft > 0 || resendLoading
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-purple-600 hover:text-purple-700'
                    } `}
                >
                  {resendLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RefreshCw size={14} />
                  )}
                  {resendLoading ? 'Sending...' : timeLeft > 0 ? `Resend in ${timeLeft} s` : 'Resend Email'}
                </button>
              </div>

              {resendSuccess && (
                <div className="text-xs font-medium text-green-600 bg-green-50 py-2 px-4 rounded-lg inline-block animate-fade-in">
                  Email sent! Check your inbox.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmailVerification
