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

export default function FilterBar({ showDocType = true }) {
  const dispatch = useDispatch()
  const search = useSelector((s) => s.filters.search)

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <input
        type="text"
        placeholder="Search by SKU or name"
        value={search}
        onChange={(e) => dispatch(setFilter({ key: 'search', value: e.target.value }))}
        className="border border-line rounded-sm px-3 py-1.5 text-sm bg-surface text-ink w-56 focus:border-accent"
      />
      {showDocType && (
        <Select label="Document type" filterKey="docType" options={['Receipt', 'Delivery', 'Internal', 'Adjustment']} />
      )}
      <Select label="Status" filterKey="status" options={['Draft', 'Waiting', 'Ready', 'Done', 'Cancelled']} />
      <Select label="Warehouse" filterKey="warehouse" options={warehouses} />
      <Select label="Category" filterKey="category" options={categories} />
    </div>
  )
}
