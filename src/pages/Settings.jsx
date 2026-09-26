import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Plus, Lock } from 'lucide-react'
import DataTable from '../components/DataTable.jsx'
import { warehouses } from '../data/mockData.js'
import { getPermissions } from '../utils/permissions.js'

export default function Settings() {
  const [showForm, setShowForm] = useState(false)
  const role = useSelector((s) => s.auth.user?.role)
  const { canManageWarehouses } = getPermissions(role)
  const rows = warehouses.map((w, i) => ({ id: i, name: w, code: w.slice(0, 3).toUpperCase() }))

  if (!canManageWarehouses) {
    return (
      <div className="max-w-md bg-surface border border-line rounded-sm p-8 text-center">
        <Lock size={24} className="mx-auto text-inkSoft mb-3" />
        <p className="font-head font-semibold text-ink mb-1">Manager access only</p>
        <p className="text-sm text-inkSoft">Warehouse and location setup is managed by Inventory Managers. Ask your manager if you need a new location added.</p>
      </div>
    )
  }

  const columns = [
    { key: 'code', header: 'Code', render: (r) => <span className="font-mono text-xs">{r.code}</span> },
    { key: 'name', header: 'Warehouse / Location' },
  ]

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="font-head text-sm font-semibold text-inkSoft">Warehouses & locations</h2>
        {canManageWarehouses && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-accent text-accentInk text-sm font-medium px-3 py-2 rounded-sm hover:brightness-95">
            <Plus size={16} /> Add warehouse
          </button>
        )}
      </div>

      <DataTable columns={columns} rows={rows} />

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20" onClick={() => setShowForm(false)}>
          <div className="bg-surface rounded-sm border border-line p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-head text-lg font-semibold mb-4">Add warehouse</h3>
            <input className="w-full border border-line rounded-sm px-3 py-2 text-sm mb-3" placeholder="Warehouse name" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="text-sm text-inkSoft px-3 py-2">Cancel</button>
              <button onClick={() => setShowForm(false)} className="bg-accent text-accentInk text-sm font-medium px-4 py-2 rounded-sm">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
