# StockSense — Frontend

React + Vite + Tailwind + Redux Toolkit frontend for the StockSense Inventory Management System.

## Setup

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. It expects a backend at `http://localhost:5000` (see `vite.config.js` proxy) — until that exists, every page runs on mock data in `src/data/mockData.js`, so the UI is fully clickable on its own.

## What's here

- `src/pages/` — one file per module: Login, Dashboard, Products, Receipts, DeliveryOrders, InternalTransfers, Adjustments, MoveHistory, Settings, Profile
- `src/components/` — reusable pieces: `DataTable`, `FilterBar`, `KpiCard`, `StatusPill`, `Sidebar`, `Topbar`
- `src/store/` — Redux Toolkit: `authSlice` (login state), `filtersSlice` (the dashboard's dynamic filters)
- `src/api/axiosClient.js` — pre-wired axios instance that attaches the JWT and logs out on 401
- `src/data/mockData.js` — swap this out for real API calls once the backend is ready

## Wiring up the real backend

Each page has a `// TODO` or an inline mock array where a real API call goes. The pattern is the same everywhere:

```js
// instead of importing from mockData.js
import api from '../api/axiosClient.js'
import { useEffect, useState } from 'react'

const [products, setProducts] = useState([])
useEffect(() => {
  api.get('/products').then((res) => setProducts(res.data))
}, [])
```

Suggested order to connect real endpoints (matches the backend build order):
1. `POST /api/auth/login`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` → `Login.jsx`
2. `GET/POST /api/products` → `Products.jsx`
3. `GET/POST /api/receipts`, `POST /api/receipts/:id/validate` → `Receipts.jsx`
4. `GET/POST /api/deliveries`, `POST /api/deliveries/:id/validate` → `DeliveryOrders.jsx`
5. `GET/POST /api/transfers` → `InternalTransfers.jsx`
6. `GET/POST /api/adjustments` → `Adjustments.jsx`
7. `GET /api/stock-moves` → `MoveHistory.jsx`
8. `GET /api/dashboard/kpis` → `Dashboard.jsx`

## Design tokens

Defined in `tailwind.config.js`: sidebar `#12161D`, accent `#E8A23D` (reserved for primary actions + low-stock warnings), danger `#D64545`, success `#2F9E64`. Headings use Archivo, body/data uses Inter, SKUs/codes use JetBrains Mono.
