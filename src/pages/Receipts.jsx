import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Plus, Check } from 'lucide-react'
import DataTable from '../components/DataTable.jsx'
import FilterBar from '../components/FilterBar.jsx'
import StatusPill from '../components/StatusPill.jsx'
import { documents } from '../data/mockData.js'
import { getPermissions } from '../utils/permissions.js'
import { filterDocuments } from '../utils/filterDocuments.js'

export default function Receipts() {
  const [selected, setSelected] = useState(null)
  const role = useSelector((s) => s.auth.user?.role)
  const filters = useSelector((s) => s.filters)
  const { canCreateReceipts } = getPermissions(role)
  const rows = filterDocuments(documents, filters, 'Receipt')

  const columns = [
    { key: 'id', header: 'Receipt' },
    { key: 'partner', header: 'Supplier' },
    { key: 'warehouse', header: 'Warehouse' },
    { key: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
    { key: 'date', header: 'Date' },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <button onClick={() => setSelected(r)} className="text-sm text-accent font-medium hover:underline">
          Open
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FilterBar showDocType={false} />
        {canCreateReceipts && (
          <button className="flex items-center gap-1.5 bg-accent text-accentInk text-sm font-medium px-3 py-2 rounded-sm hover:brightness-95 h-fit">
            <Plus size={16} /> New receipt
          </button>
        )}
      </div>
      {!canCreateReceipts && (
        <p className="text-xs text-inkSoft -mt-2">Only Inventory Managers can create new receipts. You can still open and process existing ones.</p>
      )}

      <DataTable columns={columns} rows={rows} />

      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20" onClick={() => setSelected(null)}>
          <div className="bg-surface rounded-sm border border-line p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-head text-lg font-semibold">{selected.id}</h3>
              <StatusPill status={selected.status} />
            </div>
            <p className="text-sm text-inkSoft mb-4">Supplier: {selected.partner} — {selected.warehouse}</p>

            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="border-b border-line text-left text-inkSoft">
                  <th className="py-2 font-medium">Product</th>
                  <th className="py-2 font-medium">Expected</th>
                  <th className="py-2 font-medium">Received</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line">
                  <td className="py-2">Steel Rods 8mm</td>
                  <td className="py-2">50 kg</td>
                  <td className="py-2"><input defaultValue={50} className="w-20 border border-line rounded-sm px-2 py-1" /></td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-end gap-2">
              <button onClick={() => setSelected(null)} className="text-sm text-inkSoft px-3 py-2">Close</button>
              <button
                onClick={() => setSelected(null)}
                className="flex items-center gap-1.5 bg-success text-white text-sm font-medium px-4 py-2 rounded-sm hover:brightness-95"
              >
                <Check size={16} /> Validate receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
