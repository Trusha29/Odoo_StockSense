export function filterDocuments(documents, filters, type) {
  const search = filters.search.trim().toLowerCase()

  return documents.filter((document) => {
    if (type && document.type !== type) return false
    if (!type && filters.docType !== 'all' && document.type !== filters.docType) return false
    if (filters.status !== 'all' && document.status.toLowerCase() !== filters.status.toLowerCase()) {
      if (!(filters.status === 'Canceled' && document.status === 'Cancelled')) return false
    }
    if (filters.warehouse !== 'all' && document.warehouse !== filters.warehouse) return false
    if (filters.category !== 'all' && document.category !== filters.category) return false
    if (search && !`${document.id} ${document.partner} ${document.warehouse} ${document.product || ''} ${document.sku || ''}`.toLowerCase().includes(search)) return false
    return true
  })
}