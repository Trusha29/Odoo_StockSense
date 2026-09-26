// Demo-only accounts. Passwords are never stored/checked like this once the
// backend exists — real auth will hash passwords and issue a JWT server-side.
export const mockUsers = [
  { email: 'manager@stocksense.io', password: 'manager123', name: 'Priya Sharma', role: 'Inventory Manager' },
  { email: 'staff@stocksense.io', password: 'staff123', name: 'Arjun Verma', role: 'Warehouse Staff' },
]

export const kpis = [
  { label: 'Total Products in Stock', value: '1,284', tone: 'default' },
  { label: 'Low Stock Items', value: '17', tone: 'warning' },
  { label: 'Out of Stock', value: '3', tone: 'danger' },
  { label: 'Pending Receipts', value: '6', tone: 'default' },
  { label: 'Pending Deliveries', value: '11', tone: 'default' },
  { label: 'Transfers Scheduled', value: '4', tone: 'default' },
]

export const warehouses = ['Main Warehouse', 'Production Floor', 'Warehouse 2', 'Rack A', 'Rack B']

export const categories = ['Raw Materials', 'Fasteners', 'Finished Goods', 'Packaging']

export const products = [
  { id: 'P-1001', sku: 'STL-ROD-08', name: 'Steel Rods 8mm', category: 'Raw Materials', uom: 'kg', stock: 420, reorderPoint: 100 },
  { id: 'P-1002', sku: 'CHR-OAK-14', name: 'Oak Chair Frame', category: 'Finished Goods', uom: 'pcs', stock: 32, reorderPoint: 40 },
  { id: 'P-1003', sku: 'BLT-M6-20', name: 'M6 Bolt 20mm', category: 'Fasteners', uom: 'pcs', stock: 0, reorderPoint: 500 },
  { id: 'P-1004', sku: 'BOX-CRD-L', name: 'Cardboard Box - Large', category: 'Packaging', uom: 'pcs', stock: 210, reorderPoint: 150 },
  { id: 'P-1005', sku: 'STL-SHT-02', name: 'Steel Sheet 2mm', category: 'Raw Materials', uom: 'kg', stock: 88, reorderPoint: 100 },
]

export const documents = [
  { id: 'RCP-0231', type: 'Receipt', partner: 'Bansal Steel Co.', warehouse: 'Main Warehouse', status: 'Waiting', date: '2026-09-24', product: 'Steel Rods 8mm', sku: 'STL-ROD-08', category: 'Raw Materials' },
  { id: 'DLV-0417', type: 'Delivery', partner: 'Urban Furniture Ltd.', warehouse: 'Main Warehouse', status: 'Ready', date: '2026-09-25', product: 'Oak Chair Frame', sku: 'CHR-OAK-14', category: 'Finished Goods' },
  { id: 'INT-0093', type: 'Internal', partner: 'Main \u2192 Production Floor', warehouse: 'Main Warehouse', status: 'Done', date: '2026-09-25', product: 'Steel Rods 8mm', sku: 'STL-ROD-08', category: 'Raw Materials' },
  { id: 'ADJ-0022', type: 'Adjustment', partner: 'Cycle Count #14', warehouse: 'Rack A', status: 'Draft', date: '2026-09-26', product: 'M6 Bolt 20mm', sku: 'BLT-M6-20', category: 'Fasteners' },
  { id: 'RCP-0230', type: 'Receipt', partner: 'Bansal Steel Co.', warehouse: 'Warehouse 2', status: 'Done', date: '2026-09-22', product: 'Steel Rods 8mm', sku: 'STL-ROD-08', category: 'Raw Materials' },
  { id: 'DLV-0416', type: 'Delivery', partner: 'Craft Interiors', warehouse: 'Main Warehouse', status: 'Canceled', date: '2026-09-21', product: 'Oak Chair Frame', sku: 'CHR-OAK-14', category: 'Finished Goods' },
]

export const moveHistory = [
  { id: 'MV-8841', product: 'Steel Rods 8mm', qty: '+50', from: 'Vendor', to: 'Main Warehouse', ref: 'RCP-0230', date: '2026-09-22 10:14' },
  { id: 'MV-8842', product: 'Steel Rods 8mm', qty: '\u221220', from: 'Main Warehouse', to: 'Production Floor', ref: 'INT-0093', date: '2026-09-25 09:02' },
  { id: 'MV-8843', product: 'Oak Chair Frame', qty: '\u221210', from: 'Main Warehouse', to: 'Urban Furniture Ltd.', ref: 'DLV-0417', date: '2026-09-25 14:20' },
  { id: 'MV-8844', product: 'M6 Bolt 20mm', qty: '\u22123', from: 'Rack A', to: 'Damaged', ref: 'ADJ-0022', date: '2026-09-26 08:41' },
]
