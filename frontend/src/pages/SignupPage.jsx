import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup as signupRequest } from '../services/api'
import { useAuth } from '../utils/AuthContext'

function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await signupRequest(email, password)
      login(res.data.access_token, res.data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-4 shadow-glow-md">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-100">Create an account</h1>
          <p className="text-gray-500 text-sm mt-1">Start analyzing food labels with AI</p>
        </div>

        {/* Form card */}
        <div className="glass-card rounded-2xl p-6 gradient-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-glass"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Password</label>
              <input
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="input-glass"
              />
              <p className="text-xs text-gray-600 mt-1.5 ml-1">Must be at least 8 characters</p>
            </div>

            {error && (
              <div className="rounded-lg p-3 bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gradient w-full py-3"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignupPage
