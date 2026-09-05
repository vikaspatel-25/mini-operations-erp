# Mini Operations ERP

A full-stack Operations ERP portal for managing multi-location inventory, work orders, internal stock transfers, and customer order stock reservations with JWT authentication, role-based access control, PostgreSQL transactions, and concurrency-safe inventory operations.

---

## 🌐 Live Deployments & Repository Links

* **Live Web Portal (Frontend):** https://mini-operations-erp-mjtz.vercel.app
* **Backend REST API:** https://mini-operations-erp-jade.vercel.app
* **GitHub Repository:** https://github.com/vikaspatel-25/mini-operations-erp

---

## 📐 Architecture Overview

```text
mini-operations-erp/
├── server/                       # Node.js + Express + PostgreSQL
│   ├── src/
│   │   ├── config/               # PostgreSQL connection
│   │   ├── controllers/          # Request handling
│   │   ├── middleware/           # Authentication & RBAC
│   │   ├── routes/               # REST API routes
│   │   ├── services/             # Business logic & transactions
│   │   ├── utils/                # JWT utilities
│   │   └── index.js              # Express application
│   ├── package.json
│   └── vercel.json
│
└── client/                       # React + Vite frontend
    ├── src/
    │   ├── pages/                # Five required ERP screens
    │   ├── services/             # API service functions
    │   ├── routes/               # React Router configuration
    │   ├── App.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    └── vercel.json
```

### 🔄 Data Flow Architecture

`React UI` ➔ `Fetch API` ➔ `Express REST API` ➔ `Authentication / RBAC` ➔ `Business Logic` ➔ `PostgreSQL (Supabase)`

---

## 🔑 Key Design Decisions & Business Rules

1. **JWT Authentication & RBAC**: Users authenticate using email and password. The backend generates a JWT and uses backend middleware to enforce role-based access for protected operations.

2. **Calculated Available Stock**: Available quantity is calculated as `Physical Quantity - Reserved Quantity` instead of being stored separately, preventing inconsistent stock values.

3. **Atomic Inventory Operations**: Inventory adjustments, transfer dispatch/receipt, and customer reservations use PostgreSQL transactions so related database changes succeed or fail together.

4. **Concurrency-Safe Reservations**: Customer order reservations lock the relevant inventory row using PostgreSQL `FOR UPDATE`, preventing concurrent users from reserving the same available stock.

5. **Transfer State Workflow**: Internal transfers follow `REQUESTED → DISPATCHED → RECEIVED`. Source stock is reduced during dispatch, while destination stock increases only after receipt. A transfer cannot be received twice.

6. **Automatic Work Order Shortage**: Work Order shortage is calculated from required quantity and current available inventory.

---

## 🛠️ Tech Stack

| Layer                 | Technology                |
| --------------------- | ------------------------- |
| **Frontend**          | React, Vite, React Router |
| **Backend**           | Node.js, Express.js       |
| **Database**          | PostgreSQL (Supabase)     |
| **Authentication**    | JWT + bcrypt              |
| **API Communication** | Fetch API                 |
| **Deployment**        | Vercel                    |

---

## 🔑 Test Credentials

All demo accounts are pre-seeded in the database:

| Role           | Email                            | Password        |
| -------------- | -------------------------------- | --------------- |
| **Admin**      | `admin@erp.local`                | `Admin123`      |
| **Operations** | `operations.mumbai@erp.local`    | `Operations123` |
| **Operations** | `operations.delhi@erp.local`     | `Operations123` |
| **Operations** | `operations.bangalore@erp.local` | `Operations123` |
| **Sales**      | `sales.mumbai@erp.local`         | `Sales123`      |
| **Sales**      | `sales.delhi@erp.local`          | `Sales123`      |
| **Sales**      | `sales.bangalore@erp.local`      | `Sales123`      |

---

## 📮 API Endpoints & Reference

| Method | Endpoint                      | Auth Required          | Description                                       |
| ------ | ----------------------------- | ---------------------- | ------------------------------------------------- |
| `POST` | `/api/auth/login`             | Public                 | Authenticates user and creates JWT session        |
| `GET`  | `/api/auth/me`                | Any Authenticated User | Returns current authenticated user                |
| `POST` | `/api/auth/logout`            | Any Authenticated User | Logs out the current user                         |
| `GET`  | `/api/inventory`              | Any Authenticated User | Retrieves inventory with available quantity       |
| `POST` | `/api/inventory/adjust`       | Admin / Operations     | Adjusts physical inventory                        |
| `GET`  | `/api/work-orders`            | Any Authenticated User | Retrieves work orders and reference data          |
| `POST` | `/api/work-orders`            | Admin                  | Creates a Work Order                              |
| `GET`  | `/api/transfers`              | Any Authenticated User | Retrieves internal transfers and reference data   |
| `POST` | `/api/transfers`              | Admin / Operations     | Creates an internal stock transfer                |
| `POST` | `/api/transfers/:id/dispatch` | Admin / Operations     | Dispatches transfer and reduces source stock      |
| `POST` | `/api/transfers/:id/receive`  | Admin / Operations     | Receives transfer and increases destination stock |
| `GET`  | `/api/orders`                 | Any Authenticated User | Retrieves customer orders and reference data      |
| `POST` | `/api/orders`                 | Admin / Sales          | Creates order and reserves available stock        |
| `GET`  | `/api/health`                 | Public                 | Checks API and database availability              |

---

## 🚀 Local Setup Instructions

### Prerequisites

* **Node.js** v20+
* **npm**
* **PostgreSQL database** or Supabase PostgreSQL database

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd mini-operations-erp
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Run the backend:

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:7002
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd client
npm install
```

Create a `.env` file inside `client/`:

```env
VITE_API_URL=http://localhost:7002/api
```

Run the frontend:

```bash
npm run dev
```

The frontend runs at the Vite development URL, normally:

```text
http://localhost:5173
```

---

## ✅ Core Features Implemented

* **JWT Authentication:** Login, logout, current-user authentication, bcrypt password verification, and protected backend routes.
* **Role-Based Access Control:** Admin, Operations, and Sales roles with backend authorization.
* **Inventory Management:** Multi-location inventory with physical, reserved, and calculated available quantities.
* **Inventory Transactions:** Stock adjustments with unique transaction IDs and duplicate transaction prevention.
* **Work Orders:** Admin-created work orders with item requirements, assigned users, statuses, and automatic shortage calculation.
* **Internal Stock Transfers:** Request, dispatch, and receive workflow with transactional source and destination inventory updates.
* **Customer Orders:** Order creation with backend stock reservation and concurrency-safe inventory locking.
* **Relational Database:** PostgreSQL schema with users, roles, locations, items, batches, inventory, transfers, work orders, and customer orders.
* **Production Deployment:** React frontend and Express backend deployed through Vercel.

---

## 🧪 Required Test Scenarios

The implementation covers the five required business test cases:

* Cannot reserve more than available stock
* Cannot transfer more than available stock
* Destination stock increases only after transfer receipt
* Same transfer cannot be received twice
* Unauthorized user cannot perform restricted operation

---

## ⚠️ Known Limitations

* No automated test suite is included in the current submission.
* Authentication depends on browser cookie support between the separately deployed frontend and backend.
* The project intentionally remains limited to the required ERP modules and does not include additional CRM, reporting, analytics, or unrelated enterprise features.
