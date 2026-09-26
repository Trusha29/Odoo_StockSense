import { useSelector } from 'react-redux'
import { Bell } from 'lucide-react'

export default function Topbar({ title }) {
  const user = useSelector((s) => s.auth.user) || { name: 'Priya Sharma', role: 'Inventory Manager' }

  return (
    <header className="flex items-center justify-between border-b border-line bg-surface px-6 py-4 sticky top-0 z-10">
      <h1 className="font-head text-xl font-semibold text-ink">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="relative text-inkSoft hover:text-ink" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-danger" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-sidebar text-white flex items-center justify-center text-xs font-medium">
            {user.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="text-sm leading-tight">
            <p className="text-ink font-medium">{user.name}</p>
            <p className="text-inkSoft text-xs">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
