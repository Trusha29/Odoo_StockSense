import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Plus, Check, ArrowRight } from 'lucide-react'
import api from '../api/axiosClient.js'
import DataTable from './DataTable.jsx'
import FilterBar from './FilterBar.jsx'
import StatusPill from './StatusPill.jsx'
import useInventoryData from '../hooks/useInventoryData.js'
import { getPermissions } from '../utils/permissions.js'
import { filterDocuments } from '../utils/filterDocuments.js'

const EMPTY_FORM = { lines: [{ productId: '', quantity: '1' }], warehouse: '', sourceLocation: '', destinationLocation: '', partner: '', reason: '' }

export default function OperationManager({ type, title, createLabel, partnerLabel }) {
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const role = useSelector((state) => state.auth.user?.role)
  const filters = useSelector((state) => state.filters)
  const permissions = getPermissions(role)
  const canCreate = type === 'Receipt' ? permissions.canCreateReceipts
    : type === 'Delivery' ? permissions.canCreateDeliveries
      : true
  const { data: documentData, loading, error, reload } = useInventoryData('/inventory/documents', { documents: [] })
  const { data: productData } = useInventoryData('/inventory/products', { products: [] })
  const { data: filterData } = useInventoryData('/inventory/filters', { categories: [], warehouses: [] })
  const warehouses = filterData.warehouses || []
  const products = productData.products || []
  const rows = filterDocuments(documentData.documents || [], filters, type)

  useEffect(() => {
    setForm((current) => ({
      ...current,
      lines: current.lines.map((line) => ({ ...line, productId: line.productId || products[0]?.id || '' })),
      warehouse: current.warehouse || warehouses[0] || '',
      sourceLocation: current.sourceLocation || warehouses[0] || '',
      destinationLocation: current.destinationLocation || warehouses[1] || ''
    }))
  }, [products, warehouses])

  const openForm = () => {
    setErrorMessage('')
    setForm({
      ...EMPTY_FORM,
      lines: [{ productId: products[0]?.id || '', quantity: type === 'Adjustment' ? '0' : '1' }],
      warehouse: warehouses[0] || '',
      sourceLocation: warehouses[0] || '',
      destinationLocation: warehouses[1] || ''
    })
    setShowForm(true)
  }

  const changeField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const changeLine = (index, field, value) => setForm((current) => ({
    ...current,
    lines: current.lines.map((line, lineIndex) => lineIndex === index ? { ...line, [field]: value } : line)
  }))

  const saveDocument = async (event) => {
    event.preventDefault()
    setBusy(true)
    setErrorMessage('')
    try {
      const payload = { ...form, type, lines: form.lines.map((line) => ({ ...line, quantity: Number(line.quantity) })) }
      await api.post('/inventory/documents', payload)
      setShowForm(false)
      reload()
    } catch (requestError) {
      setErrorMessage(requestError.response?.data?.message || 'Unable to create this operation.')
    } finally {
      setBusy(false)
    }
  }

  const updateStatus = async (status) => {
    setBusy(true)
    setErrorMessage('')
    try {
      const response = await api.patch(`/inventory/documents/${selected._id}/status`, { status })
      setSelected(response.data.document)
      reload()
    } catch (requestError) {
      setErrorMessage(requestError.response?.data?.message || 'Unable to update this operation.')
    } finally {
      setBusy(false)
    }
  }

  const columns = [
    { key: 'id', header: type === 'Receipt' ? 'Receipt' : type === 'Delivery' ? 'Delivery' : type === 'Internal' ? 'Transfer' : 'Adjustment', render: (row) => <span className="font-mono text-xs">{row.id}</span> },
    { key: 'partner', header: partnerLabel },
    { key: 'warehouse', header: type === 'Internal' ? 'Route / Location' : 'Warehouse' },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
    { key: 'date', header: 'Date' },
    { key: 'actions', header: '', render: (row) => <button onClick={() => { setSelected(row); setErrorMessage('') }} className="text-sm text-accent font-medium hover:underline">Open</button> }
  ]

  const nextStatus = selected?.status === 'Draft' ? 'Waiting' : selected?.status === 'Waiting' ? 'Ready' : selected?.status === 'Ready' ? 'Done' : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FilterBar showDocType={false} />
        {canCreate && (
          <button onClick={openForm} className="flex items-center gap-1.5 bg-accent text-accentInk text-sm font-medium px-3 py-2 rounded-sm hover:brightness-95 h-fit">
            <Plus size={16} /> {createLabel}
          </button>
        )}
      </div>
      {!canCreate && <p className="text-xs text-inkSoft -mt-2">Only Inventory Managers can create {type.toLowerCase()}s. Existing operations can still be opened and processed.</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
      {loading && <p className="text-sm text-inkSoft">Loading operations...</p>}
      <DataTable columns={columns} rows={rows} emptyMessage={`No ${type.toLowerCase()}s match these filters.`} />

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20 px-4" onClick={() => setShowForm(false)}>
          <form onSubmit={saveDocument} className="bg-surface rounded-sm border border-line p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
            <h3 className="font-head text-lg font-semibold mb-4">New {title.toLowerCase()}</h3>
            {errorMessage && <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-sm px-3 py-2 mb-3">{errorMessage}</p>}
            <div className="space-y-3">
              {form.lines.map((line, index) => (
                <div key={`line-${index}`} className="space-y-2 border border-line rounded-sm p-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-inkSoft">Product {index + 1}</label>
                    {form.lines.length > 1 && <button type="button" onClick={() => setForm((current) => ({ ...current, lines: current.lines.filter((_, lineIndex) => lineIndex !== index) }))} className="text-xs text-danger hover:underline">Remove</button>}
                  </div>
                  <select required value={line.productId} onChange={(event) => changeLine(index, 'productId', event.target.value)} className="w-full border border-line rounded-sm px-3 py-2 text-sm">
                    <option value="">Choose product</option>
                    {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>)}
                  </select>
                  {type === 'Adjustment' ? (
                    <input required type="number" min="0" step="any" value={line.quantity} onChange={(event) => changeLine(index, 'quantity', event.target.value)} className="w-full border border-line rounded-sm px-3 py-2 text-sm" placeholder="Counted quantity" />
                  ) : (
                    <input required type="number" min="0.01" step="any" value={line.quantity} onChange={(event) => changeLine(index, 'quantity', event.target.value)} className="w-full border border-line rounded-sm px-3 py-2 text-sm" placeholder="Quantity" />
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setForm((current) => ({ ...current, lines: [...current.lines, { productId: '', quantity: type === 'Adjustment' ? '0' : '1' }] }))} className="text-sm text-accent font-medium hover:underline">Add product line</button>
              {type === 'Internal' ? (
                <div className="flex items-center gap-2">
                  <select required value={form.sourceLocation} onChange={changeField('sourceLocation')} className="min-w-0 flex-1 border border-line rounded-sm px-3 py-2 text-sm">
                    {warehouses.map((warehouse) => <option key={warehouse} value={warehouse}>{warehouse}</option>)}
                  </select>
                  <ArrowRight size={16} className="text-inkSoft shrink-0" />
                  <select required value={form.destinationLocation} onChange={changeField('destinationLocation')} className="min-w-0 flex-1 border border-line rounded-sm px-3 py-2 text-sm">
                    {warehouses.map((warehouse) => <option key={warehouse} value={warehouse}>{warehouse}</option>)}
                  </select>
                </div>
              ) : (
                <select required value={form.warehouse} onChange={changeField('warehouse')} className="w-full border border-line rounded-sm px-3 py-2 text-sm">
                  {warehouses.map((warehouse) => <option key={warehouse} value={warehouse}>{warehouse}</option>)}
                </select>
              )}
              {type === 'Adjustment' && <input value={form.reason} onChange={changeField('reason')} className="w-full border border-line rounded-sm px-3 py-2 text-sm" placeholder="Reason" />}
              {partnerLabel !== 'Route' && type !== 'Adjustment' && (
                <input required value={form.partner} onChange={changeField('partner')} className="w-full border border-line rounded-sm px-3 py-2 text-sm" placeholder={partnerLabel} />
              )}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-inkSoft px-3 py-2">Cancel</button>
              <button disabled={busy || !products.length || !warehouses.length} className="bg-accent text-accentInk text-sm font-medium px-4 py-2 rounded-sm disabled:opacity-60">
                {busy ? 'Saving...' : createLabel}
              </button>
            </div>
          </form>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20 px-4" onClick={() => setSelected(null)}>
          <div className="bg-surface rounded-sm border border-line p-6 w-full max-w-lg" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-head text-lg font-semibold">{selected.id}</h3>
              <StatusPill status={selected.status} />
            </div>
            {errorMessage && <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-sm px-3 py-2 mb-3">{errorMessage}</p>}
            <div className="space-y-2 text-sm text-inkSoft mb-5">
              <p>{partnerLabel}: {selected.partner || 'Stock count'} · {selected.warehouse}</p>
              <div><p className="font-medium text-ink">Products</p>{(selected.lines || [{ product: selected.product, sku: selected.sku, quantity: selected.quantity }]).map((line) => <p key={`${line.productId || line.sku}-${line.sku}`}>{line.product} ({line.sku}) · {line.quantity}</p>)}</div>
              {selected.reason && <p>Reason: {selected.reason}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setSelected(null)} className="text-sm text-inkSoft px-3 py-2">Close</button>
              {selected.status !== 'Done' && selected.status !== 'Canceled' && (
                <>
                  <button disabled={busy} onClick={() => updateStatus('Canceled')} className="border border-line text-sm text-danger px-3 py-2 rounded-sm disabled:opacity-60">Cancel operation</button>
                  {nextStatus && <button disabled={busy} onClick={() => updateStatus(nextStatus)} className={`flex items-center gap-1.5 ${nextStatus === 'Done' ? 'bg-success text-white' : 'bg-accent text-accentInk'} text-sm font-medium px-4 py-2 rounded-sm hover:brightness-95 disabled:opacity-60`}>
                    {nextStatus === 'Done' && <Check size={16} />}{busy ? 'Updating...' : nextStatus === 'Done' ? 'Validate operation' : `Mark ${nextStatus.toLowerCase()}`}
                  </button>}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}