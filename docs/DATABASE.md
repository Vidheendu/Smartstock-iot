# SmartStock — Database Schema & Data Dictionary

**Database Engine:** PostgreSQL (Supabase)  
**Schema File:** [`server/database/schema.sql`](file:///c:/Users/vidhe/Documents/smartstock-iot/server/database/schema.sql)  
**Seed File:** [`server/database/seeds.sql`](file:///c:/Users/vidhe/Documents/smartstock-iot/server/database/seeds.sql)  

---

## 1. Entity-Relationship Overview

```text
       +-----------------------+
       |       suppliers       |
       +-----------------------+
                   |
         1-to-N    |    1-to-N
         +---------+---------+
         |                   |
         v                   v
+-----------------+  +------------------+
|    products     |  |  restock_orders  |
+-----------------+  +------------------+
   |     |    |              |
   |     |    +----------+   | 1-to-N
   |     |               |   v
   |     |        +---------------------+
   |     |        | restock_order_items |
   |     |        +---------------------+
   |     |
   |     +-------------------------+
   |                               |
   v 1-to-N                        v 1-to-N
+--------------------+   +-------------------+
| simulated_devices  |   | inventory_history |
+--------------------+   +-------------------+
   |                               ^
   v 1-to-N                        |
+--------------------+             |
|  sensor_readings   |             |
+--------------------+             |
                                   |
+--------------------+             |
|       alerts       |-------------+
+--------------------+
   |
   v 1-to-N
+--------------------+   +-------------------+
|   notifications    |   | user_preferences  |
+--------------------+   +-------------------+
   ^                               ^
   |                               |
   +---------------+---------------+
                   |
           +---------------+
           |     users     |
           +---------------+
```

---

## 2. Table Specifications

### 2.1 `users`
Stores system user profiles, role assignments, and encrypted credentials.
* **`id`** (`UUID`, PK, `DEFAULT gen_random_uuid()`): Unique identifier.
* **`email`** (`VARCHAR(255)`, UNIQUE, NOT NULL): User email address used for login.
* **`password_hash`** (`VARCHAR(255)`, NOT NULL): 10-round bcrypt password hash.
* **`full_name`** (`VARCHAR(100)`, NOT NULL): Display name of user.
* **`role`** (`VARCHAR(20)`, NOT NULL, `DEFAULT 'STAFF'`, `CHECK IN ('MANAGER', 'STAFF')`): Access role.
* **`created_at`** (`TIMESTAMPTZ`, `DEFAULT NOW()`): Record creation timestamp.
* **`updated_at`** (`TIMESTAMPTZ`, `DEFAULT NOW()`): Last update timestamp.

---

### 2.2 `suppliers`
Stores vendor contact details, fulfillment addresses, and expected lead times.
* **`id`** (`UUID`, PK, `DEFAULT gen_random_uuid()`): Unique identifier.
* **`name`** (`VARCHAR(150)`, NOT NULL): Company/vendor name.
* **`contact_name`** (`VARCHAR(100)`): Primary contact representative.
* **`email`** (`VARCHAR(255)`): Orders/support email.
* **`phone`** (`VARCHAR(50)`): Contact phone number.
* **`address`**, **`city`**, **`state`**, **`country`**, **`postal_code`**: Physical vendor address.
* **`lead_time_days`** (`INTEGER`, `DEFAULT 3`, `CHECK >= 0`): Days required from purchase order to delivery.
* **`is_active`** (`BOOLEAN`, `DEFAULT TRUE`): Active vendor status toggle.

---

### 2.3 `products`
Core product catalog definitions, live stock counts, and threshold configurations.
* **`id`** (`UUID`, PK, `DEFAULT gen_random_uuid()`): Unique identifier.
* **`sku`** (`VARCHAR(50)`, UNIQUE, NOT NULL): Stock keeping unit barcode code.
* **`name`** (`VARCHAR(150)`, NOT NULL): Product display title.
* **`category`** (`VARCHAR(100)`, NOT NULL): Product category (e.g., Dairy, Bakery, Staples).
* **`description`** (`TEXT`): Product overview.
* **`current_stock`** (`INTEGER`, NOT NULL, `DEFAULT 0`, `CHECK >= 0`): Real-time on-hand stock count.
* **`minimum_stock`** (`INTEGER`, NOT NULL, `DEFAULT 10`, `CHECK >= 0`): Reorder alert threshold.
* **`unit`** (`VARCHAR(30)`, `DEFAULT 'units'`): Measurement unit (e.g., bottles, loaves, bags).
* **`unit_price`** (`NUMERIC(10,2)`, `DEFAULT 0.00`, `CHECK >= 0`): Unit retail/cost value.
* **`supplier_id`** (`UUID`, FK `REFERENCES suppliers(id) ON DELETE SET NULL`): Assigned vendor.
* **`stock_status`** (`VARCHAR(20)`, `DEFAULT 'NORMAL'`, `CHECK IN ('NORMAL', 'LOW', 'CRITICAL', 'OUT_OF_STOCK')`): Evaluated stock health state.
* **`is_active`** (`BOOLEAN`, `DEFAULT TRUE`): Soft-delete active status.

---

### 2.4 `simulated_devices`
Definitions for software-simulated edge IoT shelf devices.
* **`id`** (`UUID`, PK, `DEFAULT gen_random_uuid()`): Unique identifier.
* **`device_code`** (`VARCHAR(50)`, UNIQUE, NOT NULL): Device code (e.g., `SIM-IOT-SCALE-01`).
* **`device_name`** (`VARCHAR(100)`, NOT NULL): Human-readable device label.
* **`device_type`** (`VARCHAR(50)`, NOT NULL): Sensor model (`WEIGHT_SENSOR`, `OPTICAL_LEVEL`, `RFID_SCANNER`).
* **`location`** (`VARCHAR(100)`): Shelf or aisle location.
* **`product_id`** (`UUID`, FK `REFERENCES products(id) ON DELETE SET NULL`): Associated product.
* **`status`** (`VARCHAR(30)`, `DEFAULT 'ACTIVE'`, `CHECK IN ('ACTIVE', 'IDLE', 'OFFLINE')`): Operating status.
* **`unit_weight_grams`** (`NUMERIC(10,2)`, `DEFAULT 100.00`): Unit tare weight for load cell calculations.
* **`last_ping_at`** (`TIMESTAMPTZ`): Last received telemetry timestamp.

---

### 2.5 `sensor_readings`
Time-series log of software-simulated IoT telemetry.
* **`id`** (`UUID`, PK, `DEFAULT gen_random_uuid()`): Unique identifier.
* **`device_id`** (`UUID`, FK `REFERENCES simulated_devices(id) ON DELETE CASCADE`): Dispatched device.
* **`product_id`** (`UUID`, FK `REFERENCES products(id) ON DELETE CASCADE`): Target product.
* **`raw_reading`** (`NUMERIC(12,2)`, NOT NULL): Raw sensor value (e.g., grams or sensor voltage).
* **`calculated_units`** (`INTEGER`, NOT NULL, `CHECK >= 0`): Derived inventory unit count.
* **`simulated_delta`** (`INTEGER`, NOT NULL, `DEFAULT 0`): Net unit difference from prior reading.
* **`battery_level`** (`INTEGER`, `CHECK 0 <= battery_level <= 100`): Remaining device battery %.
* **`recorded_at`** (`TIMESTAMPTZ`, `DEFAULT NOW()`): Telemetry transmission timestamp.

---

### 2.6 `inventory_history`
Immutable ledger of all stock movement events (manual and IoT).
* **`id`** (`UUID`, PK, `DEFAULT gen_random_uuid()`): Unique identifier.
* **`product_id`** (`UUID`, FK `REFERENCES products(id) ON DELETE CASCADE`): Target product.
* **`user_id`** (`UUID`, FK `REFERENCES users(id) ON DELETE SET NULL`): User initiating the change.
* **`change_type`** (`VARCHAR(30)`, NOT NULL, `CHECK IN ('STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT')`): Movement direction.
* **`quantity_change`** (`INTEGER`, NOT NULL): Positive or negative unit quantity.
* **`previous_stock`** (`INTEGER`, NOT NULL, `CHECK >= 0`): Stock level before transaction.
* **`new_stock`** (`INTEGER`, NOT NULL, `CHECK >= 0`): Stock level after transaction.
* **`reason`** (`VARCHAR(255)`, NOT NULL): Audit rationale (e.g., `Restock received`, `SIMULATED_CONSUMPTION`).
* **`source`** (`VARCHAR(30)`, NOT NULL, `DEFAULT 'MANUAL'`, `CHECK IN ('MANUAL', 'IOT')`): Trigger source.
* **`reference_id`** (`UUID`): Optional related ID (e.g., restock order ID).
* **`created_at`** (`TIMESTAMPTZ`, `DEFAULT NOW()`): Ledger entry timestamp.

---

### 2.7 `alerts`
Exception records generated when products enter deficit stock conditions.
* **`id`** (`UUID`, PK, `DEFAULT gen_random_uuid()`): Unique identifier.
* **`product_id`** (`UUID`, FK `REFERENCES products(id) ON DELETE CASCADE`): Associated product.
* **`alert_type`** (`VARCHAR(30)`, NOT NULL, `CHECK IN ('LOW_STOCK', 'CRITICAL_STOCK', 'OUT_OF_STOCK')`): Category.
* **`severity`** (`VARCHAR(30)`, NOT NULL, `CHECK IN ('LOW', 'CRITICAL', 'OUT_OF_STOCK')`): Priority level.
* **`message`** (`TEXT`, NOT NULL): Human-readable alert summary.
* **`current_stock`** (`INTEGER`, NOT NULL): Stock count at alert generation.
* **`minimum_stock`** (`INTEGER`, NOT NULL): Threshold at alert generation.
* **`source`** (`VARCHAR(30)`, `DEFAULT 'SYSTEM'`, `CHECK IN ('MANUAL', 'IOT', 'SYSTEM')`): Trigger source.
* **`status`** (`VARCHAR(30)`, `DEFAULT 'ACTIVE'`, `CHECK IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED')`): Lifecycle state.
* **`acknowledged_by`** (`UUID`, FK `REFERENCES users(id)`): Staff user acknowledging alert.
* **`acknowledged_at`** (`TIMESTAMPTZ`): Acknowledged timestamp.
* **`resolved_at`** (`TIMESTAMPTZ`): Resolution timestamp.

---

### 2.8 `notifications`
User-facing alerts dispatched to store staff inboxes.
* **`id`** (`UUID`, PK, `DEFAULT gen_random_uuid()`): Unique identifier.
* **`user_id`** (`UUID`, FK `REFERENCES users(id) ON DELETE CASCADE`): Recipient user.
* **`alert_id`** (`UUID`, FK `REFERENCES alerts(id) ON DELETE SET NULL`): Linked alert record.
* **`product_id`** (`UUID`, FK `REFERENCES products(id) ON DELETE SET NULL`): Associated product.
* **`title`** (`VARCHAR(150)`, NOT NULL): Short notification headline.
* **`message`** (`TEXT`, NOT NULL): Notification descriptive body.
* **`type`** (`VARCHAR(50)`, `DEFAULT 'SYSTEM'`, `CHECK IN ('LOW_STOCK', 'CRITICAL_STOCK', 'OUT_OF_STOCK', 'SYSTEM')`).
* **`is_read`** (`BOOLEAN`, `DEFAULT FALSE`): Read status indicator.
* **`read_at`** (`TIMESTAMPTZ`): Timestamp when user read the message.

---

### 2.9 `restock_orders`
Purchase orders sent to suppliers for inventory replenishment.
* **`id`** (`UUID`, PK, `DEFAULT gen_random_uuid()`): Unique identifier.
* **`order_number`** (`VARCHAR(50)`, UNIQUE, NOT NULL): Business reference (e.g. `RS-0001`).
* **`supplier_id`** (`UUID`, FK `REFERENCES suppliers(id) ON DELETE RESTRICT`): Target vendor.
* **`status`** (`VARCHAR(30)`, `DEFAULT 'PENDING'`, `CHECK IN ('DRAFT', 'PENDING', 'ORDERED', 'RECEIVED', 'CANCELLED')`).
* **`notes`** (`TEXT`): Order justification or delivery instructions.
* **`total_items`** (`INTEGER`, `DEFAULT 0`, `CHECK >= 0`): Total distinct SKU items ordered.
* **`total_amount`** (`NUMERIC(10,2)`, `DEFAULT 0.00`, `CHECK >= 0`): Combined order purchase cost.
* **`created_by`** (`UUID`, FK `REFERENCES users(id) ON DELETE SET NULL`): Manager creating order.
* **`ordered_at`** (`TIMESTAMPTZ`): Timestamp when marked ORDERED.
* **`received_at`** (`TIMESTAMPTZ`): Timestamp when received and stocked.

---

### 2.10 `restock_order_items`
Individual product line items within a restock purchase order.
* **`id`** (`UUID`, PK, `DEFAULT gen_random_uuid()`): Unique identifier.
* **`restock_order_id`** (`UUID`, FK `REFERENCES restock_orders(id) ON DELETE CASCADE`): Parent purchase order.
* **`product_id`** (`UUID`, FK `REFERENCES products(id) ON DELETE RESTRICT`): Product being replenished.
* **`quantity`** (`INTEGER`, NOT NULL, `CHECK > 0`): Unit count ordered.
* **`unit_price`** (`NUMERIC(10,2)`, NOT NULL, `CHECK >= 0`): Agreed unit price.
* **`total_price`** (`NUMERIC(10,2)`, NOT NULL, `CHECK >= 0`): `quantity * unit_price`.

---

### 2.11 `user_preferences`
Personalized notification filter preferences for each user.
* **`id`** (`UUID`, PK, `DEFAULT gen_random_uuid()`): Unique identifier.
* **`user_id`** (`UUID`, UNIQUE, FK `REFERENCES users(id) ON DELETE CASCADE`): Target user.
* **`low_stock_enabled`** (`BOOLEAN`, `DEFAULT TRUE`): Toggle for low stock notifications.
* **`critical_stock_enabled`** (`BOOLEAN`, `DEFAULT TRUE`): Toggle for critical stock notifications.
* **`out_of_stock_enabled`** (`BOOLEAN`, `DEFAULT TRUE`): Toggle for out of stock notifications.
* **`system_notifications_enabled`** (`BOOLEAN`, `DEFAULT TRUE`): Toggle for general system messages.
