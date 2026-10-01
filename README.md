# SmartStock — IoT-Based Store Stock Alert System

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-v4.21-000000?logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-v18.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-v6.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.4-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/Supabase_PostgreSQL-v15+-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![JWT](https://img.shields.io/badge/Auth-JWT_%26_bcrypt-FF4088?logo=json-web-tokens&logoColor=white)](https://jwt.io)

---

## 1. Project Overview

**SmartStock** is an intelligent, web-based store inventory monitoring and automation platform. It uses **software-simulated IoT telemetry** to continuously monitor retail stock levels, automatically detect low and critical inventory conditions, generate alerts and user-specific notifications, provide rule-based demand forecasting, and support end-to-end restocking purchase orders with suppliers.

> **IMPORTANT NOTICE:**  
> **The IoT devices in this project are software-simulated for demonstration purposes. No physical IoT hardware is required.**  
> SmartStock is a **web-only application**. All IoT devices, sensor readings, weight drops, and battery levels are modeled and triggered purely through software simulation via REST API endpoints.

---

## 2. Key Features

### Authentication & Authorization
* **Registration & Login:** Secure authentication with bcrypt password hashing (10 salt rounds).
* **Stateless JWT Tokens:** 24-hour token validity with automatic client session restoration.
* **Role-Based Access Control (RBAC):**
  * **MANAGER:** Full administrative authority over products, suppliers, inventory adjustments, and restock purchase orders.
  * **STAFF:** Operational authority for daily stock-in/stock-out, telemetry simulation, alert acknowledgement, and notification management.

### Executive Dashboard
* **Real-Time KPIs:** Live inventory summaries, total products count, and deficit counters calculated from PostgreSQL.
* **Stock Status Distribution:** Interactive status donut chart categorizing catalog health.
* **Recent Activity Feed:** Latest stock transactions, alerts, and IoT events.
* **Quick Actions:** Instant shortcuts to add products, dispatch telemetry, and trigger restocking.

### Product Catalog Management
* **Catalog Operations:** Add, edit, soft-delete, and search products with pagination.
* **Granular Filtering:** Filter by category, stock status (NORMAL, LOW, CRITICAL, OUT OF STOCK), and assigned supplier.
* **Product 360 View:** Consolidated single-pane view showing inventory, assigned supplier, connected simulated IoT device, demand forecast, active alerts, and stock history.

### Inventory Management & Audit Ledger
* **Manual Transactions:** Track operational `STOCK_IN` (deliveries) and `STOCK_OUT` (sales/shrinkage).
* **Physical Stock Reconciliation:** Manager-only stock count adjustment (`ADJUSTMENT`).
* **Immutable Audit Trail:** Comprehensive `inventory_history` ledger capturing every transaction, delta, user ID, timestamp, and source (`MANUAL` vs `IOT`).

### Software-Simulated IoT Monitoring
* **Virtual Edge Devices:** Modeled shelf devices with calibrated tare weights, shelf locations, and battery tracking.
* **Telemetry Simulator:** Interactive simulator panel to dispatch realistic sensor payloads (weight, optical count, RFID).
* **Live Telemetry Stream:** Immediate ingestion, delta calculation, inventory reflection, and battery health reporting.

### Autonomous Alert Engine
* **Automated Threshold Evaluation:** Real-time classification into `LOW_STOCK`, `CRITICAL_STOCK`, and `OUT_OF_STOCK`.
* **Smart De-Duplication:** Prevents repetitive alert clutter for unchanged deficit conditions.
* **Alert Lifecycle:** Transition states from `ACTIVE` → `ACKNOWLEDGED` → `RESOLVED`.
* **Auto-Resolution:** Restocking or stock-in automatically resolves active deficit alerts.

### Notification Center
* **In-App Notifications:** Real-time inbox for store staff with direct alert deep-linking.
* **Notification Preferences:** User-level toggles to customize alert types received.
* **Unread Counter:** Topbar badge with live counter, mark-as-read, mark-all-read, and deletion.

### Business Analytics & Visualizations
* **Stock Movement Trends:** Recharts area/bar charts comparing Stock In vs Stock Out.
* **Category Breakdown:** Stock volume and valuation distribution across product categories.
* **Alert Analytics:** Historical severity distribution and incident frequency.
* **IoT Device Analytics:** Telemetry frequency and battery degradation tracking.

### Demand Forecasting
* **Average Daily Consumption (ADC):** Calculated strictly from genuine historical `STOCK_OUT` transactions.
* **Days Remaining:** Mathematical estimation of calendar days remaining before stock reaches 0.
* **Projected Depletion Date:** Calendar date projection for proactive vendor reordering.
* **Data Sufficiency Safety:** Safely identifies products with limited history instead of fabricating speculative values.

### Restocking & Procurement
* **Purchase Order Lifecycle:** Complete workflow: `DRAFT` → `PENDING` → `ORDERED` → `RECEIVED` (or `CANCELLED`).
* **Automated Suggestion Engine:** `/api/restock/needing-restock` identifies depleted items with suggested reorder quantities.
* **Automated Restock Reception:** Marking orders as `RECEIVED` automatically increments product inventory, logs `STOCK_IN` audit entries, resets stock status to `NORMAL`, and resolves alerts.

### Supplier Directory
* **Supplier Profiles:** Contact directory, address, lead time in days, and active status toggles.
* **Supplier Products:** View all SKUs fulfilled by a given vendor.
* **Order History:** Complete log of purchase orders fulfilled by each vendor.

### User Settings & Security
* **Profile Management:** Update personal display name and review account creation date.
* **Password Management:** Secure password update requiring current password verification.
* **Notification Preferences:** Individual notification filtering preferences.

---

## 3. Technology Stack

### Frontend:
* **React (v18.3):** Modern functional component architecture with hooks.
* **Vite (v6.1):** High-performance bundler and dev server.
* **JavaScript (ES6+ / JSX):** Clean component implementation without extraneous build layers.
* **Tailwind CSS (v3.4):** Responsive utilities, modern dark/light styling, and glassmorphic badges.
* **React Router (v7.1):** Client-side SPA routing with protected role gates.
* **Axios (v1.7):** HTTP client with request/response interceptors for JWT injection and error normalization.
* **Recharts (v2.15):** Responsive SVG charting for analytics and forecasting.
* **Lucide React (v0.475):** Crisp, accessible iconography.

### Backend:
* **Node.js (v20+):** High-performance JavaScript runtime with native ECMAScript Modules (`type: module`).
* **Express.js (v4.21):** Lightweight RESTful routing and middleware pipeline.
* **bcrypt (v5.1):** Secure 10-round salted password hashing.
* **jsonwebtoken (v9.0):** Signed HMAC SHA-256 JWT tokens.
* **CORS (v2.8):** Controlled cross-origin resource sharing policy.
* **dotenv (v16.4):** Zero-dependency environment variable isolation.

### Database:
* **Supabase PostgreSQL (v15+):** Cloud relational database hosting 11 normalized tables with foreign keys and indexes.

---

## 4. System Architecture

```text
+-------------------------------------------------------------------------------+
|                            BROWSER CLIENT (React SPA)                         |
|  - Pages: Dashboard, Catalog, Inventory, IoT Monitor, Alerts, Restock, etc.  |
|  - Contexts: AuthContext, NotificationContext, ToastContext                   |
+-------------------------------------------------------------------------------+
                                      |
                                      v HTTPS / JSON REST API
+-------------------------------------------------------------------------------+
|                        EXPRESS BACKEND SERVER (Node.js)                       |
|  - Security Layer: Security Headers, CORS, Rate Limiting                      |
|  - Auth Layer: JWT Verification, RBAC Middleware (MANAGER / STAFF)            |
|  - Business Services: product, inventory, iot, alert, notification, restock   |
+-------------------------------------------------------------------------------+
                                      |
                                      v PostgreSQL Client / SQL
+-------------------------------------------------------------------------------+
|                      DATABASE LAYER (Supabase PostgreSQL)                     |
|  - 11 Tables: users, products, suppliers, simulated_devices, alerts, etc.     |
+-------------------------------------------------------------------------------+
```

### Simulated IoT Telemetry Architecture

```text
+----------------------------+
|   SOFTWARE-SIMULATED IoT   |
|   (Virtual Shelf Device)   |
+----------------------------+
              |
              v POST /api/iot/simulate { deviceId, calculatedUnits, rawReading }
+----------------------------+
|       Telemetry API        |
+----------------------------+
              |
              v Ingest reading into sensor_readings
+----------------------------+
|       Sensor Reading       |
+----------------------------+
              |
              v Compute unit delta
+----------------------------+
|      Inventory Update      |
+----------------------------+
              |
              v Append audit ledger record (source: 'IOT')
+----------------------------+
|     Inventory History      |
+----------------------------+
              |
              v Recalculate status (NORMAL, LOW, CRITICAL, OUT_OF_STOCK)
+----------------------------+
|        Stock Status        |
+----------------------------+
              |
              v Evaluate deficit thresholds & de-duplicate
+----------------------------+
|        Alert Engine        |
+----------------------------+
              |
              v Filter by user preferences & dispatch
+----------------------------+
|        Notification        |
+----------------------------+
```

---

## 5. Software-Simulated IoT Architecture

SmartStock eliminates the barrier of expensive, fragile physical microcontrollers (e.g. ESP32, Arduino) and physical load cells by modeling edge devices entirely in software:

1. **Virtual Device Registry (`simulated_devices`):**  
   Each device represents a physical smart shelf unit with an assigned hardware code (e.g., `SIM-IOT-SCALE-01`), sensor model (`WEIGHT_SENSOR`, `OPTICAL_LEVEL`, `RFID_SCANNER`), physical location, tare unit weight, and linked product.
2. **Telemetry Dispatch:**  
   The simulator sends realistic payloads to `/api/iot/simulate` containing raw sensor readings, calculated unit quantities, and battery levels.
3. **Automated Business Processing:**  
   The backend processes incoming telemetry identically to a real IoT gateway: it validates device authorization, logs raw readings in `sensor_readings`, updates stock in `products`, creates an immutable entry in `inventory_history` with source `IOT`, triggers the alert evaluation engine, and delivers user notifications.

> *"This software-simulated IoT implementation is designed specifically for academic demonstration, hackathons, and MVP evaluation."*

---

## 6. Stock Status Rules

SmartStock applies deterministic, objective rules to classify product inventory health:

| Status | Mathematical Condition | UI Indicator | Description |
| :--- | :--- | :--- | :--- |
| **NORMAL** | $\text{Current Stock} > \text{Minimum Stock}$ | Green Badge | Stock is healthy. No action required. |
| **LOW** | $\text{Current Stock} \le \text{Minimum Stock}$ **AND** $\text{Current Stock} > 0.5 \times \text{Minimum Stock}$ | Yellow Badge | Stock is below reorder threshold. Triggers `LOW_STOCK` alert. |
| **CRITICAL** | $\text{Current Stock} > 0$ **AND** $\text{Current Stock} \le 0.5 \times \text{Minimum Stock}$ | Red Badge | Stock is severely depleted. Triggers `CRITICAL_STOCK` alert. |
| **OUT OF STOCK** | $\text{Current Stock} = 0$ | Purple Badge | Stock is completely exhausted. Triggers `OUT_OF_STOCK` alert. |

---

## 7. Demand Forecasting

SmartStock uses a transparent, formulaic forecasting model calculated directly from historical inventory transactions:

### Formulas
1. **Average Daily Consumption (ADC):**
   $$\text{ADC} = \frac{\text{Total Consumed Units via STOCK\_OUT}}{\text{Observation Calendar Days (7, 30, or 90)}}$$
2. **Estimated Days Remaining:**
   $$\text{Days Remaining} = \frac{\text{Current Stock}}{\text{ADC}}$$
3. **Projected Depletion Date:**
   $$\text{Depletion Date} = \text{Current Date} + \text{Days Remaining}$$

### Important Clarifications
* **Historical Data Source:** Calculated strictly from genuine `STOCK_OUT` transactions in `inventory_history`.
* **Zero Machine Learning:** The current implementation is deterministic and statistical. It does **not** use artificial intelligence or black-box machine learning models.
* **Insufficient Data Protection:** If a product has no consumption history ($\text{ADC} = 0$), the system safely outputs `null` / *"Insufficient data"* rather than division-by-zero errors or fabricated predictions.

---

## 8. Database Architecture

The PostgreSQL database comprises 11 normalized tables:

| Table | Purpose |
| :--- | :--- |
| **`users`** | User credentials, password hashes, and access roles (`MANAGER`, `STAFF`). |
| **`suppliers`** | Vendor contact info, fulfillment addresses, and expected lead times. |
| **`products`** | Product catalog, pricing, minimum stock thresholds, and live inventory counts. |
| **`simulated_devices`** | Virtual smart shelf sensors with unit weight calibration and location. |
| **`sensor_readings`** | Time-series log of software-simulated IoT telemetry data. |
| **`inventory_history`** | Immutable audit trail of every stock change (manual deliveries, sales, and IoT telemetry). |
| **`alerts`** | Active and historical deficit alert events with status tracking. |
| **`notifications`** | In-app user notifications linked to specific alerts. |
| **`restock_orders`** | Supplier purchase orders with lifecycle states (`PENDING`, `ORDERED`, `RECEIVED`). |
| **`restock_order_items`**| Line-item details and quantities for purchase orders. |
| **`user_preferences`** | User-specific notification preference filters. |

---

## 9. User Roles & Access Control

| Permission / Action | MANAGER | STAFF |
| :--- | :---: | :---: |
| View Dashboard, Analytics, Forecast, and Inventory | Yes | Yes |
| View Products, Suppliers, and Restock Orders | Yes | Yes |
| Perform Manual Stock In / Stock Out | Yes | Yes |
| Trigger Simulated IoT Telemetry | Yes | Yes |
| Acknowledge & Resolve Alerts | Yes | Yes |
| Manage Personal Notifications & Preferences | Yes | Yes |
| Create, Edit, or Delete Products | **Yes** | No (403 Forbidden) |
| Create, Edit, or Toggle Status of Suppliers | **Yes** | No (403 Forbidden) |
| Perform Physical Inventory Adjustments (`/adjust`) | **Yes** | No (403 Forbidden) |
| Create, Order, Receive, or Cancel Restock Orders | **Yes** | No (403 Forbidden) |

---

## 10. Project Structure

```text
smartstock-iot/
├── .env.example                  # Root environment configuration template
├── .gitignore                    # Protects node_modules, build artifacts, and secrets
├── LICENSE                       # MIT License
├── README.md                     # Main project documentation (this file)
├── SECURITY.md                   # Security architecture and vulnerability policy
│
├── docs/                         # Detailed technical documentation
│   ├── DEMO_SCRIPT.md            # Presenter script for live 5–10 min demonstration
│   ├── ARCHITECTURE.md           # System and data flow architecture with ASCII diagrams
│   ├── API.md                    # Complete REST API endpoint reference
│   ├── DATABASE.md               # Database schema specifications and ERD
│   ├── LIMITATIONS.md            # Transparent disclosure of prototype boundaries
│   └── FUTURE_SCOPE.md           # Enhancement roadmap for physical hardware and ML
│
├── server/                       # Express.js REST API backend
│   ├── .env.example              # Backend environment template
│   ├── package.json              # Node.js dependencies and test scripts
│   ├── server.js                 # Express application initialization and health check
│   ├── database/
│   │   ├── schema.sql            # Complete Supabase PostgreSQL schema (11 tables)
│   │   └── seeds.sql             # Realistic demo dataset (products, devices, alerts)
│   └── src/
│       ├── config/               # Environment validation (env.js) and Supabase client (db.js)
│       ├── controllers/          # HTTP request handlers (auth, product, inventory, iot, etc.)
│       ├── middleware/           # Security headers, auth, role guards, rate limiting, errors
│       ├── routes/               # Express route definitions
│       ├── services/             # Core business logic and database queries
│       ├── types/                # Domain enums and constants
│       ├── utils/                # Date math, stock status rules, pagination helpers
│       └── validators/           # Strict request body input validation schemas
│
└── client/                       # React 18 single-page application (Vite)
    ├── .env.example              # Frontend environment template
    ├── package.json              # Frontend dependencies
    ├── vite.config.js            # Vite bundler configuration
    ├── tailwind.config.js        # Tailwind CSS design system configuration
    ├── postcss.config.js         # PostCSS configuration
    ├── index.html                # HTML entry point
    └── src/
        ├── App.jsx               # Application routes and context providers
        ├── main.jsx              # React DOM mounting
        ├── index.css             # Tailwind base styles and custom utilities
        ├── api/                  # Axios HTTP client configuration and interceptors
        ├── components/           # Reusable UI components (layout, modals, badges, cards)
        ├── context/              # React Context (AuthContext, NotificationContext, ToastContext)
        ├── pages/                # Screen-level views (Dashboard, Products, IoT, Alerts, etc.)
        ├── services/             # Frontend API service abstractions
        └── utils/                # Client-side formatting helpers and badge mappers
```

---

## 11. Installation & Setup

### Prerequisites
* **Node.js:** v20.x or higher installed ([Download](https://nodejs.org))
* **Git:** Latest version installed

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/smartstock-iot.git
cd smartstock-iot
```

### Step 2: Install Backend Dependencies
```bash
cd server
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../client
npm install
```

---

## 12. Environment Variables

### Backend Configuration (`server/.env`)
Create a `.env` file inside the `server/` directory copying `server/.env.example`:
```ini
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Authentication Secret (Minimum 32 characters recommended)
JWT_SECRET=your-secure-random-jwt-secret-here
JWT_EXPIRES_IN=24h

# Supabase PostgreSQL Configuration
# NOTE: The service role key is strictly backend-only. Never expose it to the client!
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
```

### Frontend Configuration (`client/.env`)
Create a `.env` file inside the `client/` directory copying `client/.env.example`:
```ini
VITE_API_URL=http://localhost:5000/api
```

> **CRITICAL SECURITY NOTE:**  
> The Supabase service-role key must **remain strictly on the backend**. Never expose it through `VITE_*` variables on the client.

---

## 13. Running the Application

### 1. Start the Backend API Server
Open Terminal 1:
```bash
cd server
npm run dev
```
* **Backend API URL:** `http://localhost:5000`
* **Health Check Endpoint:** `http://localhost:5000/api/health` (returns `{ status: "ok" }`)

### 2. Start the Frontend Client
Open Terminal 2:
```bash
cd client
npm run dev
```
* **Frontend Web Application:** `http://localhost:5173`

---

## 14. Demo Accounts

The project includes seeded demo accounts with distinct roles:

| Role | Email | Password | Primary Purpose |
| :--- | :--- | :--- | :--- |
| **MANAGER** | `manager@smartstock.com` | `password123` | Full access: create products, suppliers, inventory adjust, receive restock orders. |
| **STAFF** | `staff@smartstock.com` | `password123` | Operational access: stock in/out, dispatch IoT telemetry, acknowledge alerts. |

*Quick-Fill buttons are conveniently provided on the Login page (`/login`) for instant evaluation.*

---

## 15. Demo Flow Walkthrough

For a comprehensive presentation script, see [`docs/DEMO_SCRIPT.md`](file:///c:/Users/vidhe/Documents/smartstock-iot/docs/DEMO_SCRIPT.md).

```text
1. LOGIN           Sign in as Manager (manager@smartstock.com).
      ↓
2. DASHBOARD       Inspect KPI summary cards, stock status donut chart, and live alerts.
      ↓
3. IoT MONITOR     Open IoT Monitor (/iot), select Milk shelf device, simulate stock drop to 15.
      ↓
4. INVENTORY       Observe live stock update to 15, status change to LOW, and audit history log.
      ↓
5. ALERTS          View newly generated LOW_STOCK alert, review thresholds, and click Acknowledge.
      ↓
6. NOTIFICATIONS   Open Notification Center, observe unread count badge, and mark notification as read.
      ↓
7. FORECAST        View demand forecasting (/forecast) showing ADC and estimated days remaining.
      ↓
8. RESTOCK ORDER   Create a purchase order (/restocking) for 50 units with Fresh Dairy Ltd.
      ↓
9. RECEIVE RESTOCK Receive the order: stock increases (+50), status resets to NORMAL, alert resolves.
      ↓
10. ANALYTICS      Open Analytics (/analytics) to view Stock Movement charts and category metrics.
      ↓
11. PRODUCT 360    Open Milk details (/products/:id) for the unified consolidated product view.
```

---

## 16. Technical Documentation Index

* **[Live Demo Presentation Script](file:///c:/Users/vidhe/Documents/smartstock-iot/docs/DEMO_SCRIPT.md)** — Step-by-step click, show, and explain guide for judges and evaluators.
* **[System Architecture](file:///c:/Users/vidhe/Documents/smartstock-iot/docs/ARCHITECTURE.md)** — End-to-end data flow diagrams and architectural decomposition.
* **[REST API Reference](file:///c:/Users/vidhe/Documents/smartstock-iot/docs/API.md)** — Complete specification of all HTTP endpoints, parameters, and payloads.
* **[Database Documentation](file:///c:/Users/vidhe/Documents/smartstock-iot/docs/DATABASE.md)** — Data dictionary, constraints, indexes, and ERD.
* **[Security Architecture](file:///c:/Users/vidhe/Documents/smartstock-iot/SECURITY.md)** — Hashing, token security, rate limiting, and IDOR protection.
* **[Known Limitations](file:///c:/Users/vidhe/Documents/smartstock-iot/docs/LIMITATIONS.md)** — Honest disclosure of prototype boundaries.
* **[Future Scope](file:///c:/Users/vidhe/Documents/smartstock-iot/docs/FUTURE_SCOPE.md)** — Roadmap for physical ESP32 sensors, MQTT, and ML forecasting.

---

## 17. License

This project is licensed under the MIT License — see the [LICENSE](file:///c:/Users/vidhe/Documents/smartstock-iot/LICENSE) file for details.
