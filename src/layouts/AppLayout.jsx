import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'

const TITLES = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/receipts': 'Receipts',
  '/deliveries': 'Delivery Orders',
  '/transfers': 'Internal Transfers',
  '/adjustments': 'Stock Adjustments',
  '/history': 'Move History',
  '/settings': 'Warehouses',
  '/profile': 'My Profile',
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  return (
    <div className="flex min-h-screen bg-bg">
      {mobileNavOpen && <button className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" />}
      <Sidebar mobileOpen={mobileNavOpen} onNavigate={() => setMobileNavOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={TITLES[pathname] || 'StockSense'} onMenuToggle={() => setMobileNavOpen((open) => !open)} />
        <main className="p-4 md:p-6 flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
