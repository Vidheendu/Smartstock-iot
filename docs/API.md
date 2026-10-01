# SmartStock — REST API Documentation

**Base URL:** `http://localhost:5000/api`  
**Authentication Scheme:** `Authorization: Bearer <JWT_TOKEN>`  
**Response Format:** `application/json`  

---

## 1. Authentication Endpoints

### 1.1 Register New User
* **Method:** `POST`
* **Path:** `/auth/register`
* **Purpose:** Register a new store manager or staff user.
* **Authentication:** Public
* **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "fullName": "Jane Doe",
    "role": "STAFF"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "user": {
      "id": "e0000000-0000-0000-0000-000000000003",
      "email": "user@example.com",
      "name": "Jane Doe",
      "role": "STAFF"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
  }
  ```

### 1.2 User Login
* **Method:** `POST`
* **Path:** `/auth/login`
* **Purpose:** Authenticate credentials and receive a JWT.
* **Authentication:** Public (Rate-limited)
* **Request Body:**
  ```json
  {
    "email": "manager@smartstock.com",
    "password": "password123"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "id": "e0000000-0000-0000-0000-000000000001",
      "name": "Alex Morgan",
      "email": "manager@smartstock.com",
      "role": "MANAGER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
  }
  ```

### 1.3 User Logout
* **Method:** `POST`
* **Path:** `/auth/logout`
* **Purpose:** Invalidate client-side session / clear cookies.
* **Authentication:** Public / Authenticated
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

### 1.4 Get Current Profile
* **Method:** `GET`
* **Path:** `/auth/me`
* **Purpose:** Retrieve details of currently authenticated user.
* **Authentication:** Required (Bearer Token)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "id": "e0000000-0000-0000-0000-000000000001",
      "name": "Alex Morgan",
      "email": "manager@smartstock.com",
      "role": "MANAGER",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  }
  ```

### 1.5 Update Profile
* **Method:** `PUT`
* **Path:** `/auth/profile`
* **Purpose:** Update full name of currently authenticated user.
* **Authentication:** Required
* **Request Body:**
  ```json
  {
    "name": "Alex Morgan-Smith"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "id": "e0000000-0000-0000-0000-000000000001",
      "name": "Alex Morgan-Smith",
      "email": "manager@smartstock.com",
      "role": "MANAGER"
    }
  }
  ```

### 1.6 Change Password
* **Method:** `PUT`
* **Path:** `/auth/change-password`
* **Purpose:** Securely update user password with current password verification.
* **Authentication:** Required (Rate-limited)
* **Request Body:**
  ```json
  {
    "currentPassword": "password123",
    "newPassword": "newpassword456",
    "confirmPassword": "newpassword456"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Password changed successfully"
  }
  ```

---

## 2. Health & Dashboard Endpoints

### 2.1 API Health Check
* **Method:** `GET`
* **Path:** `/health`
* **Purpose:** Verify server runtime and API availability.
* **Authentication:** Public
* **Response (200 OK):**
  ```json
  {
    "status": "ok",
    "message": "SmartStock API is running"
  }
  ```

### 2.2 Dashboard KPI Statistics
* **Method:** `GET`
* **Path:** `/dashboard/stats`
* **Purpose:** Aggregated metrics for total products, low stock, critical, and out of stock.
* **Authentication:** Required (MANAGER, STAFF)
* **Response (200 OK):**
  ```json
  {
    "totalProducts": 10,
    "normalStock": 4,
    "lowStock": 2,
    "criticalStock": 3,
    "outOfStock": 1,
    "totalInventoryUnits": 245
  }
  ```

---

## 3. Product Catalog Endpoints

