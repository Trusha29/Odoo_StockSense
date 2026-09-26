import { useDispatch, useSelector } from 'react-redux'
import { setFilter } from '../store/filtersSlice.js'
import { warehouses, categories } from '../data/mockData.js'

const Select = ({ label, filterKey, options }) => {
  const dispatch = useDispatch()
  const value = useSelector((s) => s.filters[filterKey])
  return (
    <select
      value={value}
      onChange={(e) => dispatch(setFilter({ key: filterKey, value: e.target.value }))}
      className="border border-line rounded-sm px-3 py-1.5 text-sm bg-surface text-ink focus:border-accent"
      aria-label={label}
    >
      <option value="all">{label}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  )
}

export default function FilterBar({ showDocType = true, showStatus = true, showWarehouse = true, showCategory = true }) {
  const dispatch = useDispatch()
  const search = useSelector((s) => s.filters.search)

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <input
        type="text"
        placeholder="Search by SKU or name"
        value={search}
        onChange={(e) => dispatch(setFilter({ key: 'search', value: e.target.value }))}
        className="min-w-[190px] flex-1 border border-line rounded-sm px-3 py-2 text-sm bg-surface text-ink focus:border-accent sm:flex-none sm:w-56"
      />
      {showDocType && (
        <Select label="Document type" filterKey="docType" options={['Receipt', 'Delivery', 'Internal', 'Adjustment']} />
      )}
      {showStatus && <Select label="Status" filterKey="status" options={['Draft', 'Waiting', 'Ready', 'Done', 'Canceled']} />}
      {showWarehouse && <Select label="Warehouse" filterKey="warehouse" options={warehouses} />}
      {showCategory && <Select label="Category" filterKey="category" options={categories} />}
    </div>
  )
}
