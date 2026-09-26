# StockSense 📦

A modular Inventory Management System built with the MERN stack to digitize and streamline stock-related operations.

StockSense replaces manual registers, spreadsheets, and scattered inventory tracking methods with a centralized system for managing products, stock, receipts, deliveries, internal transfers, adjustments, warehouses, locations, and inventory movement history.

---

## 📌 Project Overview

StockSense is designed to provide a centralized and easy-to-use inventory management platform for businesses.

The system allows users to:

- Manage products and categories
- Track stock availability by location
- Manage warehouses and locations
- Record incoming stock through receipts
- Manage outgoing stock through delivery orders
- Transfer stock between locations
- Adjust inventory based on physical stock counts
- Track inventory movement history
- Configure reordering rules
- Monitor low-stock and out-of-stock products
- View inventory KPIs through a dashboard
- Search and filter inventory operations

---

## 👥 User Roles

StockSense currently supports two roles:

### Inventory Manager

Inventory Managers can manage inventory operations such as:

- Products
- Categories
- Receipts
- Deliveries
- Internal Transfers
- Inventory Adjustments
- Reordering Rules
- Warehouses and Locations
- Inventory monitoring

### Warehouse Staff

Warehouse Staff can perform warehouse-related operations such as:

- Viewing stock
- Picking items
- Packing items
- Internal stock transfers
- Inventory counting
- Warehouse operations

Both roles use the same application and dashboard, while available actions are controlled according to the user's role.

---

# 🏗️ System Architecture

StockSense follows a MERN architecture:

```text
┌─────────────────────────────────────────────┐
│                React Frontend               │
│                                             │
│ Dashboard │ Products │ Stock │ Receipts     │
│ Deliveries │ Transfers │ Adjustments        │
│ Move History │ Settings │ Profile           │
└───────────────────────┬─────────────────────┘
                        │
                   REST API / JSON
                        │
                        ▼
┌─────────────────────────────────────────────┐
│             Node.js + Express               │
│                                             │
│ Routes → Controllers → Services             │
│ Middleware → Authentication → Validation    │
└───────────────────────┬─────────────────────┘
                        │
                     Mongoose
                        │
                        ▼
┌─────────────────────────────────────────────┐
│                   MongoDB                   │
│                                             │
│ Users │ Products │ Documents │ Stock        │
│ Warehouses │ Locations │ Movements          │
└─────────────────────────────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

- React 18
- Vite
- React Router
- Redux Toolkit
- Axios
- Tailwind CSS
- Lucide React

## Backend

- Node.js
- Express.js
- Mongoose
- JSON Web Token (JWT)
- bcrypt
- Nodemailer
- Twilio integration support

## Database

- MongoDB

## Development Tools

- Git
- GitHub
- VS Code
- Postman
- npm

---

# 📁 Project Structure

```text
Odoo_StockSense/
│
├── src/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── store/
│   ├── utils/
│   └── data/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.js
│
├── package.json
├── vite.config.js
├── .gitignore
└── README.md
```

---

# ✨ Features

## 🔐 Authentication

- User registration
- User login
- JWT authentication
- Protected routes
- Logout
- Forgot password
- OTP verification
- Password reset
- Role-based access

Authentication flow:

```text
Register / Login
       ↓
Authentication
       ↓
JWT Token
       ↓
Protected API
       ↓
Dashboard
```

---

## 📊 Dashboard

The dashboard provides an overview of inventory operations.

### Dashboard KPIs

- Total Products in Stock
- Low Stock Items
- Out of Stock Items
- Pending Receipts
- Pending Deliveries
- Scheduled Internal Transfers

The dashboard also provides inventory operation filtering and activity information.

---

# 📦 Product Management

Products can be created and managed using:

- Product Name
- SKU / Product Code
- Category
- Unit of Measure
- Initial Stock
- Reorder Point
- Stock by Location

Example:

```text
Product:
Steel Rod

SKU:
STL-001

Category:
Raw Materials

