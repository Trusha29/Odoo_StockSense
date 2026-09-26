import { Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Products from './pages/Products.jsx'
import Receipts from './pages/Receipts.jsx'
import DeliveryOrders from './pages/DeliveryOrders.jsx'
import InternalTransfers from './pages/InternalTransfers.jsx'
import Adjustments from './pages/Adjustments.jsx'
import MoveHistory from './pages/MoveHistory.jsx'
import Settings from './pages/Settings.jsx'
import Profile from './pages/Profile.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="receipts" element={<Receipts />} />
        <Route path="deliveries" element={<DeliveryOrders />} />
        <Route path="transfers" element={<InternalTransfers />} />
        <Route path="adjustments" element={<Adjustments />} />
        <Route path="history" element={<MoveHistory />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}
