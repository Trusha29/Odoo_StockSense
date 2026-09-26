import DataTable from '../components/DataTable.jsx'
import FilterBar from '../components/FilterBar.jsx'
import { moveHistory } from '../data/mockData.js'

export default function MoveHistory() {
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
      <FilterBar showDocType={false} />
      <DataTable columns={columns} rows={moveHistory} />
    </div>
  )
}