Unit:
kg
```

---

# 🗂️ Category Management

Products can be organized into categories.

Example categories:

```text
Raw Materials
Finished Goods
Packaging
Tools
Consumables
```

Category operations include:

- Create
- View
- Update
- Delete

---

# 🏭 Warehouse & Location Management

StockSense supports multiple warehouses and locations.

Example:

```text
Main Warehouse
│
├── Rack A
├── Rack B
├── Production Floor
└── Dispatch Area
```

Warehouse and location management includes:

- Create warehouse
- Update warehouse
- Delete warehouse
- Create locations
- Assign locations to warehouses

---

# 📦 Stock Management

Stock is tracked by product and location.

Example:

```text
Steel Rod
│
├── Main Warehouse     → 100 kg
├── Rack A             → 50 kg
└── Production Floor   → 25 kg
```

Stock availability is checked before stock-consuming operations such as deliveries.

---

# 📥 Receipts

Receipts are used for incoming goods from suppliers.

### Receipt Flow

```text
Create Receipt
      ↓
Add Supplier
      ↓
Add Products
      ↓
Enter Quantity
      ↓
Validate
      ↓
Stock Increases
      ↓
Movement Recorded
```

Example:

```text
Current Stock = 100

Receipt = +50

New Stock = 150
```

---

# 📤 Delivery Orders

Delivery Orders are used when stock leaves the warehouse.

### Delivery Flow

```text
Create Delivery
      ↓
Pick
      ↓
Pack
      ↓
Validate
      ↓
Stock Decreases
      ↓
Movement Recorded
```

Example:

```text
Current Stock = 100

Delivery = -10

New Stock = 90
```

The system checks available stock before completing a delivery.

---

# 🔄 Internal Transfers

Internal Transfers are used to move stock between warehouses or locations.

Example:

```text
Main Warehouse / Rack A
          │
          │ 30 units
          ▼
Production / Rack B
```

The total inventory remains unchanged.

```text
Source Location
      -30

Destination Location
      +30
```

Every internal movement is recorded for tracking.

---

# ⚖️ Inventory Adjustments

Inventory Adjustments are used to correct differences between system stock and physical stock.

Example:

```text
System Quantity   = 100
Physical Quantity = 97

Adjustment = -3
```

The stock quantity is updated and the adjustment is recorded.

Common adjustment reasons include:

- Damaged stock
- Lost stock
- Counting error
- Found stock
- Other discrepancies

---

# 📜 Move History

Move History provides a record of inventory movements.

Example:

```text
Date       Product       From       To          Quantity
--------------------------------------------------------
26 Sep     Steel Rod     Rack A     Rack B      20
26 Sep     Table         WH-01      WH-02       10
25 Sep     Steel Rod     Rack B     Delivery    15
```

This allows users to track how inventory moves between locations and operations.

---

# 🔁 Reordering Rules

Reordering rules help identify products that require replenishment.

Example:

```text
Product:
Steel Rod

Reorder Point:
20 kg
```

When stock reaches or falls below the reorder point, the product can be identified as requiring replenishment.

---

# 🔄 Inventory Flow

The overall StockSense inventory flow is:

```text
                    Supplier
                       │
                       ▼
                  ┌─────────┐
                  │ Receipt │
                  └────┬────┘
                       │
                    Validate
                       │
                       ▼
                     STOCK
                       │
            ┌──────────┼──────────┐
            │          │          │
            ▼          ▼          ▼
        Transfer    Delivery   Adjustment
            │          │          │
            ▼          ▼          ▼
       New Location  Customer  Correct Stock
            │          │          │
            └──────────┼──────────┘
                       ▼
                 Move History
```

---

# 📊 Stock Ledger

Every stock-changing operation should produce a corresponding movement/ledger record.

Example:

```text
Initial Stock
     +100
       │
       ▼
Receipt
     +50
       │
       ▼
Transfer
     -20 / +20
       │
       ▼
Delivery
     -10
       │
       ▼
