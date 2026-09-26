import { useState } from 'react'
import { Plus } from 'lucide-react'
import DataTable from '../components/DataTable.jsx'
import FilterBar from '../components/FilterBar.jsx'
import StatusPill from '../components/StatusPill.jsx'
import { documents } from '../data/mockData.js'

export default function Adjustments() {
  const [showForm, setShowForm] = useState(false)
  const [counted, setCounted] = useState('')
  const systemQty = 91

  const rows = documents.filter((d) => d.type === 'Adjustment')
  const diff = counted !== '' ? Number(counted) - systemQty : null

  const columns = [
    { key: 'id', header: 'Adjustment' },
    { key: 'partner', header: 'Reference' },
    { key: 'warehouse', header: 'Location' },
    { key: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
    { key: 'date', header: 'Date' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FilterBar showDocType={false} />
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-accent text-accentInk text-sm font-medium px-3 py-2 rounded-sm hover:brightness-95 h-fit">
          <Plus size={16} /> New adjustment
        </button>
      </div>

      <DataTable columns={columns} rows={rows} />

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20" onClick={() => setShowForm(false)}>
          <div className="bg-surface rounded-sm border border-line p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-head text-lg font-semibold mb-4">New stock adjustment</h3>
            <div className="space-y-3">
              <select className="w-full border border-line rounded-sm px-3 py-2 text-sm"><option>Product / Location</option></select>
              <div className="flex items-center justify-between text-sm bg-bg border border-line rounded-sm px-3 py-2">
                <span className="text-inkSoft">System quantity</span>
                <span className="font-mono">{systemQty}</span>
              </div>
              <input
                type="number"
                value={counted}
                onChange={(e) => setCounted(e.target.value)}
                className="w-full border border-line rounded-sm px-3 py-2 text-sm"
                placeholder="Counted quantity"
              />
              {diff !== null && (
                <p className={`text-sm ${diff === 0 ? 'text-success' : 'text-danger'}`}>
                  {diff === 0 ? 'Matches system count.' : `Difference: ${diff > 0 ? '+' : ''}${diff}`}
                </p>
              )}
              <input className="w-full border border-line rounded-sm px-3 py-2 text-sm" placeholder="Reason (damaged, miscount, theft...)" />
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowForm(false)} className="text-sm text-inkSoft px-3 py-2">Cancel</button>
              <button onClick={() => setShowForm(false)} className="bg-accent text-accentInk text-sm font-medium px-4 py-2 rounded-sm">Log adjustment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
