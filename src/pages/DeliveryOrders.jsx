import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Plus, Check } from 'lucide-react'
import DataTable from '../components/DataTable.jsx'
import FilterBar from '../components/FilterBar.jsx'
import StatusPill from '../components/StatusPill.jsx'
import { documents } from '../data/mockData.js'
import { getPermissions } from '../utils/permissions.js'
import { filterDocuments } from '../utils/filterDocuments.js'

const STEPS = ['Pick', 'Pack', 'Validate']

export default function DeliveryOrders() {
  const [selected, setSelected] = useState(null)
  const [step, setStep] = useState(0)
  const role = useSelector((s) => s.auth.user?.role)
  const filters = useSelector((s) => s.filters)
  const { canCreateDeliveries } = getPermissions(role)
  const rows = filterDocuments(documents, filters, 'Delivery')

  const open = (r) => { setSelected(r); setStep(0) }

  const columns = [
    { key: 'id', header: 'Delivery' },
    { key: 'partner', header: 'Customer' },
    { key: 'warehouse', header: 'Warehouse' },
    { key: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
    { key: 'date', header: 'Date' },
    { key: 'actions', header: '', render: (r) => <button onClick={() => open(r)} className="text-sm text-accent font-medium hover:underline">Open</button> },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FilterBar showDocType={false} />
        {canCreateDeliveries && (
          <button className="flex items-center gap-1.5 bg-accent text-accentInk text-sm font-medium px-3 py-2 rounded-sm hover:brightness-95 h-fit">
            <Plus size={16} /> New delivery order
          </button>
        )}
      </div>
      {!canCreateDeliveries && (
        <p className="text-xs text-inkSoft -mt-2">Only Inventory Managers can create new delivery orders. You can still pick, pack and validate existing ones.</p>
      )}

      <DataTable columns={columns} rows={rows} />

      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20" onClick={() => setSelected(null)}>
          <div className="bg-surface rounded-sm border border-line p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-head text-lg font-semibold">{selected.id}</h3>
              <StatusPill status={selected.status} />
            </div>
            <p className="text-sm text-inkSoft mb-4">Customer: {selected.partner} — {selected.warehouse}</p>

            <div className="flex items-center gap-2 mb-4">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${i <= step ? 'bg-accent text-accentInk' : 'bg-line text-inkSoft'}`}>
                    {i + 1}
                  </div>
                  <span className={`text-sm ${i <= step ? 'text-ink font-medium' : 'text-inkSoft'}`}>{label}</span>
                  {i < STEPS.length - 1 && <div className="w-6 h-px bg-line" />}
                </div>
              ))}
            </div>

            <div className="border border-line rounded-sm p-3 text-sm text-inkSoft mb-4">
              {step === 0 && '10x Oak Chair Frame — confirm items picked from shelf.'}
              {step === 1 && 'Pack picked items into shipment boxes.'}
              {step === 2 && 'Validating will decrease stock by the packed quantities.'}
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setSelected(null)} className="text-sm text-inkSoft px-3 py-2">Close</button>
              {step < STEPS.length - 1 ? (
                <button onClick={() => setStep(step + 1)} className="bg-accent text-accentInk text-sm font-medium px-4 py-2 rounded-sm hover:brightness-95">
                  Mark {STEPS[step].toLowerCase()}ed
                </button>
              ) : (
                <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 bg-success text-white text-sm font-medium px-4 py-2 rounded-sm hover:brightness-95">
                  <Check size={16} /> Validate delivery
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
