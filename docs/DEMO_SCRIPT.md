# SmartStock — Final Presentation Demo Script

**Project:** SmartStock — IoT-Based Store Stock Alert System  
**Format:** Presenter Script (5–10 Minutes)  
**Target Audience:** Evaluators, Professors, Hackathon Judges  

> **Key Rule for Presenters:**  
> Remind the audience at the start: *"SmartStock monitors inventory using software-simulated IoT devices. Telemetry is generated and transmitted via REST API to demonstrate the end-to-end autonomous stock monitoring, alert evaluation, and restock workflow without requiring physical microcontrollers or sensors."*

---

## Demo Credentials

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Manager** | `manager@smartstock.com` | `password123` | Full access: catalogs, restock approvals, stock adjustments |
| **Staff** | `staff@smartstock.com` | `password123` | Operational access: stock in/out, telemetry dispatch, alert acknowledge |

---

## 11-Step Demonstration Walkthrough

### Step 1 — Login & Role-Based Authentication
* **WHAT TO CLICK:**  
  1. Open browser to `http://localhost:5173/login`.  
  2. Click **"Demo Manager"** quick-fill button (or enter `manager@smartstock.com` / `password123`).  
  3. Click **"Sign In"**.
* **WHAT TO SHOW:**  
  * Successful authentication redirect to `/dashboard`.  
  * Top navigation bar showing current user: *"Alex Morgan"* with a **MANAGER** badge.  
  * Notification bell icon showing current unread count badge.
* **WHAT TO EXPLAIN:**  
  *"SmartStock utilizes stateless JSON Web Token (JWT) authentication with bcrypt password hashing. The system enforces strict Role-Based Access Control (RBAC) separating administrative Managers from operational Staff members."*

---

### Step 2 — Dashboard Executive Overview
* **WHAT TO CLICK:**  
  * Stay on `/dashboard`. Scroll down to view summary cards, stock status donut chart, and recent activity.
* **WHAT TO SHOW:**  
  * Key KPI Metric Cards: **Total Products**, **Total Stock**, **Low Stock**, **Critical Stock**, and **Out of Stock**.  
  * Stock status breakdown showing real counts computed directly from the PostgreSQL database.  
  * Active alerts list and quick-action buttons.
* **WHAT TO EXPLAIN:**  
  *"The Dashboard provides instant operational visibility. All statistics are calculated live from real database records—no mock numbers. Notice products categorized into NORMAL, LOW, CRITICAL, and OUT OF STOCK."*

---

### Step 3 — Simulated IoT Monitor & Telemetry Ingestion
* **WHAT TO CLICK:**  
  1. Click **"IoT Monitor"** in the sidebar (`/iot`).  
  2. Select the **"Smart Shelf Load Cell #1"** (assigned to product **Milk**).  
  3. In the Simulation Panel, enter a new simulated unit quantity of **15** (dropping from 45 or 50).  
  4. Click **"Simulate Stock Change"** / **"Send Telemetry"**.
* **WHAT TO SHOW:**  
  * Success toast notification: *"Telemetry received and processed successfully"*.  
  * Telemetry log updating with raw reading (e.g. 15,000 g), calculated units (15), battery level (98%), and timestamp.  
  * Device status indicators (ACTIVE, battery health, last ping timestamp).
* **WHAT TO EXPLAIN:**  
  *"Here is our software-simulated IoT layer. In retail stores, smart shelves use weight sensors or RFID readers to detect stock changes. Our simulation engine sends sensor telemetry to the backend `/api/iot/simulate` endpoint. The backend validates the payload, updates inventory, recalculates stock status, and checks alert thresholds."*

---

### Step 4 — Inventory Reflection & Audit Trail
* **WHAT TO CLICK:**  
  1. Click **"Inventory"** in the sidebar (`/inventory`).  
  2. Locate **"Milk"**.  
  3. Click **"History"** (`/inventory/history`) or the history tab for Milk.
