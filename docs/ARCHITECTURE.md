# SmartStock — System Architecture Documentation

**Project:** SmartStock — IoT-Based Store Stock Alert System  
**Document Version:** 1.0.0 (Release Candidate)  
**Implementation Mode:** Web-based software application with software-simulated IoT telemetry  

---

## 1. System Overview

SmartStock is a cloud-ready, responsive web application engineered to automate store inventory tracking, stockout prevention, alert dispatching, and replenishment operations. Physical IoT microcontrollers (e.g., ESP32, Arduino) and hardware sensors are **software-simulated** via realistic time-series telemetry events dispatched through authenticated REST API endpoints.

```text
+-------------------------------------------------------------------------------+
|                                  USER LAYER                                   |
|                 Store Managers & Staff via Web Browsers                       |
+-------------------------------------------------------------------------------+
                                      |
                                      v HTTPS / JSON
+-------------------------------------------------------------------------------+
|                            FRONTEND (React + Vite)                            |
|  - React 18, React Router v7, Tailwind CSS v3, Recharts, Lucide Icons        |
|  - Contexts: AuthContext, NotificationContext, ToastContext                   |
|  - Pages: Dashboard, Products, Inventory, IoT Monitor, Alerts, Restock, etc.  |
+-------------------------------------------------------------------------------+
                                      |
                                      v REST API / Bearer JWT (Port 5000)
+-------------------------------------------------------------------------------+
|                           BACKEND (Node.js + Express)                         |
|  - HTTP Middleware: Security Headers, CORS, Rate Limiters, JWT Auth, RBAC    |
|  - Input Validation: Strict schemas, sanitization, mass assignment defense    |
|  - Express Routers: /api/auth, /api/products, /api/inventory, /api/iot, etc.  |
|  - Business Services: product, inventory, iot, alert, notification, restock   |
+-------------------------------------------------------------------------------+
                                      |
                                      v Database Client / SQL
+-------------------------------------------------------------------------------+
|                        DATABASE LAYER (Supabase PostgreSQL)                   |
|  - Relational Schema: 11 Normalized Tables, Foreign Keys, CHECK constraints   |
|  - Audit Trail: Immutable time-series inventory history and sensor readings   |
|  - In-Memory Fallback: Automated mock repository for offline unit/phase tests |
+-------------------------------------------------------------------------------+
```

---

## 2. Frontend Architecture

The frontend is a single-page application (SPA) built using **React 18** and bundled with **Vite 6**.

```text
client/src/
├── main.jsx                     # Application bootstrap and root DOM mounting
├── App.jsx                      # App-level routing and providers hierarchy
├── index.css                    # Tailwind CSS directives and custom base styles
│
├── api/                         # Axios client instance with request/response interceptors
│   ├── axios.js                 # Injects Bearer JWT and handles 401 token expiration
│   └── endpoints.js             # Centralized API route constants
│
├── context/                     # React Context providers for global application state
│   ├── AuthContext.jsx          # User session, login, register, logout, profile state
│   ├── NotificationContext.jsx  # Polling/refreshing unread count, mark-read handlers
│   └── ToastContext.jsx         # Global notifications, error alerts, and success toasts
│
├── components/                  # Modular, reusable UI components
│   ├── common/                  # Buttons, Modals, Badges, Loaders, ErrorBoundary
│   ├── layout/                  # AppLayout, Navbar, Sidebar, PageHeader
│   ├── products/                # ProductCard, ProductModal, ProductFilters
│   ├── inventory/               # InventoryModal, StockAdjustmentModal
│   ├── iot/                     # DeviceCard, TelemetrySimulatorModal, ReadingTable
│   ├── alerts/                  # AlertCard, AlertFilterBar, AcknowledgeModal
│   └── restocking/              # OrderStatusBadge, RestockItemRow, ReceiveOrderModal
│
├── pages/                       # Screen-level views mapping 1-to-1 with routes
│   ├── Landing.jsx              # Public landing page with feature breakdown
│   ├── Login.jsx & Register.jsx # Authentication screens with quick-fill demo buttons
│   ├── Dashboard.jsx            # KPI cards, status donut chart, quick actions
│   ├── Products.jsx             # Product catalog with search, filter, CRUD
│   ├── ProductDetails.jsx       # Consolidated 360-degree product view
│   ├── Inventory.jsx            # Live stock management, manual stock in/out
│   ├── InventoryHistory.jsx     # Filterable, paginated audit trail
│   ├── IotMonitor.jsx           # Software IoT device simulator and telemetry feed
│   ├── Alerts.jsx & AlertDetails# Exception monitoring, acknowledgement, resolution
│   ├── Notifications.jsx        # User-specific notification inbox
│   ├── Analytics.jsx            # Recharts-powered business intelligence charts
│   ├── Forecast.jsx             # Demand forecasting & ADC depletion projections
│   ├── Restocking.jsx           # Supplier purchase order lifecycle management
│   ├── Suppliers.jsx            # Supplier directory and lead time tracking
│   ├── Settings.jsx             # Notification preferences and password updates
│   └── Profile.jsx              # User profile details and role display
│
├── hooks/                       # Custom hooks (e.g. useDebounce, usePagination)
├── services/                    # API client abstraction wrappers for each domain
└── utils/                       # Date formatters, stock status badges, currency format
```

