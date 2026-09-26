import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../store/authSlice.js'
import { mockUsers } from '../data/mockData.js'

export default function Login() {
  const [mode, setMode] = useState('login') // login | forgot | otp
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLogin = (e) => {
    e.preventDefault()
    // TODO: replace with POST /api/auth/login
    const match = mockUsers.find((u) => u.email === email && u.password === password)
    if (!match) {
      setError('No account matches that email and password.')
      return
    }
    setError('')
    dispatch(setCredentials({ user: { name: match.name, role: match.role, email: match.email }, token: 'demo-token' }))
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface rounded-sm border border-line p-8">
        <div className="mb-8">
          <p className="font-head text-2xl font-semibold text-ink">StockSense</p>
          <p className="text-sm text-inkSoft mt-1">Sign in to manage your inventory</p>
        </div>

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-sm px-3 py-2">{error}</p>
            )}
            <div>
              <label className="text-sm text-inkSoft block mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-line rounded-sm px-3 py-2 text-sm focus:border-accent"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="text-sm text-inkSoft block mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-line rounded-sm px-3 py-2 text-sm focus:border-accent"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="w-full bg-accent text-accentInk font-medium py-2 rounded-sm hover:brightness-95">
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('forgot')}
              className="w-full text-sm text-inkSoft hover:text-ink"
            >
              Forgot password?
            </button>

            <div className="border-t border-line pt-4 text-xs text-inkSoft space-y-1">
              <p className="font-medium text-ink">Demo accounts</p>
              <p><span className="font-mono">manager@stocksense.io</span> / <span className="font-mono">manager123</span> — Inventory Manager</p>
              <p><span className="font-mono">staff@stocksense.io</span> / <span className="font-mono">staff123</span> — Warehouse Staff</p>
            </div>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={(e) => { e.preventDefault(); setMode('otp') }} className="space-y-4">
            <p className="text-sm text-inkSoft">Enter your email — we'll send a one-time code to reset your password.</p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-line rounded-sm px-3 py-2 text-sm focus:border-accent"
              placeholder="you@company.com"
            />
            <button type="submit" className="w-full bg-accent text-accentInk font-medium py-2 rounded-sm hover:brightness-95">
              Send code
            </button>
            <button type="button" onClick={() => setMode('login')} className="w-full text-sm text-inkSoft hover:text-ink">
              Back to sign in
            </button>
          </form>
        )}

        {mode === 'otp' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <p className="text-sm text-inkSoft">Enter the 6-digit code sent to {email || 'your email'}, then set a new password.</p>
            <input
              type="text"
              maxLength={6}
              required
              className="w-full border border-line rounded-sm px-3 py-2 text-sm tracking-[0.4em] text-center font-mono focus:border-accent"
              placeholder="000000"
            />
            <input
              type="password"
              required
              className="w-full border border-line rounded-sm px-3 py-2 text-sm focus:border-accent"
              placeholder="New password"
            />
            <button type="submit" className="w-full bg-accent text-accentInk font-medium py-2 rounded-sm hover:brightness-95">
              Reset & sign in
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