* **WHAT TO SHOW:**  
  * Milk current stock is now **15** units (minimum stock is 20).  
  * Stock status badge changed from `NORMAL` to **`LOW`** (yellow badge).  
  * In Inventory History, a new entry shows: Change `-30` (or delta from previous), Source: **`IOT`**, Reason: **`SIMULATED_CONSUMPTION`** with the exact timestamp.
* **WHAT TO EXPLAIN:**  
  *"Notice how the IoT telemetry immediately updated the stock and created an immutable audit entry in `inventory_history` with source `IOT`. Every single stock change has full traceability."*

---

### Step 5 — Automated Alert Generation
* **WHAT TO CLICK:**  
  1. Click **"Alerts"** in the sidebar (`/alerts`).  
  2. Click on the newly triggered alert for **Milk**.
* **WHAT TO SHOW:**  
  * An active alert: Type **`LOW_STOCK`**, Severity **`LOW`**, Status **`ACTIVE`**.  
  * Alert Message: *"Milk stock is low. Current stock is 15 bottles and minimum stock is 20 bottles."*  
  * Click **"Acknowledge"** button. The status transitions to **`ACKNOWLEDGED`** with an acknowledged timestamp and user name.
* **WHAT TO EXPLAIN:**  
  *"When stock dropped to 15, the Alert Engine evaluated threshold rules: stock <= minimum (20) and > 50% (10), classifying it as LOW_STOCK. The system features built-in de-duplication to prevent spamming duplicate alerts for the same condition."*

---

### Step 6 — Notification Center & Real-Time Awareness
* **WHAT TO CLICK:**  
  1. Click the **Notification Bell** in the topbar or **"Notifications"** in sidebar (`/notifications`).  
  2. Find the notification: *"Low Stock Alert — Milk stock is low"*.  
  3. Click the notification or click **"Mark as Read"**.
* **WHAT TO SHOW:**  
  * Notification card transitioning from unread (blue accent dot) to read.  
  * Topbar notification badge count decrementing in real time.  
  * Notification links directly to the corresponding Alert Details view.
* **WHAT TO EXPLAIN:**  
  *"Alerts automatically dispatch user notifications respecting individual user preference toggles configured in Settings. Staff members are immediately aware of stock depletion without manual warehouse audits."*

---

### Step 7 — Demand Forecasting & Depletion Prediction
* **WHAT TO CLICK:**  
  1. Click **"Forecast"** in sidebar (`/forecast`).  
  2. Locate **"Milk"** in the forecast table.
* **WHAT TO SHOW:**  
  * **Average Daily Consumption (ADC):** Computed as `Total Consumed / Observation Days`.  
  * **Estimated Days Remaining:** `Current Stock / ADC`.  
  * **Projected Depletion Date:** Exact estimated calendar date when stock reaches 0.  
  * Urgency badge (e.g. *Warning: Depletion in under 7 days*).
* **WHAT TO EXPLAIN:**  
  *"Forecasting is mathematically calculated from genuine historical `STOCK_OUT` transactions—no mock or random data. If consumption data is limited, the system safely indicates insufficient history rather than generating false predictions."*

---

### Step 8 — Restocking Workflow: Create Purchase Order
* **WHAT TO CLICK:**  
  1. Click **"Restocking"** in sidebar (`/restocking`).  
  2. Click **"+ New Restock Order"**.  
  3. Select Supplier: **"Fresh Dairy & Bakery Ltd"**.  
  4. Add Item: Select **"Milk"**, Quantity **50**, Unit Price **$3.49**.  
  5. Add Notes: *"Routine restock order due to IoT low stock alert"*.  
  6. Click **"Create Order"**.
* **WHAT TO SHOW:**  
  * New restock order created with status **`PENDING`** (or `DRAFT`), unique order number (e.g. `RS-0002`), and calculated total cost ($174.50).  
  * Click **"Mark as Ordered"** to transition status to **`ORDERED`**.
