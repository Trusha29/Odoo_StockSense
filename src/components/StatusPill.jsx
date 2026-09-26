const STYLES = {
  draft: 'bg-line text-inkSoft',
  waiting: 'bg-amber-50 text-amber-700 border border-amber-200',
  ready: 'bg-blue-50 text-blue-700 border border-blue-200',
  done: 'bg-green-50 text-success border border-green-200',
  cancelled: 'bg-red-50 text-danger border border-red-200',
}

export default function StatusPill({ status, label }) {
  const key = status.toLowerCase()
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STYLES[key] || STYLES.draft}`}>
      {label || status}
    </span>
  )
}
