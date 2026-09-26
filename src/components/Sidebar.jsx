import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
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
} from 'lucide-react'
import { getPermissions } from '../utils/permissions.js'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/receipts', label: 'Receipts', icon: PackageCheck },
  { to: '/deliveries', label: 'Delivery Orders', icon: Truck },
  { to: '/transfers', label: 'Internal Transfers', icon: ArrowLeftRight },
  { to: '/adjustments', label: 'Adjustments', icon: ClipboardList },
  { to: '/history', label: 'Move History', icon: History },
]

export default function Sidebar() {
  const role = useSelector((s) => s.auth.user?.role)
  const { canManageWarehouses } = getPermissions(role)
  return (
    <aside className="w-60 shrink-0 bg-sidebar text-sidebarInk flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-white/10">
        <p className="font-head text-lg font-semibold text-white">StockSense</p>
        <p className="text-xs text-sidebarInk/70">Inventory Management</p>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors ${
                isActive
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-sidebarInk hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={16} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-2 py-3 border-t border-white/10 space-y-1">
        {canManageWarehouses && (
          <NavLink
            to="/settings"
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
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-sm text-sm ${
              isActive ? 'bg-white/10 text-white' : 'text-sidebarInk hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <User size={16} />
          My Profile
        </NavLink>
      </div>
    </aside>
  )
}