* **WHAT TO EXPLAIN:**  
  *"SmartStock connects suppliers directly to products. Managers can initiate restock purchase orders with automated item pricing, lead time tracking, and order lifecycle states: DRAFT → PENDING → ORDERED → RECEIVED."*

---

### Step 9 — Restock Reception & Automated Stock Replenishment
* **WHAT TO CLICK:**  
  1. On the restock order details, click **"Receive Order"**.  
  2. Confirm the modal dialog: *"Are you sure you want to mark this order as received? Inventory will be updated automatically."*
* **WHAT TO SHOW:**  
  * Restock order status updates to **`RECEIVED`** with a green badge and received timestamp.  
  * Navigate to **"Inventory"** (`/inventory`): Milk current stock has increased from **15** to **65** (+50).  
  * Stock status automatically transitions back from `LOW` to **`NORMAL`**.  
  * The related `LOW_STOCK` alert is automatically resolved.  
  * In **"Inventory History"**, a new entry appears: `STOCK_IN`, Quantity `+50`, Reason: `Restock Order RS-0002 received`.
* **WHAT TO EXPLAIN:**  
  *"This is the full closed-loop automation of SmartStock: Telemetry detects a drop → Alert fires → Notification sent → Restock ordered → Order received → Stock increments → Status resets to NORMAL → Alert resolves. Zero manual spreadsheet tracking."*

---

### Step 10 — Business Analytics & Consumption Visualizations
* **WHAT TO CLICK:**  
  1. Click **"Analytics"** in sidebar (`/analytics`).  
  2. Toggle observation period filter: **"7 Days"**, **"30 Days"**, or **"90 Days"**.
* **WHAT TO SHOW:**  
  * **Stock Movement Trends:** Bar/Area chart comparing Stock In vs Stock Out.  
  * **Category Distribution:** Stock distribution across Dairy, Bakery, Beverages, Staples, Snacks.  
  * **Alert Analytics:** Breakdown of alerts by severity (LOW, CRITICAL, OUT OF STOCK).  
  * **IoT Device Performance:** Telemetry frequency and battery levels across all virtual sensors.
* **WHAT TO EXPLAIN:**  
  *"Analytics provides operational intelligence. Notice how the stock movement chart captures both our simulated consumption and our restock reception. All charts render dynamically using Recharts and update with date filter changes."*

---

### Step 11 — Consolidated Product 360 View
* **WHAT TO CLICK:**  
  1. Click **"Products"** in sidebar (`/products`).  
  2. Click on **"Milk"** (or click the Eye icon) to open `/products/:id`.
* **WHAT TO SHOW:**  
  * The comprehensive Product 360 view uniting all modules:  
    * Basic Details & SKU (`SKU-MILK-001`, Category, Unit Price)  
    * Assigned Supplier (*Fresh Dairy & Bakery Ltd*)  
    * Connected Simulated IoT Device (*Smart Shelf Load Cell #1*)  
    * Live Stock Level & Status Gauge  
    * Demand Forecast & Days Remaining  
    * Recent Audit History & Restock History for this specific product  
* **WHAT TO EXPLAIN:**  
  *"The Product Details view is the single pane of glass for store staff. Instead of switching between multiple screens, everything—supplier info, IoT sensors, inventory logs, alerts, and forecasts—is unified in one responsive interface."*

---

## Live Demo Troubleshooting & Contingency Tips

1. **If backend is not running:**
   ```bash
   cd server
   npm run dev
   ```
   Verify at: `http://localhost:5000/api/health` → responds with `{ status: "ok" }`.

2. **If frontend is not running:**
   ```bash
   cd client
   npm run dev
   ```
   Open browser at: `http://localhost:5173`.

3. **Resetting to Fresh Demo Data:**
   Run the seed script in your Supabase SQL Editor using [`server/database/seeds.sql`](file:///c:/Users/vidhe/Documents/smartstock-iot/server/database/seeds.sql) to restore all 10 products, 3 suppliers, 3 devices, and sample history.
