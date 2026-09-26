import { NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Truck,
  PackageCheck,
  ArrowLeftRight,
  ClipboardList,
  History,
  Settings,
  User,
  Boxes,
  LogOut,
} from 'lucide-react'
import { getPermissions } from '../utils/permissions.js'
import { logout } from '../store/authSlice.js'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/receipts', label: 'Receipts', icon: PackageCheck },
  { to: '/deliveries', label: 'Delivery Orders', icon: Truck },
  { to: '/transfers', label: 'Internal Transfers', icon: ArrowLeftRight },
  { to: '/adjustments', label: 'Adjustments', icon: ClipboardList },
  { to: '/history', label: 'Move History', icon: History },
]

export default function Sidebar({ mobileOpen, onNavigate }) {
  const role = useSelector((s) => s.auth.user?.role)
  const user = useSelector((s) => s.auth.user) || { name: 'Priya Sharma', role: 'Inventory Manager' }
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { canManageWarehouses } = getPermissions(role)
  return (
    <aside className={`fixed inset-y-0 left-0 z-30 flex h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebarInk transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <span className="grid h-9 w-9 place-items-center rounded-sm bg-accent text-accentInk"><Boxes size={20} /></span>
        <div>
          <p className="font-head text-lg font-semibold text-white leading-5">StockSense</p>
          <p className="text-[11px] text-sidebarInk/70">INVENTORY CONTROL</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-5 px-3">
        <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebarInk/50">Workspace</p>
        <div className="space-y-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
                isActive
                  ? 'bg-white/10 text-white font-medium before:absolute before:left-0 before:h-7 before:w-[3px] before:rounded-r before:bg-accent relative'
                  : 'text-sidebarInk hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={16} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
        </div>
      </nav>

      <div className="border-t border-white/10 px-3 py-3 space-y-1">
        <div className="mb-3 flex items-center gap-3 px-2 py-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-xs font-semibold text-white">{user.name.split(' ').map((n) => n[0]).join('')}</div>
          <div className="min-w-0"><p className="truncate text-xs font-medium text-white">{user.name}</p><p className="truncate text-[11px] text-sidebarInk/65">{user.role}</p></div>
        </div>
        {canManageWarehouses && (
          <NavLink
            to="/settings"
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-sm text-sm ${
                isActive ? 'bg-white/10 text-white' : 'text-sidebarInk hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Settings size={16} />
            Settings
          </NavLink>
        )}
        <NavLink
          to="/profile"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-sm text-sm ${
              isActive ? 'bg-white/10 text-white' : 'text-sidebarInk hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <User size={16} />
          My Profile
        </NavLink>
        <button
          onClick={() => { dispatch(logout()); onNavigate?.(); navigate('/login') }}
          className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm text-sidebarInk hover:bg-white/5 hover:text-white"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  )
}
