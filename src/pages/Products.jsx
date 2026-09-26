import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Plus } from 'lucide-react'
import DataTable from '../components/DataTable.jsx'
import FilterBar from '../components/FilterBar.jsx'
import StatusPill from '../components/StatusPill.jsx'
import { products } from '../data/mockData.js'
import { getPermissions } from '../utils/permissions.js'

export default function Products() {
  const [showForm, setShowForm] = useState(false)
  const filters = useSelector((s) => s.filters)
  const role = useSelector((s) => s.auth.user?.role)
  const { canCreateProducts } = getPermissions(role)

  const rows = products.filter((p) => {
    if (filters.category !== 'all' && p.category !== filters.category) return false
    if (filters.search && !`${p.sku} ${p.name}`.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  const stockStatus = (p) => {
    if (p.stock === 0) return 'Cancelled' // reuse danger styling via StatusPill mapping below
    if (p.stock <= p.reorderPoint) return 'Waiting'
    return 'Done'
  }
  const stockLabel = (p) => (p.stock === 0 ? 'Out of stock' : p.stock <= p.reorderPoint ? 'Low stock' : 'In stock')

  const columns = [
    { key: 'sku', header: 'SKU', render: (r) => <span className="font-mono text-xs">{r.sku}</span> },
    { key: 'name', header: 'Product' },
    { key: 'category', header: 'Category' },
    { key: 'stock', header: 'On hand', render: (r) => `${r.stock} ${r.uom}` },
    { key: 'reorderPoint', header: 'Reorder point', render: (r) => `${r.reorderPoint} ${r.uom}` },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusPill status={stockStatus(r)} label={stockLabel(r)} />,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FilterBar showDocType={false} showStatus={false} showWarehouse={false} />
        {canCreateProducts && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-accent text-accentInk text-sm font-medium px-3 py-2 rounded-sm hover:brightness-95 h-fit"
          >
            <Plus size={16} /> New product
          </button>
        )}
      </div>
      {!canCreateProducts && (
        <p className="text-xs text-inkSoft -mt-2">Warehouse staff can view stock but not create or edit products.</p>
      )}

      <DataTable columns={columns} rows={rows} emptyMessage="No products match these filters." />

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20" onClick={() => setShowForm(false)}>
          <div className="bg-surface rounded-sm border border-line p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-head text-lg font-semibold mb-4">New product</h3>
            <div className="space-y-3">
              <input className="w-full border border-line rounded-sm px-3 py-2 text-sm" placeholder="Product name" />
              <input className="w-full border border-line rounded-sm px-3 py-2 text-sm font-mono" placeholder="SKU / Code" />
              <select className="w-full border border-line rounded-sm px-3 py-2 text-sm">
                <option>Category</option>
              </select>
              <input className="w-full border border-line rounded-sm px-3 py-2 text-sm" placeholder="Unit of measure (kg, pcs...)" />
              <input className="w-full border border-line rounded-sm px-3 py-2 text-sm" placeholder="Initial stock (optional)" />
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowForm(false)} className="text-sm text-inkSoft px-3 py-2">Cancel</button>
              <button onClick={() => setShowForm(false)} className="bg-accent text-accentInk text-sm font-medium px-4 py-2 rounded-sm">
                Save product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
