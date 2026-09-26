import { useState } from 'react'
import { Plus, ArrowRight } from 'lucide-react'
import DataTable from '../components/DataTable.jsx'
import FilterBar from '../components/FilterBar.jsx'
import StatusPill from '../components/StatusPill.jsx'
import { documents, warehouses } from '../data/mockData.js'
import { useSelector } from 'react-redux'
import { filterDocuments } from '../utils/filterDocuments.js'

export default function InternalTransfers() {
  const [showForm, setShowForm] = useState(false)
  const filters = useSelector((s) => s.filters)
  const rows = filterDocuments(documents, filters, 'Internal')

  const columns = [
    { key: 'id', header: 'Transfer' },
    { key: 'partner', header: 'Route' },
    { key: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
    { key: 'date', header: 'Date' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FilterBar showDocType={false} />
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-accent text-accentInk text-sm font-medium px-3 py-2 rounded-sm hover:brightness-95 h-fit">
          <Plus size={16} /> New transfer
        </button>
      </div>

      <DataTable columns={columns} rows={rows} />

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20" onClick={() => setShowForm(false)}>
          <div className="bg-surface rounded-sm border border-line p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-head text-lg font-semibold mb-4">New internal transfer</h3>
            <div className="space-y-3">
              <select className="w-full border border-line rounded-sm px-3 py-2 text-sm"><option>Product</option></select>
              <input className="w-full border border-line rounded-sm px-3 py-2 text-sm" placeholder="Quantity" />
              <div className="flex items-center gap-2">
                <select className="flex-1 border border-line rounded-sm px-3 py-2 text-sm">
                  {warehouses.map((w) => <option key={w}>{w}</option>)}
                </select>
                <ArrowRight size={16} className="text-inkSoft shrink-0" />
                <select className="flex-1 border border-line rounded-sm px-3 py-2 text-sm">
                  {warehouses.map((w) => <option key={w}>{w}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowForm(false)} className="text-sm text-inkSoft px-3 py-2">Cancel</button>
              <button onClick={() => setShowForm(false)} className="bg-accent text-accentInk text-sm font-medium px-4 py-2 rounded-sm">Confirm transfer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
