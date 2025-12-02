import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import EmailVerification from './EmailVerification.jsx'
import { X, User, Mail, Lock, AlertCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'

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
    setFormData(prev => ({ ...prev, [name]: value }))
    if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required'
    if (!formData.email.trim()) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Please enter a valid email address'
    if (!formData.password) errors.password = 'Password is required'
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match'

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
      // Pass the email to parent so it can show verification
      onSuccess?.(formData.email)
      // Close the registration modal
      onClose()
    } else {
      // Handle specific errors gracefully
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in relative max-h-[90vh] overflow-y-auto">

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
            <h2 className="text-2xl font-black text-gray-900">Create Account</h2>
            <p className="text-gray-500 mt-1">Join your spiritual journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none ${validationErrors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                />
              </div>
              {validationErrors.fullName && (
                <p className="text-red-500 text-xs font-medium ml-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {validationErrors.fullName}
                </p>
              )}
            </div>

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
              <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
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

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none ${validationErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                />
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-red-500 text-xs font-medium ml-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {validationErrors.confirmPassword}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {registrationSuccess && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm text-green-700 font-bold">Account Created!</p>
                  <p className="text-xs text-green-600 mt-0.5">Redirecting to verification...</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || registrationSuccess}
              className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-lg shadow-xl shadow-gray-900/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading || registrationSuccess ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>{registrationSuccess ? 'Success!' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <p className="text-xs text-center text-gray-500 mt-4">
              By creating an account, you agree to our <span className="font-bold text-gray-900">Terms</span> and <span className="font-bold text-gray-900">Privacy Policy</span>.
            </p>
          </form>
        </div>

        <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
          <p className="text-gray-600 font-medium text-sm">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-gray-900 font-bold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div >
  )
}

export default Register
