import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../supabaseClient.jsx'

const EmailVerification = ({ email, onClose, onVerified }) => {
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

  // Check verification status periodically
  useEffect(() => {
    const checkVerification = setInterval(() => {
      if (user?.email_confirmed_at) {
        setIsVerifying(true)
        setTimeout(() => {
          onVerified?.()
        }, 1000) // Small delay to show success message
        clearInterval(checkVerification)
      }
    }, 2000) // Check every 2 seconds

    return () => clearInterval(checkVerification)
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
    if (user?.email_confirmed_at) {
      setIsVerifying(true)
      setTimeout(() => {
        onVerified?.()
      }, 1000) // Small delay to show success message
    } else {
      alert('Email not verified yet. Please check your email and click the verification link.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">✉️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Verify Your Email</h2>
              <p className="text-sm text-gray-600">Check your inbox</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Verification Status */}
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📧</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isVerifying ? 'Verifying Your Email...' : 'Check Your Email!'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {isVerifying 
                ? 'We\'re verifying your email address. Please wait...'
                : 'We\'ve sent a verification link to:'
              }
            </p>
            <p className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
              {email}
            </p>
          </div>

          {/* Instructions */}
          {!isVerifying && (
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📋 Next Steps:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Check your email inbox (and spam folder)</li>
                <li>2. Look for an email from SpeakLife</li>
                <li>3. Click the "Verify Email" button in the email</li>
                <li>4. Return here and click "I've Verified"</li>
              </ol>
            </div>
          )}

          {/* Loading State */}
          {isVerifying && (
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-green-800 font-medium">Verifying your email address...</span>
              </div>
            </div>
          )}

          {/* Resend Section - Only show when not verifying */}
          {!isVerifying && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Didn't receive the email?</span>
                <button
                  onClick={handleResendVerification}
                  disabled={timeLeft > 0 || resendLoading}
                  className={`text-sm font-medium transition-colors ${
                    timeLeft > 0 || resendLoading
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  {resendLoading ? 'Sending...' : timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend Email'}
                </button>
              </div>
              
              {resendSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-700 text-sm">Verification email sent! Please check your inbox.</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {isVerifying ? (
              <div className="w-full bg-green-100 text-green-800 py-3 rounded-lg text-center font-medium">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying... Taking you to dashboard!</span>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={handleCheckVerification}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  I've Verified My Email
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
              </>
            )}
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Check your spam folder if you don't see the email in your inbox.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailVerification
