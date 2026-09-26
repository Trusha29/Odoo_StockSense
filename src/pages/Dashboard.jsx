import { useSelector } from 'react-redux'
import KpiCard from '../components/KpiCard.jsx'
import FilterBar from '../components/FilterBar.jsx'
import DataTable from '../components/DataTable.jsx'
import StatusPill from '../components/StatusPill.jsx'
import { kpis, documents } from '../data/mockData.js'

export default function Dashboard() {
  const filters = useSelector((s) => s.filters)

  const rows = documents.filter((d) => {
    if (filters.docType !== 'all' && d.type !== filters.docType) return false
    if (filters.status !== 'all' && d.status !== filters.status) return false
    if (filters.warehouse !== 'all' && d.warehouse !== filters.warehouse) return false
    if (filters.search && !`${d.id} ${d.partner}`.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  const columns = [
    { key: 'id', header: 'Document' },
    { key: 'type', header: 'Type' },
    { key: 'partner', header: 'Partner / Reference' },
    { key: 'warehouse', header: 'Warehouse' },
    { key: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
    { key: 'date', header: 'Date' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div>
        <h2 className="font-head text-sm font-semibold text-inkSoft mb-3">Recent operations</h2>
        <FilterBar />
        <DataTable columns={columns} rows={rows} emptyMessage="No operations match these filters." />
      </div>
    </div>
  )
}