### 3.1 List Products
* **Method:** `GET`
* **Path:** `/products`
* **Query Parameters:** `search`, `category`, `stockStatus`, `supplierId`, `page`, `limit`
* **Authentication:** Required
* **Response (200 OK):**
  ```json
  {
    "products": [
      {
        "id": "b0000000-0000-0000-0000-000000000001",
        "sku": "SKU-MILK-001",
        "name": "Milk",
        "category": "Dairy",
        "currentStock": 45,
        "minimumStock": 20,
        "unit": "bottles",
        "unitPrice": 3.49,
        "stockStatus": "NORMAL",
        "supplierId": "a0000000-0000-0000-0000-000000000001",
        "supplierName": "Fresh Dairy & Bakery Ltd"
      }
    ],
    "pagination": { "page": 1, "limit": 50, "total": 10 }
  }
  ```

### 3.2 Get Consolidated Product Details
* **Method:** `GET`
* **Path:** `/products/:id/details`
* **Purpose:** Returns complete 360-degree product information (catalog, supplier, IoT device, recent history, active alerts, forecast).
* **Authentication:** Required
* **Response (200 OK):**
  ```json
  {
    "product": { "id": "...", "name": "Milk", "currentStock": 45 },
    "supplier": { "id": "...", "name": "Fresh Dairy & Bakery Ltd" },
    "device": { "id": "...", "deviceCode": "SIM-IOT-SCALE-01" },
    "forecast": { "adc": 2.5, "daysRemaining": 18.0 },
    "activeAlerts": [],
    "recentHistory": []
  }
  ```

### 3.3 Create Product
* **Method:** `POST`
* **Path:** `/products`
* **Purpose:** Add new product to catalog.
* **Role Requirement:** `MANAGER` (Staff receives 403 Forbidden)
* **Request Body:**
  ```json
  {
    "sku": "SKU-ORNG-011",
    "name": "Orange Juice",
    "category": "Beverages",
    "currentStock": 50,
    "minimumStock": 20,
    "unit": "bottles",
    "unitPrice": 4.25,
    "supplierId": "a0000000-0000-0000-0000-000000000003"
  }
  ```

### 3.4 Update Product
* **Method:** `PUT`
* **Path:** `/products/:id`
* **Role Requirement:** `MANAGER`
* **Request Body:** Fields to modify (`name`, `category`, `minimumStock`, `unitPrice`, etc.)

### 3.5 Delete Product
* **Method:** `DELETE`
* **Path:** `/products/:id`
* **Role Requirement:** `MANAGER`
* **Purpose:** Soft deletes/deactivates the product.

---

## 4. Inventory Endpoints

### 4.1 Get Inventory List
* **Method:** `GET`
* **Path:** `/inventory`
* **Purpose:** Overview of all stock counts and deficit statuses.
* **Authentication:** Required

### 4.2 Get Inventory Audit History
* **Method:** `GET`
* **Path:** `/inventory/history`
* **Query Parameters:** `productId`, `changeType`, `source`, `startDate`, `endDate`, `page`, `limit`
* **Authentication:** Required
* **Response (200 OK):**
  ```json
  {
    "history": [
      {
        "id": "...",
        "productName": "Milk",
        "changeType": "STOCK_IN",
        "quantityChange": 50,
        "previousStock": 15,
        "newStock": 65,
        "reason": "Restock Order RS-0001 received",
        "source": "MANUAL",
        "createdAt": "2026-02-15T12:00:00Z"
      }
    ]
  }
  ```

### 4.3 Manual Stock In
* **Method:** `POST`
* **Path:** `/inventory/stock-in`
* **Purpose:** Record received stock manually.
* **Request Body:** `{ "productId": "...", "quantity": 20, "reason": "Vendor delivery" }`

### 4.4 Manual Stock Out
* **Method:** `POST`
* **Path:** `/inventory/stock-out`
* **Purpose:** Record stock consumption or sale.
* **Request Body:** `{ "productId": "...", "quantity": 5, "reason": "Customer sale" }`

