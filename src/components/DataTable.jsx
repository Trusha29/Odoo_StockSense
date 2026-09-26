export default function DataTable({ columns, rows, emptyMessage = 'Nothing here yet.' }) {
  if (!rows.length) {
    return (
      <div className="border border-line rounded-sm bg-surface p-10 text-center text-inkSoft text-sm">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="border border-line rounded-sm bg-surface overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-medium text-inkSoft">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i} className="border-b border-line last:border-0 hover:bg-bg">
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
