export function filterDocuments(documents, filters, type) {
  const search = filters.search.trim().toLowerCase()

  return documents.filter((document) => {
    if (type && document.type !== type) return false
    if (!type && filters.docType !== 'all' && document.type !== filters.docType) return false
    if (filters.status !== 'all' && document.status.toLowerCase() !== filters.status.toLowerCase()) {
      if (!(filters.status === 'Canceled' && document.status === 'Cancelled')) return false
    }
    if (filters.warehouse !== 'all' && ![document.warehouse, document.sourceLocation, document.destinationLocation].includes(filters.warehouse)) return false
    if (filters.category !== 'all' && document.category !== filters.category && !document.lines?.some((line) => line.category === filters.category)) return false
    const lineSearch = document.lines?.map((line) => `${line.product} ${line.sku}`).join(' ') || ''
    if (search && !`${document.id} ${document.partner} ${document.warehouse} ${document.product || ''} ${document.sku || ''} ${lineSearch}`.toLowerCase().includes(search)) return false
    return true
  })
}