const ACCENT = {
  default: 'border-l-line',
  warning: 'border-l-accent',
  danger: 'border-l-danger',
}

export default function KpiCard({ label, value, tone = 'default' }) {
  return (
    <div className={`bg-surface border border-line border-l-4 ${ACCENT[tone]} rounded-sm p-4`}>
      <p className="text-sm text-inkSoft font-medium mb-1">{label}</p>
      <p className="font-head text-2xl font-semibold text-ink">{value}</p>
    </div>
  )
}