### 4.5 Inventory Physical Adjustment
* **Method:** `POST`
* **Path:** `/inventory/adjust`
* **Purpose:** Reconcile inventory to match a physical count.
* **Role Requirement:** `MANAGER` (Staff receives 403 Forbidden)
* **Request Body:** `{ "productId": "...", "actualStock": 42, "reason": "Physical count audit" }`

---

## 5. Simulated IoT Telemetry Endpoints

### 5.1 List Simulated Devices
* **Method:** `GET`
* **Path:** `/iot/devices` (alias: `/simulation/devices`)
* **Purpose:** Retrieve all simulated smart shelf devices.
* **Authentication:** Required

### 5.2 Dispatch Simulated Telemetry
* **Method:** `POST`
* **Path:** `/iot/simulate` (aliases: `/simulation/simulate`, `/iot/telemetry`)
* **Purpose:** Ingest software-simulated sensor readings, update stock, and trigger alert evaluations.
* **Request Body:**
  ```json
  {
    "deviceId": "c0000000-0000-0000-0000-000000000001",
    "calculatedUnits": 15,
    "rawReading": 15000.0,
    "batteryLevel": 98
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "reading": {
      "deviceId": "c0000000-0000-0000-0000-000000000001",
      "calculatedUnits": 15,
      "batteryLevel": 98,
      "recordedAt": "2026-02-15T14:30:00Z"
    },
    "stockStatus": "LOW",
    "alertTriggered": true
  }
  ```

---

## 6. Alert Engine Endpoints

### 6.1 List Alerts
* **Method:** `GET`
* **Path:** `/alerts`
* **Query Parameters:** `status` (`ACTIVE`, `ACKNOWLEDGED`, `RESOLVED`), `severity`, `productId`
* **Authentication:** Required

### 6.2 Get Alert Summary Counters
* **Method:** `GET`
* **Path:** `/alerts/summary`
* **Response (200 OK):**
  ```json
  {
    "active": 6,
    "low": 2,
    "critical": 3,
    "outOfStock": 1
  }
  ```

### 6.3 Acknowledge Alert
* **Method:** `PATCH`
* **Path:** `/alerts/:id/acknowledge`
* **Purpose:** Staff acknowledges active alert without resolving it.

### 6.4 Resolve Alert
* **Method:** `PATCH`
* **Path:** `/alerts/:id/resolve`
* **Purpose:** Manually resolve alert.

---

## 7. Notification Endpoints

### 7.1 List User Notifications
* **Method:** `GET`
* **Path:** `/notifications`
* **Query Parameters:** `unreadOnly=true|false`, `page`, `limit`

### 7.2 Get Unread Notification Count
* **Method:** `GET`
* **Path:** `/notifications/unread-count`
* **Response (200 OK):**
  ```json
  {
    "unreadCount": 3
  }
  ```

### 7.3 Mark All Notifications as Read
* **Method:** `PATCH`
* **Path:** `/notifications/read-all`

### 7.4 Mark Single Notification Read/Unread
* **Method:** `PATCH`
* **Path:** `/notifications/:id/read` and `/notifications/:id/unread`

### 7.5 Delete Notification
* **Method:** `DELETE`
* **Path:** `/notifications/:id`

---

## 8. Analytics Endpoints

### 8.1 Analytics Overview
* **Method:** `GET`
* **Path:** `/analytics/overview`
* **Purpose:** Overall KPIs, stock distribution, and alert counts.

### 8.2 Inventory Movement Trends
* **Method:** `GET`
* **Path:** `/analytics/inventory-movement`
* **Query Parameters:** `range` (`7d`, `30d`, `90d`, `today`)
* **Purpose:** Time-series comparison of STOCK_IN vs STOCK_OUT.

### 8.3 Category Breakdown
* **Method:** `GET`
* **Path:** `/analytics/categories`

### 8.4 Alert Analytics
* **Method:** `GET`
* **Path:** `/analytics/alerts`

### 8.5 IoT Device Analytics
* **Method:** `GET`
* **Path:** `/analytics/iot`

---

