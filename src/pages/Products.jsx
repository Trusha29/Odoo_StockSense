import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Pencil, Plus } from 'lucide-react'
import DataTable from '../components/DataTable.jsx'
import FilterBar from '../components/FilterBar.jsx'
import StatusPill from '../components/StatusPill.jsx'
import { getPermissions } from '../utils/permissions.js'
import useInventoryData from '../hooks/useInventoryData.js'
import api from '../api/axiosClient.js'
import ReorderRules from '../components/ReorderRules.jsx'

export default function Products() {
  const [showForm, setShowForm] = useState(false)
  const [view, setView] = useState('products')
  const [editingProduct, setEditingProduct] = useState(null)
  const [form, setForm] = useState({ sku: '', name: '', category: '', uom: '', stock: 0, location: '', reorderPoint: 0 })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const filters = useSelector((s) => s.filters)
  const role = useSelector((s) => s.auth.user?.role)
  const { canCreateProducts } = getPermissions(role)
  const { data: productData, loading, error, reload } = useInventoryData('/inventory/products', { products: [] })
  const { data: filterOptions } = useInventoryData('/inventory/filters', { categories: [], warehouses: [] })
  const products = productData.products || []

  const rows = products.map((product) => filters.warehouse === 'all'
    ? product
    : { ...product, stock: product.stockByLocation?.find((row) => row.location === filters.warehouse)?.quantity || 0 }
  ).filter((p) => {
    if (filters.category !== 'all' && p.category !== filters.category) return false
    if (filters.search && !`${p.sku} ${p.name}`.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  const stockStatus = (p) => {
    if (p.stock === 0) return 'Cancelled' // reuse danger styling via StatusPill mapping below
    if (p.stock <= p.reorderPoint) return 'Waiting'
    return 'Done'
  }
  const stockLabel = (p) => (p.stock === 0 ? 'Out of stock' : p.stock <= p.reorderPoint ? 'Low stock' : 'In stock')

  const columns = [
    { key: 'sku', header: 'SKU', render: (r) => <span className="font-mono text-xs">{r.sku}</span> },
    { key: 'name', header: 'Product' },
    { key: 'category', header: 'Category' },
    { key: 'stock', header: 'On hand', render: (r) => `${r.stock} ${r.uom}` },
    { key: 'locations', header: 'By location', render: (r) => r.stockByLocation?.length ? r.stockByLocation.map((row) => `${row.location}: ${row.quantity}`).join(', ') : 'No stock' },
    { key: 'reorderPoint', header: 'Reorder point', render: (r) => `${r.reorderPoint} ${r.uom}` },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusPill status={stockStatus(r)} label={stockLabel(r)} />,
    },
    ...(canCreateProducts ? [{
      key: 'actions',
      header: '',
      render: (product) => (
        <button
          type="button"
          title={`Edit ${product.name}`}
          aria-label={`Edit ${product.name}`}
          onClick={() => openForm(product)}
          className="grid h-8 w-8 place-items-center rounded-sm text-inkSoft hover:bg-bg hover:text-ink"
        ><Pencil size={15} /></button>
      ),
    }] : []),
  ]

  useEffect(() => {
    if (!form.category && filterOptions.categories?.length) {
      setForm((current) => ({ ...current, category: filterOptions.categories[0] }))
    }
    if (!form.location && filterOptions.warehouses?.length) {
      setForm((current) => ({ ...current, location: filterOptions.warehouses[0] }))
    }
  }, [filterOptions.categories, filterOptions.warehouses, form.category, form.location])

  function openForm(product = null) {
    setEditingProduct(product)
    setForm(product
      ? { sku: product.sku, name: product.name, category: product.category, uom: product.uom, stock: 0, location: filterOptions.warehouses?.[0] || '', reorderPoint: product.reorderPoint }
      : { sku: '', name: '', category: filterOptions.categories?.[0] || '', uom: '', stock: 0, location: filterOptions.warehouses?.[0] || '', reorderPoint: 0 })
    setFormError('')
    setShowForm(true)
  }

  const saveProduct = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      const payload = editingProduct
        ? { name: form.name, category: form.category, uom: form.uom, reorderPoint: Number(form.reorderPoint) }
        : { ...form, stock: Number(form.stock), reorderPoint: Number(form.reorderPoint) }
      if (editingProduct) await api.put(`/inventory/products/${editingProduct.id}`, payload)
      else await api.post('/inventory/products', payload)
      setShowForm(false)
      reload()
    } catch (saveError) {
      setFormError(saveError.response?.data?.message || 'Unable to save this product.')
    } finally {
      setSaving(false)
    }
  }

  const setField = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Product views" className="flex items-center border border-line rounded-sm bg-surface p-1">
          <button role="tab" aria-selected={view === 'products'} onClick={() => setView('products')} className={`px-3 py-1.5 text-sm rounded-sm ${view === 'products' ? 'bg-bg font-medium text-ink' : 'text-inkSoft hover:text-ink'}`}>Products</button>
          <button role="tab" aria-selected={view === 'reorders'} onClick={() => setView('reorders')} className={`px-3 py-1.5 text-sm rounded-sm ${view === 'reorders' ? 'bg-bg font-medium text-ink' : 'text-inkSoft hover:text-ink'}`}>Reorder rules</button>
        </div>
        {view === 'products' && <div className="flex flex-wrap items-center gap-2">
          <FilterBar showDocType={false} showStatus={false} />
          {canCreateProducts && (
            <button onClick={() => openForm()} className="flex items-center gap-1.5 bg-accent text-accentInk text-sm font-medium px-3 py-2 rounded-sm hover:brightness-95 h-fit">
              <Plus size={16} /> New product
            </button>
          )}
        </div>}
      </div>
      {view === 'products' && !canCreateProducts && (
        <p className="text-xs text-inkSoft -mt-2">Warehouse staff can view stock but not create or edit products.</p>
      )}

      {view === 'products' && <>
        {error && <p className="text-sm text-danger">{error}</p>}
        {loading && <p className="text-sm text-inkSoft">Loading products...</p>}
        <DataTable columns={columns} rows={rows} emptyMessage="No products match these filters." />
      </>}
      {view === 'reorders' && <ReorderRules />}

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20 px-4" onClick={() => setShowForm(false)}>
          <form onSubmit={saveProduct} className="bg-surface rounded-sm border border-line p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-head text-lg font-semibold mb-4">{editingProduct ? 'Edit product' : 'New product'}</h3>
            {formError && <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-sm px-3 py-2 mb-3">{formError}</p>}
            <div className="space-y-3">
              <input required value={form.name} onChange={setField('name')} className="w-full border border-line rounded-sm px-3 py-2 text-sm" placeholder="Product name" />
              <input required disabled={Boolean(editingProduct)} value={form.sku} onChange={setField('sku')} className="w-full border border-line rounded-sm px-3 py-2 text-sm font-mono disabled:bg-bg" placeholder="SKU / Code" />
              <select required value={form.category} onChange={setField('category')} className="w-full border border-line rounded-sm px-3 py-2 text-sm">
                {filterOptions.categories?.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
              <input required value={form.uom} onChange={setField('uom')} className="w-full border border-line rounded-sm px-3 py-2 text-sm" placeholder="Unit of measure (kg, pcs...)" />
              <input type="number" min="0" required value={form.reorderPoint} onChange={setField('reorderPoint')} className="w-full border border-line rounded-sm px-3 py-2 text-sm" placeholder="Reorder point" />
              {!editingProduct && <>
                <select value={form.location} onChange={setField('location')} className="w-full border border-line rounded-sm px-3 py-2 text-sm">
                  {filterOptions.warehouses?.map((warehouse) => <option key={warehouse} value={warehouse}>{warehouse}</option>)}
                </select>
                <input type="number" min="0" value={form.stock} onChange={setField('stock')} className="w-full border border-line rounded-sm px-3 py-2 text-sm" placeholder="Initial stock (optional)" />
              </>}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-inkSoft px-3 py-2">Cancel</button>
              <button disabled={saving} className="bg-accent text-accentInk text-sm font-medium px-4 py-2 rounded-sm disabled:opacity-60">
                {saving ? 'Saving...' : 'Save product'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
