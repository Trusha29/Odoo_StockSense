import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowDownRight, ArrowRight, ArrowUpRight, CircleAlert, PackageCheck, Plus, Truck, ArrowLeftRight } from 'lucide-react'
import KpiCard from '../components/KpiCard.jsx'
import FilterBar from '../components/FilterBar.jsx'
import DataTable from '../components/DataTable.jsx'
import StatusPill from '../components/StatusPill.jsx'
import { kpis, documents, products } from '../data/mockData.js'
import { filterDocuments } from '../utils/filterDocuments.js'

export default function Dashboard() {
  const filters = useSelector((s) => s.filters)
  const user = useSelector((s) => s.auth.user) || { name: 'Priya Sharma' }
  const firstName = user.name.split(' ')[0]
  const today = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())

  const rows = filterDocuments(documents, filters)

  const columns = [
    { key: 'id', header: 'Reference', render: (r) => <span className="font-mono text-xs font-medium">{r.id}</span> },
    { key: 'type', header: 'Operation' },
    { key: 'partner', header: 'Partner / Route' },
    { key: 'warehouse', header: 'Location' },
    { key: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
    { key: 'date', header: 'Date' },
  ]

  const attentionProducts = products
    .filter((product) => product.stock <= product.reorderPoint)
    .sort((a, b) => a.stock / a.reorderPoint - b.stock / b.reorderPoint)
  const pendingCount = documents.filter((document) => ['Draft', 'Waiting', 'Ready'].includes(document.status)).length
  const activity = [
    { day: 'Mon', incoming: 62, outgoing: 34 },
    { day: 'Tue', incoming: 42, outgoing: 51 },
    { day: 'Wed', incoming: 78, outgoing: 43 },
    { day: 'Thu', incoming: 55, outgoing: 69 },
    { day: 'Fri', incoming: 91, outgoing: 58 },
    { day: 'Sat', incoming: 37, outgoing: 28 },
    { day: 'Sun', incoming: 24, outgoing: 18 },
  ]

  return (
    <div className="space-y-6 animate-page-in">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-inkSoft">{today} · Main Warehouse</p>
          <h2 className="font-head text-2xl font-semibold text-ink mt-1">Good day, {firstName}</h2>
          <p className="text-sm text-inkSoft mt-1">Here’s what’s happening across your inventory today.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/receipts" className="inline-flex items-center gap-2 border border-line bg-surface px-3 py-2 text-sm font-medium text-ink hover:bg-bg rounded-sm"><Plus size={15} /> New receipt</Link>
          <Link to="/deliveries" className="inline-flex items-center gap-2 bg-accent px-3 py-2 text-sm font-semibold text-accentInk hover:brightness-95 rounded-sm"><Plus size={15} /> New operation</Link>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3" aria-label="Inventory overview">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.85fr)]">
        <div className="border border-line rounded-sm bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div>
              <h2 className="font-head text-base font-semibold text-ink">Stock movement</h2>
              <p className="text-xs text-inkSoft mt-1">Inbound and outbound activity · last 7 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-inkSoft">
              <span className="inline-flex items-center gap-1.5"><i className="w-2 h-2 bg-accent rounded-full" /> Incoming</span>
              <span className="inline-flex items-center gap-1.5"><i className="w-2 h-2 bg-teal-600 rounded-full" /> Outgoing</span>
            </div>
          </div>
          <div className="flex h-40 items-end justify-between gap-3 border-b border-line px-1">
            {activity.map((item) => (
              <div key={item.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div className="flex h-[122px] w-full max-w-10 items-end justify-center gap-1">
                  <div className="w-2.5 rounded-t-sm bg-accent/85" style={{ height: `${item.incoming}%` }} title={`${item.incoming} inbound`} />
                  <div className="w-2.5 rounded-t-sm bg-teal-600/85" style={{ height: `${item.outgoing}%` }} title={`${item.outgoing} outbound`} />
                </div>
                <span className="text-[11px] text-inkSoft">{item.day}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 bg-bg px-3 py-2.5 rounded-sm">
              <span className="grid h-8 w-8 place-items-center rounded-sm bg-orange-100 text-orange-700"><ArrowDownRight size={16} /></span>
              <div><p className="text-xs text-inkSoft">Received this week</p><p className="text-sm font-semibold text-ink">1,248 <span className="text-xs font-normal text-success">+12.8%</span></p></div>
            </div>
            <div className="flex items-center gap-3 bg-bg px-3 py-2.5 rounded-sm">
              <span className="grid h-8 w-8 place-items-center rounded-sm bg-teal-50 text-teal-700"><ArrowUpRight size={16} /></span>
              <div><p className="text-xs text-inkSoft">Delivered this week</p><p className="text-sm font-semibold text-ink">864 <span className="text-xs font-normal text-danger">+4.2%</span></p></div>
            </div>
          </div>
        </div>

        <div className="border border-line rounded-sm bg-surface p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-head text-base font-semibold text-ink">Stock to watch</h2>
              <p className="text-xs text-inkSoft mt-1">Items at or below reorder point</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-sm bg-red-50 px-2 py-1 text-xs font-semibold text-danger"><CircleAlert size={13} /> {attentionProducts.length} alerts</span>
          </div>
          <div className="divide-y divide-line">
            {attentionProducts.slice(0, 4).map((product) => {
              const empty = product.stock === 0
              const percent = Math.min(100, Math.round((product.stock / product.reorderPoint) * 100))
              return (
                <div key={product.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0"><p className="truncate text-sm font-medium text-ink">{product.name}</p><p className="font-mono text-[11px] text-inkSoft">{product.sku}</p></div>
                    <span className={`shrink-0 text-xs font-semibold ${empty ? 'text-danger' : 'text-orange-700'}`}>{empty ? 'Out of stock' : 'Low stock'}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"><div className={`h-full rounded-full ${empty ? 'bg-danger' : 'bg-accent'}`} style={{ width: `${percent}%` }} /></div>
                    <span className="w-20 text-right text-[11px] text-inkSoft">{product.stock} / {product.reorderPoint} {product.uom}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <Link to="/products" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900">View all products <ArrowRight size={13} /></Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
            <div><h2 className="font-head text-base font-semibold text-ink">Recent operations</h2><p className="text-xs text-inkSoft mt-1">Latest stock documents across your locations</p></div>
            <span className="text-xs text-inkSoft">{pendingCount} items need attention</span>
          </div>
        <FilterBar />
        <DataTable columns={columns} rows={rows} emptyMessage="No operations match these filters." />
        </div>
        <aside className="border border-line rounded-sm bg-surface p-5 h-fit">
          <div className="flex items-center justify-between mb-4"><h2 className="font-head text-base font-semibold text-ink">Work queue</h2><span className="text-xs text-inkSoft">Today</span></div>
          <div className="space-y-1">
            <Link to="/receipts" className="flex items-center gap-3 rounded-sm px-2 py-3 hover:bg-bg"><span className="grid h-9 w-9 place-items-center rounded-sm bg-orange-50 text-orange-700"><PackageCheck size={17} /></span><span className="flex-1"><span className="block text-sm font-medium text-ink">Receipts to process</span><span className="block text-xs text-inkSoft">Waiting for arrival</span></span><span className="font-head text-lg font-semibold text-ink">6</span></Link>
            <Link to="/deliveries" className="flex items-center gap-3 rounded-sm px-2 py-3 hover:bg-bg"><span className="grid h-9 w-9 place-items-center rounded-sm bg-teal-50 text-teal-700"><Truck size={17} /></span><span className="flex-1"><span className="block text-sm font-medium text-ink">Deliveries to pick</span><span className="block text-xs text-inkSoft">Ready to fulfill</span></span><span className="font-head text-lg font-semibold text-ink">11</span></Link>
            <Link to="/transfers" className="flex items-center gap-3 rounded-sm px-2 py-3 hover:bg-bg"><span className="grid h-9 w-9 place-items-center rounded-sm bg-blue-50 text-blue-700"><ArrowLeftRight size={17} /></span><span className="flex-1"><span className="block text-sm font-medium text-ink">Scheduled transfers</span><span className="block text-xs text-inkSoft">Across locations</span></span><span className="font-head text-lg font-semibold text-ink">4</span></Link>
          </div>
          <Link to="/history" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900">Open stock ledger <ArrowRight size={13} /></Link>
        </aside>
      </section>
    </div>
  )
}
