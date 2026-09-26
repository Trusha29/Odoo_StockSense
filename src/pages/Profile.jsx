import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../store/authSlice.js'
import { formatRole } from '../utils/permissions.js'

export default function Profile() {
  const user = useSelector((s) => s.auth.user) || { name: 'User', role: '', email: '' }
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return (
    <div className="max-w-md bg-surface border border-line rounded-sm p-6 space-y-4">
      <div className="w-14 h-14 rounded-full bg-sidebar text-white flex items-center justify-center font-head text-lg font-semibold">
        {user.name.split(' ').map((n) => n[0]).join('')}
      </div>
      <div>
        <p className="font-head text-lg font-semibold text-ink">{user.name}</p>
        <p className="text-sm text-inkSoft">{formatRole(user.role)}</p>
      </div>
      <div className="border-t border-line pt-4 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-inkSoft">Email</span><span>{user.email || 'priya@stocksense.io'}</span></div>
        <div className="flex justify-between"><span className="text-inkSoft">Role</span><span>{formatRole(user.role)}</span></div>
      </div>
      <button
        onClick={() => { dispatch(logout()); navigate('/login') }}
        className="w-full border border-line text-danger text-sm font-medium py-2 rounded-sm hover:bg-red-50"
      >
        Log out
      </button>
    </div>
  )
}