---

## 3. Backend Architecture

The backend is built with **Node.js** and **Express.js** using native ECMAScript Modules (`"type": "module"`). It follows a clean 3-tier Layered Architecture: **Routes → Controllers → Services → Data Layer**.

```text
server/
├── server.js                    # Express app initialization, middleware binding, port listener
│
└── src/
    ├── config/
    │   ├── env.js               # Environment schema validation and safe fallbacks
    │   └── db.js                # Supabase client instantiation
    │
    ├── middleware/
    │   ├── security.middleware.js # Strict security headers (CSP, HSTS, X-Frame-Options)
    │   ├── rateLimit.middleware.js# Auth & general API rate limiting (brute force defense)
    │   ├── auth.middleware.js     # JWT extraction, verification, user attachment
    │   ├── role.middleware.js     # RBAC enforcer (MANAGER vs STAFF permissions)
    │   └── error.middleware.js    # 404 handler and centralized JSON error normalizer
    │
    ├── validators/              # Input validation and sanitization middleware
    │   ├── product.validator.js
    │   ├── inventory.validator.js
    │   ├── restock.validator.js
    │   └── supplier.validator.js
    │
    ├── routes/                  # Express route definitions mapping HTTP verbs to controllers
    │   ├── auth.routes.js
    │   ├── product.routes.js
    │   ├── inventory.routes.js
    │   ├── iot.routes.js
    │   ├── alert.routes.js
    │   ├── notification.routes.js
    │   ├── analytics.routes.js
    │   ├── forecast.routes.js
    │   ├── restock.routes.js
    │   ├── supplier.routes.js
    │   └── settings.routes.js
    │
    ├── controllers/             # HTTP boundary: request parsing, response formatting, status codes
    │   └── [domain].controller.js
    │
    ├── services/                # Business logic, state calculation, database queries
    │   ├── auth.service.js
    │   ├── product.service.js
    │   ├── inventory.service.js
    │   ├── iot.service.js
    │   ├── alert.service.js
    │   ├── notification.service.js
    │   ├── analytics.service.js
    │   ├── forecast.service.js
    │   ├── restock.service.js
    │   ├── supplier.service.js
    │   └── settings.service.js
    │
    ├── utils/                   # Reusable domain utilities
    │   ├── stockStatus.js       # Threshold classification (NORMAL, LOW, CRITICAL, OUT_OF_STOCK)
    │   ├── dateRange.js         # Date calculation and formatting helpers
    │   └── pagination.js        # Safe pagination bounding (page, limit <= 100)
    │
    └── types/                   # Constants and enums (StockStatus, AlertType, OrderStatus)
```

---

## 4. Database Architecture

The database is hosted on **Supabase PostgreSQL** and contains 11 normalized tables with foreign keys and index optimizations:

```text
+-------------------+       +-----------------------+       +-------------------+
|     suppliers     |       |       products        |       | simulated_devices |
|-------------------|       |-----------------------|       |-------------------|
| id (PK)           |<------+ supplier_id (FK)      |<------+ product_id (FK)   |
| name              |       | id (PK)               |       | id (PK)           |
| email, phone      |       | sku, name, category   |       | device_code       |
| lead_time_days    |       | current_stock         |       | unit_weight_grams |
| is_active         |       | minimum_stock         |       | status, last_ping |
+-------------------+       | stock_status          |       +-------------------+
          |                 +-----------------------+                 |
          |                             |                             |
          v                             v                             v
+-------------------+       +-----------------------+       +-------------------+
|  restock_orders   |       |   inventory_history   |       |  sensor_readings  |
|-------------------|       |-----------------------|       |-------------------|
| id (PK)           |       | id (PK)               |       | id (PK)           |
| supplier_id (FK)  |       | product_id (FK)       |       | device_id (FK)    |
| status            |       | user_id (FK)          |       | product_id (FK)   |
| total_amount      |       | change_type           |       | calculated_units  |
+-------------------+       | quantity_change       |       | raw_reading       |
          |                 | source (MANUAL/IOT)   |       | battery_level     |
          v                 +-----------------------+       +-------------------+
+-----------------------+               |
| restock_order_items   |               v
|-----------------------|   +-----------------------+       +-------------------+
| id (PK)               |   |        alerts         |       |   notifications   |
| restock_order_id (FK) |   |-----------------------|       |-------------------|
| product_id (FK)       |   | id (PK)               |<------+ alert_id (FK)     |
| quantity, total_price |   | product_id (FK)       |       | user_id (FK)      |
+-----------------------+   | alert_type, severity  |       | title, message    |
                            | status (ACTIVE/etc)   |       | is_read, read_at  |
                            +-----------------------+       +-------------------+
```

---

## 5. End-to-End Application Flows

### Flow 1: Authentication & Authorization

```text
User / Client Form
       |
       v POST /api/auth/login { email, password }
Rate Limiter Middleware (authRateLimiter)
       |
       v (checks IP attempt window)
Auth Controller & Auth Service
       |
       +---> Look up user by email in PostgreSQL
       |
       +---> Verify password with bcrypt.compare(plain, hash)
       |
       v Generate signed JWT { userId, email, role } (expires in 24h)
Return HTTP 200 { token, user: { id, name, email, role } }
       |
       v Client saves token in localStorage / AuthContext state
All subsequent requests send: Authorization: Bearer <token>
       |
       v authenticateToken middleware verifies HMAC signature
       |
       v authorizeRoles('MANAGER') checks req.user.role
```

---

### Flow 2: Simulated IoT Telemetry Ingestion

```text
Browser Client (IoT Monitor Page)
       |
       v POST /api/iot/simulate
       | Body: { deviceId, calculatedUnits: 15, rawReading: 15000, batteryLevel: 98 }
authenticateToken Middleware
       |
       v
IoT Controller (iot.controller.js)
       |
       v
IoT Service (iot.service.js)
       |
       +---> 1. Validate device exists and is ACTIVE
       |
       +---> 2. Insert record into sensor_readings table
       |
       +---> 3. Update device last_ping_at timestamp
       |
       +---> 4. Calculate delta: (newUnits - previousProductStock)
       |
       +---> 5. Call InventoryService.updateProductStock()
       |
       +---> 6. Insert audit trail in inventory_history:
       |        change_type: 'ADJUSTMENT' (or 'STOCK_OUT'),
       |        source: 'IOT',
       |        reason: 'SIMULATED_CONSUMPTION'
       |
       +---> 7. Recalculate stock_status (NORMAL / LOW / CRITICAL / OUT_OF_STOCK)
       |
       +---> 8. Invoke AlertEngine.evaluateProductAlerts(productId)
       |
       v
Return HTTP 200 { success: true, reading, product, alert }
```

---

### Flow 3: Alert Evaluation & De-Duplication Engine

