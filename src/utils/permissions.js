// Central place for role-based permission checks.
// Once the backend exists, the server must enforce these too — never trust
// the frontend alone, since anyone can edit client-side JS.

export const ROLES = {
  MANAGER: 'Inventory Manager',
  STAFF: 'Warehouse Staff',
}

export function formatRole(role) {
  if (role === 'inventory_manager') return ROLES.MANAGER
  if (role === 'warehouse_staff') return ROLES.STAFF
  return role || ''
}

export function getPermissions(role) {
  const isManager = role === ROLES.MANAGER || role === 'inventory_manager'
  return {
    // Products: managers own the catalog
    canCreateProducts: isManager,
    canEditProducts: isManager,

    // Receipts / Deliveries: managers own incoming & outgoing stock decisions
    canCreateReceipts: isManager,
    canCreateDeliveries: isManager,
    // but picking/packing/validating steps are physical warehouse work — both roles can operate existing documents
    canOperateDocuments: true,

    // Internal transfers & stock counts: this is the warehouse staff's job
    canCreateTransfers: true,
    canCreateAdjustments: true,

    // Warehouse/location setup: admin-level, managers only
    canManageWarehouses: isManager,
  }
}