Adjustment
      -3
       │
       ▼
Current Stock
      117
```

The ledger provides traceability for inventory changes.

---

# 🔐 Authentication & Authorization

StockSense uses JWT-based authentication.

```text
User
 │
 ├── Login
 │
 ▼
JWT Token
 │
 ▼
Axios Authorization Header
 │
 ▼
Express Authentication Middleware
 │
 ▼
Protected API
```

Supported roles:

```text
inventory_manager
warehouse_staff
```

Role-based authorization is used to control access to inventory operations.

---

# 🔌 API Overview

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/verify-otp
POST /api/auth/reset-password
GET  /api/auth/me
POST /api/auth/logout
```

## Products

```http
GET    /api/inventory/products
POST   /api/inventory/products
PUT    /api/inventory/products/:id
```

## Categories

```http
GET    /api/inventory/categories
POST   /api/inventory/categories
PUT    /api/inventory/categories/:id
DELETE /api/inventory/categories/:id
```

## Warehouses

```http
GET    /api/inventory/warehouses
POST   /api/inventory/warehouses
PUT    /api/inventory/warehouses/:id
DELETE /api/inventory/warehouses/:id
```

## Reordering Rules

```http
GET    /api/inventory/reorder-rules
POST   /api/inventory/reorder-rules
DELETE /api/inventory/reorder-rules/:id
```

## Inventory Operations

```http
GET    /api/inventory/documents
POST   /api/inventory/documents
PATCH  /api/inventory/documents/:id/status
```

## Move History

```http
GET /api/inventory/moves
```

## Dashboard

```http
GET /api/inventory/dashboard
```

---

# ⚙️ Installation

## Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB or MongoDB Atlas
- Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/Trusha29/Odoo_StockSense.git
```

```bash
cd Odoo_StockSense
```

---

## 2. Install Frontend Dependencies

From the project root:

```bash
npm install
```

---

## 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

---

# 🔑 Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_password

TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### Important

Never commit your `.env` file or any secret credentials to GitHub.

---

# ▶️ Running the Application

## Start Backend

Open a terminal:

```bash
cd backend
npm run dev
```

Backend:

```text
http://localhost:5000
```

---

## Start Frontend

Open another terminal from the project root:

```bash
npm run dev
```

Vite will provide the frontend development URL in the terminal.

API requests beginning with `/api` are proxied to the backend.

---

# 🔧 Development Architecture

The application follows this request flow:

```text
React Component
      ↓
Axios
      ↓
Express Route
      ↓
Controller
      ↓
Service
      ↓
Mongoose Model
      ↓
MongoDB
```

For inventory-changing operations:

```text
Operation
    ↓
Validate Request
    ↓
Check Authentication
    ↓
Check Role
    ↓
Check Stock
    ↓
Update Stock
    ↓
Create Movement Record
    ↓
Update Operation Status
```

---

# 🧪 Important Test Scenarios

## Receipt

```text
Initial Stock = 100
Receipt = 50

Expected Stock = 150
```

## Delivery

```text
Initial Stock = 100
Delivery = 20

Expected Stock = 80
```

## Internal Transfer

```text
Location A = 100
Location B = 50

Transfer = 20

Location A = 80
Location B = 70

Total = 150
```

## Adjustment

```text
System Quantity = 100
Physical Quantity = 97

Adjustment = -3

Expected Stock = 97
```

## Insufficient Stock

```text
Available Stock = 10
Requested Delivery = 20

Expected:
Operation rejected
Stock remains 10
```

## Duplicate Validation

```text
Receipt Status = DONE

Attempt to validate again

Expected:
Operation rejected
Stock must not increase again
```

---

# 🔒 Security

StockSense uses and/or plans the following security practices:

- Password hashing using bcrypt
- JWT authentication
- Protected API routes
- Role-based authorization
- Environment variables for secrets
- Server-side validation
- Stock availability validation
- Secure error handling
- Rate limiting
- Security headers
- Prevention of duplicate inventory operations

---