```text
Stock Change Occurs (Manual or IoT)
       |
       v
Alert Service (alert.service.js: evaluateProductAlerts)
       |
       +---> Compare currentStock against minimumStock:
       |     - stock > minimum             => NORMAL
       |     - 0.5*min < stock <= min      => LOW_STOCK
       |     - 0 < stock <= 0.5*min        => CRITICAL_STOCK
       |     - stock === 0                 => OUT_OF_STOCK
       |
       +---> Check existing ACTIVE / ACKNOWLEDGED alerts for this product:
       |
       |  CASE A: Stock is now NORMAL
       |  - Auto-resolve any existing ACTIVE/ACKNOWLEDGED alerts
       |  - Set resolved_at = NOW()
       |
       |  CASE B: Stock is in Deficit (LOW, CRITICAL, OUT_OF_STOCK)
       |  - If active alert already exists with identical alert_type:
       |      Update current_stock and message (prevent duplicate alert rows)
       |  - If active alert exists with DIFFERENT severity:
       |      Auto-resolve outdated alert and create new higher/lower severity alert
       |  - If no active alert exists:
       |      Insert new alert into alerts table
       |      Trigger NotificationService.dispatchAlertNotifications(newAlert)
       |
       v
Return updated alert status
```

---

### Flow 4: Notification Dispatch & User Preference Filtering

```text
New Alert Created in alerts table
       |
       v
Notification Service (notification.service.js)
       |
       +---> Fetch all active users (Managers & Staff)
       |
       +---> For each user:
       |        Fetch user_preferences from user_preferences table
       |        Check if user has enabled alerts of this type:
       |        - LOW_STOCK: low_stock_enabled === true
       |        - CRITICAL_STOCK: critical_stock_enabled === true
       |        - OUT_OF_STOCK: out_of_stock_enabled === true
       |
       +---> If enabled:
       |        Insert row into notifications table:
       |        { user_id, alert_id, product_id, title, message, type, is_read: false }
       |
       v
Frontend polling / refresh fetches GET /api/notifications/unread-count
Top navigation bar bell badge displays real-time unread count
```

---

### Flow 5: Demand Forecasting Engine

```text
User opens /forecast or /products/:id
       |
       v GET /api/forecast/products/:id?period=30
authenticateToken Middleware
       |
       v
Forecast Controller & Service (forecast.service.js)
       |
       +---> 1. Query inventory_history table for this product:
       |        WHERE change_type = 'STOCK_OUT'
       |        AND created_at >= (NOW() - period_days)
       |
       +---> 2. Compute Total Consumed = SUM(|quantity_change|)
       |
       +---> 3. Compute Average Daily Consumption (ADC):
       |        ADC = Total Consumed / period_days
       |
       +---> 4. Compute Days Remaining:
       |        IF current_stock <= 0 => Days Remaining = 0
       |        IF ADC <= 0 => Days Remaining = null (insufficient consumption)
       |        ELSE => Days Remaining = current_stock / ADC
       |
       +---> 5. Compute Projected Depletion Date:
       |        Depletion Date = NOW() + (Days Remaining * 24 hours)
       |
       v
Return HTTP 200 { product, currentStock, adc, daysRemaining, depletionDate }
```

---

### Flow 6: Restocking Order Lifecycle

```text
[MANAGER] Clicks "+ New Restock Order"
       |
       v POST /api/restock { supplierId, items: [{ productId, quantity, unitPrice }] }
Restock Service creates order with status: 'PENDING' (or 'DRAFT')
       |
       v
[MANAGER] Reviews order and clicks "Mark as Ordered"
       |
       v PATCH /api/restock/:id/order
Restock Service sets status: 'ORDERED', ordered_at = NOW()
       |
       v
Supplier delivers goods to store
       |
       v
[MANAGER] Clicks "Receive Order"
       |
       v PATCH /api/restock/:id/receive
Restock Service:
  1. Atomically updates order status to 'RECEIVED' and sets received_at = NOW()
  2. For each item in order:
     - Increments product current_stock by ordered quantity
     - Inserts record into inventory_history:
         change_type: 'STOCK_IN',
         quantity_change: +quantity,
         source: 'MANUAL',
         reason: 'Restock Order RS-XXXX received'
     - Re-evaluates product stock_status (transitions back to NORMAL)
     - Resolves any active alerts for this product
```
