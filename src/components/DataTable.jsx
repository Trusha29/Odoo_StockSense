export default function DataTable({ columns, rows, emptyMessage = 'Nothing here yet.' }) {
  if (!rows.length) {
    return (
      <div className="border border-line rounded-sm bg-surface p-10 text-center text-inkSoft text-sm">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-line rounded-sm bg-surface">
      <table className="w-full min-w-[680px] text-sm">
        <thead>
          <tr className="border-b border-line bg-bg/70 text-left">
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-inkSoft">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i} className="border-b border-line last:border-0 hover:bg-bg/70">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-ink">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
