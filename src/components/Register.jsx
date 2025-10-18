import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import EmailVerification from './EmailVerification.jsx'

const Register = ({ onClose, onSuccess, onSwitchToLogin }) => {
  const { signUp, loading, error, setError } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [validationErrors, setValidationErrors] = useState({})
  const [showVerification, setShowVerification] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setError(null)
    const result = await signUp(formData.email, formData.password, formData.fullName)
    
    if (result.success) {
      if (result.requiresVerification) {
        // Show success message briefly, then email verification modal
        setRegistrationSuccess(true)
        setTimeout(() => {
          setUserEmail(formData.email)
          setShowVerification(true)
        }, 1500) // Show success message for 1.5 seconds
      } else {
        // Account created and verified (shouldn't happen with email confirmation enabled)
        onSuccess?.()
        onClose()
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-3xl border border-white/30 w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Enhanced Header */}
        <div className="relative p-8 border-b border-gray-200/50">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-t-3xl"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-black text-2xl">SL</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-800">Create Account</h2>
                <p className="text-sm text-gray-600 font-medium">Join your spiritual journey</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105"
            >
              <span className="text-gray-600 text-xl">✕</span>
            </button>
          </div>
        </div>

        {/* Enhanced Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 mb-3">
              <span className="flex items-center gap-2">
                <span className="text-lg">👤</span>
                Full Name *
              </span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-base ${
                validationErrors.fullName 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-purple-300'
              }`}
            />
            {validationErrors.fullName && (
              <p className="text-red-500 text-sm font-medium mt-2 flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                {validationErrors.fullName}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 mb-3">
              <span className="flex items-center gap-2">
                <span className="text-lg">📧</span>
                Email Address *
              </span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-base ${
                validationErrors.email 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-purple-300'
              }`}
            />
            {validationErrors.email && (
              <p className="text-red-500 text-sm font-medium mt-2 flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 mb-3">
              <span className="flex items-center gap-2">
                <span className="text-lg">🔒</span>
                Password *
              </span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a secure password"
              className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-base ${
                validationErrors.password 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-purple-300'
              }`}
            />
            {validationErrors.password && (
              <p className="text-red-500 text-sm font-medium mt-2 flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                {validationErrors.password}
              </p>
            )}
            <p className="text-xs text-gray-500 font-medium flex items-center gap-2">
              <span className="text-lg">💡</span>
              Must be at least 6 characters
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 mb-3">
              <span className="flex items-center gap-2">
                <span className="text-lg">🔐</span>
                Confirm Password *
              </span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-base ${
                validationErrors.confirmPassword 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-purple-300'
              }`}
            />
            {validationErrors.confirmPassword && (
              <p className="text-red-500 text-sm font-medium mt-2 flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Enhanced Success Message */}
          {registrationSuccess && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl">✓</span>
                </div>
                <div>
                  <p className="text-green-800 font-bold text-lg">Account Created Successfully!</p>
                  <p className="text-green-700 text-sm font-medium">Preparing email verification...</p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Error Message */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl">⚠️</span>
                </div>
                <div>
                  <p className="text-red-800 font-bold text-lg">Error</p>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Submit Button */}
          <button
            type="submit"
            disabled={loading || registrationSuccess}
            className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl ${
              loading || registrationSuccess
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 hover:from-purple-700 hover:via-pink-600 hover:to-purple-700 hover:shadow-3xl transform hover:scale-105'
            } text-white`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="font-bold">Creating Account...</span>
              </div>
            ) : registrationSuccess ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="font-bold">Preparing Verification...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <span className="text-2xl">✨</span>
                <span>Create Account</span>
                <span className="text-2xl">🚀</span>
              </div>
            )}
          </button>

          {/* Enhanced Terms */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 text-center font-medium">
              By creating an account, you agree to our{' '}
              <button className="text-purple-600 hover:text-purple-700 font-bold transition-colors">Terms of Service</button>
              {' '}and{' '}
              <button className="text-purple-600 hover:text-purple-700 font-bold transition-colors">Privacy Policy</button>
            </p>
          </div>
        </form>

        {/* Enhanced Footer */}
        <div className="px-8 pb-8">
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <p className="text-base text-gray-700 font-medium mb-2">
                Already have an account?
              </p>
              <button 
                onClick={onSwitchToLogin}
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-2xl font-bold hover:from-purple-700 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-lg">🔑</span>
                  <span>Sign In</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Verification Modal */}
      {showVerification && (
        <EmailVerification 
          email={userEmail}
          onClose={() => {
            setShowVerification(false)
            onClose()
          }}
          onVerified={() => {
            setShowVerification(false)
            onSuccess?.() // This will trigger navigation to dashboard
            onClose()
          }}
        />
      )}
    </div>
  )
}

export default Register
