import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import DataTable from './DataTable.jsx'
import useInventoryData from '../hooks/useInventoryData.js'
import api from '../api/axiosClient.js'

export default function CategoryManager() {
  const { data, loading, error, reload } = useInventoryData('/inventory/categories', { categories: [] })
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const categories = data.categories || []

  const openForm = (category = null) => {
    setEditing(category)
    setName(category?.name || '')
    setFormError('')
    setShowForm(true)
  }

  const saveCategory = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      if (editing) await api.put(`/inventory/categories/${editing._id}`, { name })
      else await api.post('/inventory/categories', { name })
      setShowForm(false)
      reload()
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || 'Unable to save this category.')
    } finally {
      setSaving(false)
    }
  }

  const deleteCategory = async (category) => {
    setFormError('')
    try {
      await api.delete(`/inventory/categories/${category._id}`)
      reload()
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || 'Unable to delete this category.')
    }
  }

  const columns = [
    { key: 'name', header: 'Product category' },
    {
      key: 'actions',
      header: '',
      render: (category) => (
        <div className="flex items-center gap-1">
          <button type="button" title="Edit category" aria-label={`Edit ${category.name}`} onClick={() => openForm(category)} className="grid h-8 w-8 place-items-center rounded-sm text-inkSoft hover:bg-bg hover:text-ink"><Pencil size={15} /></button>
          <button type="button" title="Delete category" aria-label={`Delete ${category.name}`} onClick={() => deleteCategory(category)} className="grid h-8 w-8 place-items-center rounded-sm text-danger hover:bg-red-50"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ]

  return (
    <section className="space-y-3 pt-5 border-t border-line">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-head text-sm font-semibold text-inkSoft">Product categories</h2>
        <button type="button" onClick={() => openForm()} className="flex items-center gap-1.5 border border-line bg-surface text-sm font-medium px-3 py-2 rounded-sm hover:bg-bg"><Plus size={15} /> Add category</button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      {formError && !showForm && <p className="text-sm text-danger">{formError}</p>}
      {loading && <p className="text-sm text-inkSoft">Loading categories...</p>}
      <DataTable columns={columns} rows={categories} emptyMessage="No product categories have been created." />

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20 px-4" onClick={() => setShowForm(false)}>
          <form onSubmit={saveCategory} className="bg-surface rounded-sm border border-line p-6 w-full max-w-sm" onClick={(event) => event.stopPropagation()}>
            <h3 className="font-head text-lg font-semibold mb-4">{editing ? 'Edit category' : 'Add category'}</h3>
            {formError && <p className="text-sm text-danger mb-3">{formError}</p>}
            <input required value={name} onChange={(event) => setName(event.target.value)} className="w-full border border-line rounded-sm px-3 py-2 text-sm" placeholder="Category name" />
            <div className="flex justify-end gap-2 mt-5">
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-inkSoft px-3 py-2">Cancel</button>
              <button disabled={saving} className="bg-accent text-accentInk text-sm font-medium px-4 py-2 rounded-sm disabled:opacity-60">{saving ? 'Saving...' : 'Save category'}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
