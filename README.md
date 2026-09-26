# StockSense Frontend

A React, Vite, Tailwind CSS, and Redux Toolkit prototype for an inventory management system. The interface covers inventory overview, products, receipts, deliveries, internal transfers, stock adjustments, move history, warehouse settings, and user profile.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Vite serves the app at `http://localhost:5173` by default. Sign in with either demo account:

| Role | Email | Password |
| --- | --- | --- |
| Inventory Manager | `manager@stocksense.io` | `manager123` |
| Warehouse Staff | `staff@stocksense.io` | `staff123` |

## Available scripts

```bash
npm run dev      # Start the development server
npm run build    # Create the production bundle in dist/
npm run preview  # Preview the production bundle locally
```

## UI scope

- Responsive navigation and inventory dashboard with KPIs, stock alerts, recent operations, and work queue.
- Product catalog and operation lists for receipts, delivery orders, internal transfers, and adjustments.
- Search and filters for document type, status, warehouse, and product category.
- Role-aware navigation and controls for Inventory Managers and Warehouse Staff.
- Mock inventory, products, users, and documents are defined in `src/data/mockData.js`.

This is a frontend prototype. Login credentials are checked against demo data, password reset is a UI flow only, and document/product form actions do not save changes to a server. Lists and dashboard values are sample data, not live inventory.

## Backend integration

Vite proxies `/api` requests to `http://localhost:5000`. The Axios client in `src/api/axiosClient.js` uses that base path, attaches the demo session token when present, and clears authentication on a `401` response. The current pages still use mock data; connecting API endpoints and persisting workflow actions remains future work.

## Project structure

- `src/pages/` — route-level screens.
- `src/components/` — shared navigation, tables, filters, status labels, and KPI components.
- `src/layouts/` — authenticated application shell.
- `src/store/` — authentication and filter state.
- `src/utils/` — role permissions and document filtering.
- `src/api/` — Axios client for future backend requests.