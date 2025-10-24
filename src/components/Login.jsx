import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'

const Login = ({ onClose, onSuccess, onSwitchToRegister }) => {
  const { signIn, resetPassword, loading, error, setError } = useAuth()
  
  // Fallbacks for functions if not available
  const safeSetError = setError || (() => {})
  const safeSignIn = signIn || (() => Promise.resolve({ success: false, error: 'Authentication service not available' }))
  const safeResetPassword = resetPassword || (() => Promise.resolve({ success: false, error: 'Password reset service not available' }))
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [validationErrors, setValidationErrors] = useState({})

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

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    safeSetError(null)
    const result = await safeSignIn(formData.email, formData.password)
    
    if (result.success) {
      onSuccess?.()
      onClose()
    } else if (result.error && result.error.includes('email not confirmed')) {
      safeSetError('Please verify your email address before signing in. Check your inbox for a verification link.')
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.email) {
      alert('Please enter your email address first')
      return
    }

    safeSetError(null)
    const result = await safeResetPassword(formData.email)
    
    if (result.success) {
      alert('Password reset email sent! Please check your inbox.')
    }
  }


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-3xl border border-white/30 w-full max-w-md animate-scale-in">
        {/* Enhanced Header */}
        <div className="relative p-8 border-b border-gray-200/50">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-t-3xl"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-black text-2xl">SL</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-800">Welcome Back</h2>
                <p className="text-sm text-gray-600 font-medium">Sign in to continue your journey</p>
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
              className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base ${
                validationErrors.email 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-blue-300'
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
              placeholder="Enter your password"
              className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base ${
                validationErrors.password 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-blue-300'
              }`}
            />
            {validationErrors.password && (
              <p className="text-red-500 text-sm font-medium mt-2 flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                {validationErrors.password}
              </p>
            )}
          </div>

          {/* Enhanced Forgot Password */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-700 font-bold transition-colors flex items-center gap-2"
            >
              <span className="text-lg">🔑</span>
              Forgot Password?
            </button>
          </div>

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
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 hover:from-blue-700 hover:via-purple-600 hover:to-pink-600 hover:shadow-3xl transform hover:scale-105'
            } text-white`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="font-bold">Signing In...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <span className="text-2xl">🔑</span>
                <span>Sign In</span>
                <span className="text-2xl">🚀</span>
              </div>
            )}
          </button>

        </form>

        {/* Enhanced Footer */}
        <div className="px-8 pb-8">
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <p className="text-base text-gray-700 font-medium mb-2">
                Don't have an account?
              </p>
              <button 
                onClick={onSwitchToRegister}
                className="bg-gradient-to-r from-blue-600 to-purple-500 text-white px-8 py-3 rounded-2xl font-bold hover:from-blue-700 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-lg">✨</span>
                  <span>Create Account</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
