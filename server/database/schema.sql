-- =============================================================================
-- SMARTSTOCK: PostgreSQL Schema (Supabase)
-- Software-Simulated IoT Store Stock Alert System
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'STAFF' CHECK (role IN ('MANAGER', 'STAFF')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    contact_name VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    lead_time_days INTEGER DEFAULT 3 CHECK (lead_time_days >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    minimum_stock INTEGER NOT NULL DEFAULT 10 CHECK (minimum_stock >= 0),
    unit VARCHAR(30) DEFAULT 'units',
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    stock_status VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (stock_status IN ('NORMAL', 'LOW', 'CRITICAL', 'OUT_OF_STOCK')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(stock_status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- 4. SIMULATED_DEVICES TABLE
CREATE TABLE IF NOT EXISTS simulated_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_code VARCHAR(50) UNIQUE NOT NULL,
    device_name VARCHAR(100) NOT NULL,
    device_type VARCHAR(50) NOT NULL,
    location VARCHAR(100) DEFAULT 'Main Store Shelf',
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'IDLE', 'OFFLINE')),
    unit_weight_grams NUMERIC(10, 2) DEFAULT 100.00 CHECK (unit_weight_grams >= 0),
    last_ping_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_simulated_devices_code ON simulated_devices(device_code);
CREATE INDEX IF NOT EXISTS idx_simulated_devices_product ON simulated_devices(product_id);

-- 5. SENSOR_READINGS TABLE (Time-series simulated telemetry)
CREATE TABLE IF NOT EXISTS sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES simulated_devices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    raw_reading NUMERIC(12, 2) NOT NULL,
    calculated_units INTEGER NOT NULL CHECK (calculated_units >= 0),
    simulated_delta INTEGER NOT NULL DEFAULT 0,
    battery_level INTEGER DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_readings_device_time ON sensor_readings(device_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_readings_product_time ON sensor_readings(product_id, recorded_at DESC);

-- 6. INVENTORY_HISTORY TABLE
CREATE TABLE IF NOT EXISTS inventory_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    change_type VARCHAR(30) NOT NULL DEFAULT 'ADJUSTMENT' CHECK (change_type IN ('STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT')),
    quantity_change INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL CHECK (previous_stock >= 0),
    new_stock INTEGER NOT NULL CHECK (new_stock >= 0),
    reason VARCHAR(255) NOT NULL,
    source VARCHAR(30) NOT NULL DEFAULT 'MANUAL' CHECK (source IN ('MANUAL', 'IOT')),
    reference_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_product_time ON inventory_history(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_user ON inventory_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_type ON inventory_history(change_type);
CREATE INDEX IF NOT EXISTS idx_history_reason ON inventory_history(reason);

-- 7. ALERTS TABLE
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    severity VARCHAR(30) NOT NULL CHECK (severity IN ('LOW', 'CRITICAL', 'OUT_OF_STOCK')),
    message TEXT NOT NULL,
    current_stock INTEGER NOT NULL CHECK (current_stock >= 0),
    minimum_stock INTEGER NOT NULL CHECK (minimum_stock >= 0),
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED')),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_product_status ON alerts(product_id, status);
CREATE INDEX IF NOT EXISTS idx_alerts_status_created ON alerts(status, created_at DESC);

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID REFERENCES alerts(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'STOCK_ALERT',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(is_read, created_at DESC);

-- 9. RESTOCK_ORDERS TABLE
CREATE TABLE IF NOT EXISTS restock_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (unit_cost >= 0),
    total_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_cost >= 0),
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    order_date TIMESTAMPTZ DEFAULT NOW(),
    delivered_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_restock_order_no ON restock_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_restock_status ON restock_orders(status);
CREATE INDEX IF NOT EXISTS idx_restock_product ON restock_orders(product_id);
