import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Plus, Trash2 } from 'lucide-react'
import DataTable from './DataTable.jsx'
import useInventoryData from '../hooks/useInventoryData.js'
import api from '../api/axiosClient.js'
import { getPermissions } from '../utils/permissions.js'

export default function ReorderRules() {
  const role = useSelector((state) => state.auth.user?.role)
  const { canCreateProducts } = getPermissions(role)
  const { data: rulesData, loading, error, reload } = useInventoryData('/inventory/reorder-rules', { rules: [] })
  const { data: productsData } = useInventoryData('/inventory/products', { products: [] })
  const { data: filterData } = useInventoryData('/inventory/filters', { warehouses: [] })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ productId: '', location: '', reorderAt: '0', targetStock: '0' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const rules = rulesData.rules || []
  const products = productsData.products || []
  const locations = filterData.warehouses || []

  const createRule = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      await api.post('/inventory/reorder-rules', {
        ...form,
        reorderAt: Number(form.reorderAt),
        targetStock: Number(form.targetStock)
      })
      setShowForm(false)
      reload()
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || 'Unable to save the reorder rule.')
    } finally {
      setSaving(false)
    }
  }

  const deleteRule = async (id) => {
    try {
      await api.delete(`/inventory/reorder-rules/${id}`)
      reload()
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || 'Unable to delete the reorder rule.')
    }
  }

  const columns = [
    { key: 'sku', header: 'SKU', render: (row) => <span className="font-mono text-xs">{row.sku}</span> },
    { key: 'product', header: 'Product' },
    { key: 'location', header: 'Location' },
    { key: 'onHand', header: 'On hand', render: (row) => `${row.onHand} ${row.uom}` },
    { key: 'reorderAt', header: 'Reorder at' },
    { key: 'targetStock', header: 'Target stock' },
    { key: 'suggestedOrder', header: 'Suggested order', render: (row) => <span className={row.suggestedOrder > 0 ? 'font-semibold text-danger' : ''}>{row.suggestedOrder} {row.uom}</span> },
    ...(canCreateProducts ? [{ key: 'actions', header: '', render: (row) => <button type="button" title="Delete rule" aria-label={`Delete reorder rule for ${row.product} at ${row.location}`} onClick={() => deleteRule(row.id)} className="grid h-8 w-8 place-items-center rounded-sm text-danger hover:bg-red-50"><Trash2 size={15} /></button> }] : [])
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-head text-base font-semibold text-ink">Reordering rules</h2>
          <p className="text-xs text-inkSoft mt-1">Suggested order is calculated when stock reaches the rule threshold.</p>
        </div>
        {canCreateProducts && <button type="button" onClick={() => { setFormError(''); setForm({ productId: products[0]?.id || '', location: locations[0] || '', reorderAt: '0', targetStock: '0' }); setShowForm(true) }} className="flex items-center gap-1.5 bg-accent text-accentInk text-sm font-medium px-3 py-2 rounded-sm hover:brightness-95"><Plus size={16} /> Add rule</button>}
      </div>
      {!canCreateProducts && <p className="text-xs text-inkSoft">Only Inventory Managers can manage reordering rules.</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
      {formError && !showForm && <p className="text-sm text-danger">{formError}</p>}
      {loading && <p className="text-sm text-inkSoft">Loading reorder rules...</p>}
      <DataTable columns={columns} rows={rules} emptyMessage="No reordering rules have been created." />

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20 px-4" onClick={() => setShowForm(false)}>
          <form onSubmit={createRule} className="bg-surface rounded-sm border border-line p-6 w-full max-w-md" onClick={(event) => event.stopPropagation()}>
            <h3 className="font-head text-lg font-semibold mb-4">Add reordering rule</h3>
            {formError && <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-sm px-3 py-2 mb-3">{formError}</p>}
            <div className="space-y-3">
              <select required value={form.productId} onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))} className="w-full border border-line rounded-sm px-3 py-2 text-sm">
                <option value="">Choose product</option>
                {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>)}
              </select>
              <select required value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} className="w-full border border-line rounded-sm px-3 py-2 text-sm">
                <option value="">Choose location</option>
                {locations.map((location) => <option key={location} value={location}>{location}</option>)}
              </select>
              <input required type="number" min="0" step="any" value={form.reorderAt} onChange={(event) => setForm((current) => ({ ...current, reorderAt: event.target.value }))} className="w-full border border-line rounded-sm px-3 py-2 text-sm" placeholder="Reorder when stock reaches" />
              <input required type="number" min="0" step="any" value={form.targetStock} onChange={(event) => setForm((current) => ({ ...current, targetStock: event.target.value }))} className="w-full border border-line rounded-sm px-3 py-2 text-sm" placeholder="Target stock level" />
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-inkSoft px-3 py-2">Cancel</button>
              <button disabled={saving || !products.length || !locations.length} className="bg-accent text-accentInk text-sm font-medium px-4 py-2 rounded-sm disabled:opacity-60">{saving ? 'Saving...' : 'Save rule'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}