## 9. Demand Forecasting Endpoints

### 9.1 Forecast Overview
* **Method:** `GET`
* **Path:** `/forecast/overview`
* **Query Parameters:** `period` (`7`, `30`, `90`)
* **Response (200 OK):**
  ```json
  {
    "period": 30,
    "forecasts": [
      {
        "productId": "b0000000-0000-0000-0000-000000000001",
        "productName": "Milk",
        "currentStock": 45,
        "adc": 2.5,
        "daysRemaining": 18.0,
        "depletionDate": "2026-03-05T00:00:00Z"
      }
    ]
  }
  ```

### 9.2 Product Specific Forecast
* **Method:** `GET`
* **Path:** `/forecast/products/:productId`

### 9.3 Product Consumption Timeline
* **Method:** `GET`
* **Path:** `/forecast/products/:productId/consumption`

---

## 10. Restocking & Purchase Order Endpoints

### 10.1 List Restock Orders
* **Method:** `GET`
* **Path:** `/restock`
* **Query Parameters:** `status` (`PENDING`, `ORDERED`, `RECEIVED`, `CANCELLED`), `supplierId`

### 10.2 Products Needing Restock
* **Method:** `GET`
* **Path:** `/restock/needing-restock`
* **Purpose:** Automatically lists products with stock <= minimum_stock along with suggested order quantities.

### 10.3 Create Restock Order
* **Method:** `POST`
* **Path:** `/restock`
* **Role Requirement:** `MANAGER`
* **Request Body:**
  ```json
  {
    "supplierId": "a0000000-0000-0000-0000-000000000001",
    "notes": "Emergency milk reorder",
    "items": [
      {
        "productId": "b0000000-0000-0000-0000-000000000001",
        "quantity": 50,
        "unitPrice": 3.49
      }
    ]
  }
  ```

### 10.4 Mark Restock Order as Ordered
* **Method:** `PATCH`
* **Path:** `/restock/:id/order`
* **Role Requirement:** `MANAGER`

### 10.5 Receive Restock Order (Increases Inventory)
* **Method:** `PATCH`
* **Path:** `/restock/:id/receive`
* **Role Requirement:** `MANAGER`
* **Purpose:** Marks order as RECEIVED, automatically increments product current_stock, creates `STOCK_IN` inventory history records, and re-evaluates alerts.

### 10.6 Cancel Restock Order
* **Method:** `PATCH`
* **Path:** `/restock/:id/cancel`
* **Role Requirement:** `MANAGER`

---

## 11. Supplier Management Endpoints

### 11.1 List Suppliers
* **Method:** `GET`
* **Path:** `/suppliers`
* **Query Parameters:** `activeOnly=true|false`, `search`

### 11.2 Get Supplier Details
* **Method:** `GET`
* **Path:** `/suppliers/:id`

### 11.3 Create Supplier
* **Method:** `POST`
* **Path:** `/suppliers`
* **Role Requirement:** `MANAGER`

### 11.4 Update Supplier
* **Method:** `PUT`
* **Path:** `/suppliers/:id`
* **Role Requirement:** `MANAGER`

### 11.5 Toggle Supplier Status
* **Method:** `PATCH`
* **Path:** `/suppliers/:id/status`
* **Role Requirement:** `MANAGER`

---

## 12. Settings & Preferences Endpoints

### 12.1 Get User Preferences
* **Method:** `GET`
* **Path:** `/settings/preferences`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "preferences": {
      "low_stock_enabled": true,
      "critical_stock_enabled": true,
      "out_of_stock_enabled": true,
      "system_notifications_enabled": true
    }
  }
  ```

### 12.2 Update User Preferences
* **Method:** `PUT`
* **Path:** `/settings/preferences`
* **Request Body:**
  ```json
  {
    "low_stock_enabled": true,
    "critical_stock_enabled": true,
    "out_of_stock_enabled": true,
    "system_notifications_enabled": false
  }
  ```
