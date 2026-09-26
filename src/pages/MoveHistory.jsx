import { useSelector } from 'react-redux'
import DataTable from '../components/DataTable.jsx'
import FilterBar from '../components/FilterBar.jsx'
import useInventoryData from '../hooks/useInventoryData.js'

export default function MoveHistory() {
  const filters = useSelector((state) => state.filters)
  const { data, loading, error } = useInventoryData('/inventory/moves', { moves: [] })
  const search = filters.search.trim().toLowerCase()
  const rows = (data.moves || []).filter((move) => {
    if (filters.docType !== 'all' && move.type !== filters.docType) return false
    if (filters.status !== 'all' && move.status !== filters.status) return false
    if (filters.warehouse !== 'all' && ![move.from, move.to].includes(filters.warehouse)) return false
    if (filters.category !== 'all' && move.category !== filters.category) return false
    return !search || `${move.id} ${move.product} ${move.sku} ${move.ref} ${move.from} ${move.to}`.toLowerCase().includes(search)
  })

  const columns = [
    { key: 'id', header: 'Move' },
    { key: 'product', header: 'Product' },
    {
      key: 'qty',
      header: 'Qty',
      render: (r) => (
        <span className={`font-mono font-medium ${r.qty.startsWith('+') ? 'text-success' : 'text-danger'}`}>{r.qty}</span>
      ),
    },
    { key: 'from', header: 'From' },
    { key: 'to', header: 'To' },
    { key: 'ref', header: 'Reference' },
    { key: 'date', header: 'Date' },
  ]

  return (
    <div className="space-y-4">
      <p className="text-sm text-inkSoft">
        A read-only ledger of every stock movement. This is the audit trail every receipt, delivery, transfer and adjustment writes to.
      </p>
      <FilterBar />
      {error && <p className="text-sm text-danger">{error}</p>}
      {loading && <p className="text-sm text-inkSoft">Loading stock movements...</p>}
      <DataTable columns={columns} rows={rows} />
    </div>
  )
}
