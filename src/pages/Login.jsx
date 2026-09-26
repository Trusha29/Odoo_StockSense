import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../store/authSlice.js'
import api from '../api/axiosClient.js'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [identifier, setIdentifier] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('inventory_manager')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newConfirmPassword, setNewConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const normalizeIdentifier = (value) => {
    const trimmedValue = value.trim()
    return trimmedValue.includes('@') ? trimmedValue.toLowerCase() : trimmedValue
  }

  const getErrorMessage = (requestError) => (
    requestError.response?.data?.message || 'Unable to complete your request. Please try again.'
  )

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setIsSubmitting(true)

    try {
      const response = await api.post('/auth/login', {
        identifier: normalizeIdentifier(identifier),
        password,
      })
      dispatch(setCredentials({ user: response.data.user, token: response.data.token }))
      navigate('/')
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setIsSubmitting(true)

    try {
      const response = await api.post('/auth/signup', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        confirmPassword,
        role,
      })
      setIdentifier(email.trim().toLowerCase())
      setPassword('')
      setConfirmPassword('')
      setMode('login')
      setNotice(response.data.message)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setIsSubmitting(true)

    const normalizedIdentifier = normalizeIdentifier(identifier)

    try {
      const response = await api.post('/auth/forgot-password', {
        identifier: normalizedIdentifier,
      })
      setIdentifier(normalizedIdentifier)
      setOtp('')
      setMode('otp')
      setNotice(response.data.message)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setIsSubmitting(true)

    try {
      const response = await api.post('/auth/verify-otp', {
        identifier: normalizeIdentifier(identifier),
        otp,
      })
      setResetToken(response.data.resetToken)
      setMode('reset')
      setNotice(response.data.message)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setIsSubmitting(true)

    try {
      const response = await api.post('/auth/reset-password', {
        resetToken,
        newPassword,
        confirmPassword: newConfirmPassword,
      })
      setPassword('')
      setNewPassword('')
      setNewConfirmPassword('')
      setMode('login')
      setNotice(response.data.message)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const subtitles = {
    login: 'Sign in to manage your inventory',
    signup: 'Create an account to manage your inventory',
    forgot: 'Enter your email or phone to reset your password.',
    otp: 'Enter the 6-digit code sent to your email or shown in the backend terminal.',
    reset: 'Choose a new password for your account.',
  }

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface rounded-sm border border-line p-8">
        <div className="mb-8">
          <p className="font-head text-2xl font-semibold text-ink">StockSense</p>
          <p className="text-sm text-inkSoft mt-1">{subtitles[mode]}</p>
        </div>

        {error && (
          <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-sm px-3 py-2 mb-4">{error}</p>
        )}
        {notice && (
          <p className="text-sm text-inkSoft bg-surface border border-line rounded-sm px-3 py-2 mb-4">{notice}</p>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-inkSoft block mb-1">Email or phone</label>
              <input
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full border border-line rounded-sm px-3 py-2 text-sm focus:border-accent"
                placeholder="you@company.com or phone number"
              />
            </div>
            <div>
              <label className="text-sm text-inkSoft block mb-1">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-line rounded-sm px-3 py-2 text-sm focus:border-accent"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-accent text-accentInk font-medium py-2 rounded-sm hover:brightness-95 disabled:opacity-60">
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
            <div className="space-y-2">
              <button type="button" onClick={() => { setError(''); setNotice(''); setMode('forgot') }} className="w-full text-sm text-inkSoft hover:text-ink">
                Forgot password?
              </button>
              <button type="button" onClick={() => { setError(''); setNotice(''); setMode('signup') }} className="w-full text-sm text-inkSoft hover:text-ink">
                Create an account
              </button>
            </div>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-sm text-inkSoft block mb-1">Name</label>
              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-line rounded-sm px-3 py-2 text-sm focus:border-accent"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-sm text-inkSoft block mb-1">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-line rounded-sm px-3 py-2 text-sm focus:border-accent"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="text-sm text-inkSoft block mb-1">Phone</label>
              <input
                type="tel"
                required
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-line rounded-sm px-3 py-2 text-sm focus:border-accent"
                placeholder="+1 555 123 4567"
              />
            </div>
            <div>
              <label className="text-sm text-inkSoft block mb-1">Role</label>
              <select
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-line rounded-sm px-3 py-2 text-sm focus:border-accent"
              >
                <option value="inventory_manager">Inventory Manager</option>
                <option value="warehouse_staff">Warehouse Staff</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-inkSoft block mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-line rounded-sm px-3 py-2 text-sm focus:border-accent"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="text-sm text-inkSoft block mb-1">Confirm password</label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-line rounded-sm px-3 py-2 text-sm focus:border-accent"
                placeholder="Confirm password"
              />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-accent text-accentInk font-medium py-2 rounded-sm hover:brightness-95 disabled:opacity-60">
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
            <button type="button" onClick={() => { setError(''); setNotice(''); setMode('login') }} className="w-full text-sm text-inkSoft hover:text-ink">
              Back to sign in
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="text-sm text-inkSoft block mb-1">Email or phone</label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full border border-line rounded-sm px-3 py-2 text-sm focus:border-accent"
              placeholder="you@company.com or phone number"
            />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-accent text-accentInk font-medium py-2 rounded-sm hover:brightness-95 disabled:opacity-60">
              {isSubmitting ? 'Sending...' : 'Send code'}
            </button>
            <button type="button" onClick={() => { setError(''); setNotice(''); setMode('login') }} className="w-full text-sm text-inkSoft hover:text-ink">
              Back to sign in
            </button>
          </form>
        )}

        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-inkSoft">Enter the 6-digit code for {identifier}.</p>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border border-line rounded-sm px-3 py-2 text-sm tracking-[0.4em] text-center font-mono focus:border-accent"
              placeholder="000000"
            />
            <button type="submit" disabled={isSubmitting} className="w-full bg-accent text-accentInk font-medium py-2 rounded-sm hover:brightness-95 disabled:opacity-60">
              {isSubmitting ? 'Verifying...' : 'Verify code'}
            </button>
            <button type="button" onClick={() => { setError(''); setNotice(''); setMode('forgot') }} className="w-full text-sm text-inkSoft hover:text-ink">
              Back
            </button>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-sm text-inkSoft block mb-1">New password</label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-line rounded-sm px-3 py-2 text-sm focus:border-accent"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="text-sm text-inkSoft block mb-1">Confirm new password</label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={newConfirmPassword}
                onChange={(e) => setNewConfirmPassword(e.target.value)}
                className="w-full border border-line rounded-sm px-3 py-2 text-sm focus:border-accent"
                placeholder="Confirm new password"
              />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-accent text-accentInk font-medium py-2 rounded-sm hover:brightness-95 disabled:opacity-60">
              {isSubmitting ? 'Updating...' : 'Reset password'}
            </button>
            <button type="button" onClick={() => { setError(''); setNotice(''); setMode('login') }} className="w-full text-sm text-inkSoft hover:text-ink">
              Back to sign in
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
