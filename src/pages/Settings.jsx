import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Pencil, Plus, Trash2, Lock } from 'lucide-react'
import DataTable from '../components/DataTable.jsx'
import { getPermissions } from '../utils/permissions.js'
import useInventoryData from '../hooks/useInventoryData.js'
import api from '../api/axiosClient.js'
import CategoryManager from '../components/CategoryManager.jsx'

export default function Settings() {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [kind, setKind] = useState('warehouse')
  const [parentWarehouse, setParentWarehouse] = useState('')
  const [editingWarehouse, setEditingWarehouse] = useState(null)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const role = useSelector((s) => s.auth.user?.role)
  const { canManageWarehouses } = getPermissions(role)
  const { data, loading, error, reload } = useInventoryData('/inventory/warehouses', { warehouses: [] })
  const warehouseOptions = (data.warehouses || []).filter((warehouse) => warehouse.kind !== 'location')
  const rows = (data.warehouses || []).map((warehouse) => ({ ...warehouse, id: warehouse._id }))

  const openWarehouseForm = (warehouse = null) => {
    setEditingWarehouse(warehouse)
    setName(warehouse?.name || '')
    setCode(warehouse?.code || '')
    setKind(warehouse?.kind || 'warehouse')
    setParentWarehouse(warehouse?.parentWarehouse || warehouseOptions[0]?.name || '')
    setErrorMessage('')
    setShowForm(true)
  }

  const saveWarehouse = async (event) => {
    event.preventDefault()
    setSaving(true)
    setErrorMessage('')
    try {
      const payload = { name: name.trim(), code: code.trim().toUpperCase(), kind, parentWarehouse }
      if (editingWarehouse) await api.put(`/inventory/warehouses/${editingWarehouse._id}`, payload)
      else await api.post('/inventory/warehouses', payload)
      setName('')
      setCode('')
      setShowForm(false)
      reload()
    } catch (saveError) {
      setErrorMessage(saveError.response?.data?.message || 'Unable to save this warehouse.')
    } finally {
      setSaving(false)
    }
  }

  const deleteWarehouse = async (warehouse) => {
    setErrorMessage('')
    try {
      await api.delete(`/inventory/warehouses/${warehouse._id}`)
      reload()
    } catch (deleteError) {
      setErrorMessage(deleteError.response?.data?.message || 'Unable to delete this warehouse or location.')
    }
  }

  if (!canManageWarehouses) {
    return (
      <div className="max-w-md bg-surface border border-line rounded-sm p-8 text-center">
        <Lock size={24} className="mx-auto text-inkSoft mb-3" />
        <p className="font-head font-semibold text-ink mb-1">Manager access only</p>
        <p className="text-sm text-inkSoft">Warehouse and location setup is managed by Inventory Managers. Ask your manager if you need a new location added.</p>
      </div>
    )
  }

  const columns = [
    { key: 'code', header: 'Code', render: (r) => <span className="font-mono text-xs">{r.code}</span> },
    { key: 'name', header: 'Warehouse / Location' },
    { key: 'kind', header: 'Type', render: (r) => r.kind === 'location' ? 'Location' : 'Warehouse' },
    { key: 'parentWarehouse', header: 'Parent warehouse', render: (r) => r.parentWarehouse || '—' },
    { key: 'actions', header: '', render: (warehouse) => (
      <div className="flex items-center gap-1">
        <button type="button" title="Edit" aria-label={`Edit ${warehouse.name}`} onClick={() => openWarehouseForm(warehouse)} className="grid h-8 w-8 place-items-center rounded-sm text-inkSoft hover:bg-bg hover:text-ink"><Pencil size={15} /></button>
        <button type="button" title="Delete" aria-label={`Delete ${warehouse.name}`} onClick={() => deleteWarehouse(warehouse)} className="grid h-8 w-8 place-items-center rounded-sm text-danger hover:bg-red-50"><Trash2 size={15} /></button>
      </div>
    ) },
  ]

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="font-head text-sm font-semibold text-inkSoft">Warehouses & locations</h2>
        {canManageWarehouses && (
          <button onClick={() => openWarehouseForm()} className="flex items-center gap-1.5 bg-accent text-accentInk text-sm font-medium px-3 py-2 rounded-sm hover:brightness-95">
            <Plus size={16} /> Add warehouse or location
          </button>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {errorMessage && !showForm && <p className="text-sm text-danger">{errorMessage}</p>}
      {loading && <p className="text-sm text-inkSoft">Loading warehouses...</p>}
      <DataTable columns={columns} rows={rows} />
      <CategoryManager />

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20 px-4" onClick={() => setShowForm(false)}>
          <form onSubmit={saveWarehouse} className="bg-surface rounded-sm border border-line p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-head text-lg font-semibold mb-4">{editingWarehouse ? 'Edit warehouse or location' : 'Add warehouse or location'}</h3>
            {errorMessage && <p className="text-sm text-danger mb-3">{errorMessage}</p>}
            <div className="space-y-3">
              <input required value={name} onChange={(event) => setName(event.target.value)} className="w-full border border-line rounded-sm px-3 py-2 text-sm" placeholder="Warehouse name" />
              <input required value={code} onChange={(event) => setCode(event.target.value)} className="w-full border border-line rounded-sm px-3 py-2 text-sm font-mono" placeholder="Code" />
              <select value={kind} onChange={(event) => setKind(event.target.value)} className="w-full border border-line rounded-sm px-3 py-2 text-sm">
                <option value="warehouse">Warehouse</option>
                <option value="location">Location</option>
              </select>
              {kind === 'location' && <select required value={parentWarehouse} onChange={(event) => setParentWarehouse(event.target.value)} className="w-full border border-line rounded-sm px-3 py-2 text-sm">
                <option value="">Choose parent warehouse</option>
                {warehouseOptions.filter((warehouse) => warehouse._id !== editingWarehouse?._id).map((warehouse) => <option key={warehouse._id} value={warehouse.name}>{warehouse.name}</option>)}
              </select>}
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-inkSoft px-3 py-2">Cancel</button>
              <button disabled={saving} className="bg-accent text-accentInk text-sm font-medium px-4 py-2 rounded-sm disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
