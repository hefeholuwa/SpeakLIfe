import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import EmailVerification from './EmailVerification.jsx'
import { X, Mail, Lock, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'

const Login = ({ onClose, onSuccess, onSwitchToRegister }) => {
  const { signIn, resetPassword, loading, error, setError } = useAuth()

  const safeSetError = setError || (() => { })
  const safeSignIn = signIn || (() => Promise.resolve({ success: false, error: 'Authentication service not available' }))
  const safeResetPassword = resetPassword || (() => Promise.resolve({ success: false, error: 'Password reset service not available' }))

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [validationErrors, setValidationErrors] = useState({})
  const [showVerification, setShowVerification] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.email.trim()) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Please enter a valid email address'
    if (!formData.password) errors.password = 'Password is required'
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    safeSetError(null)
    const result = await safeSignIn(formData.email, formData.password)

    if (result.success) {
      onSuccess?.()
      onClose()
    } else if (result.error && (result.error.includes('email not confirmed') || result.error.includes('Email not confirmed'))) {
      setShowVerification(true)
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setValidationErrors(prev => ({ ...prev, email: 'Please enter your email address first' }))
      return
    }
    safeSetError(null)
    const result = await safeResetPassword(formData.email)
    if (result.success) alert('Password reset email sent! Please check your inbox.')
  }

  if (showVerification) {
    return (
      <EmailVerification
        email={formData.email}
        onClose={() => setShowVerification(false)}
        onVerified={() => {
          setShowVerification(false)
          onSuccess?.()
          onClose()
        }}
      />
    )
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

        <div className="p-8 pt-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg mx-auto mb-4">
              SL
            </div>
            <h2 className="text-2xl font-black text-gray-900">Welcome Back</h2>
            <p className="text-gray-500 mt-1">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none ${validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                />
              </div>
              {validationErrors.email && (
                <p className="text-red-500 text-xs font-medium ml-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {validationErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-gray-700">Password</label>
                <button type="button" onClick={handleForgotPassword} className="text-xs font-semibold text-purple-600 hover:text-purple-700">
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none ${validationErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                />
              </div>
              {validationErrors.password && (
                <p className="text-red-500 text-xs font-medium ml-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {validationErrors.password}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-lg shadow-xl shadow-gray-900/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
          <p className="text-gray-600 font-medium text-sm">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-gray-900 font-bold hover:underline"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
