import { useSelector } from 'react-redux'
import { Bell, Menu } from 'lucide-react'
import { formatRole } from '../utils/permissions.js'

export default function Topbar({ title, onMenuToggle }) {
  const user = useSelector((s) => s.auth.user) || { name: 'User', role: '' }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:px-6 md:py-4">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="grid h-9 w-9 place-items-center rounded-sm text-inkSoft hover:bg-bg hover:text-ink lg:hidden" aria-label="Open navigation"><Menu size={19} /></button>
        <div><p className="text-[10px] font-semibold uppercase tracking-wider text-inkSoft">StockSense / Operations</p><h1 className="font-head text-lg font-semibold text-ink md:text-xl">{title}</h1></div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative grid h-9 w-9 place-items-center rounded-sm text-inkSoft hover:bg-bg hover:text-ink" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-danger" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-sidebar text-white flex items-center justify-center text-xs font-medium">
            {user.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="hidden text-sm leading-tight sm:block">
            <p className="text-ink font-medium">{user.name}</p>
            <p className="text-inkSoft text-xs">{formatRole(user.role)}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
