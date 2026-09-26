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
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={TITLES[pathname] || 'StockSense'} />
        <main className="p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
