const ACCENT = {
  default: 'border-t-line',
  warning: 'border-t-accent',
  danger: 'border-t-danger',
}

export default function KpiCard({ label, value, tone = 'default' }) {
  return (
    <div className={`bg-surface border border-line border-t-[3px] ${ACCENT[tone]} rounded-sm p-4`}>
      <p className="text-xs text-inkSoft font-medium leading-5 min-h-10">{label}</p>
      <p className="font-head text-2xl font-semibold text-ink">{value}</p>
    </div>
  )
}
