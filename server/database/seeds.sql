-- =============================================================================
-- SMARTSTOCK: Seed Data for Testing & Demonstration
-- =============================================================================

-- Clean up existing seed records if needed (in reverse dependency order)
DELETE FROM notifications;
DELETE FROM alerts;
DELETE FROM inventory_history;
DELETE FROM sensor_readings;
DELETE FROM simulated_devices;
DELETE FROM restock_orders;
DELETE FROM products;
DELETE FROM suppliers;
DELETE FROM users;

-- 1. SEED USERS (Role: MANAGER, STAFF)
-- Password for both demo accounts: password123 (hashed with bcrypt 10 rounds)
INSERT INTO users (id, email, password_hash, full_name, role) VALUES
('e0000000-0000-0000-0000-000000000001', 'manager@smartstock.com', '$2b$10$x1VCpBETnXPwknq.4hzx5uRUF6GH.Ozi8imwsUarTThA/vtYOBwV2', 'Alex Morgan', 'MANAGER'),
('e0000000-0000-0000-0000-000000000002', 'staff@smartstock.com', '$2b$10$x1VCpBETnXPwknq.4hzx5uRUF6GH.Ozi8imwsUarTThA/vtYOBwV2', 'Taylor Brooks', 'STAFF');

-- 2. SEED SUPPLIERS (At least 3 suppliers)
INSERT INTO suppliers (id, name, contact_name, email, phone, address, lead_time_days) VALUES
('a0000000-0000-0000-0000-000000000001', 'Fresh Dairy & Bakery Ltd', 'Sarah Jenkins', 'orders@freshdairybakery.com', '+1-555-0192', '104 Meadow Lane, Agro Park, NY', 2),
('a0000000-0000-0000-0000-000000000002', 'Agro Staples & Grains Co', 'Robert Chen', 'sales@agrostaples.com', '+1-555-0144', '88 Grain Terminal Rd, Chicago, IL', 4),
('a0000000-0000-0000-0000-000000000003', 'Apex Beverages & Snacks Inc', 'Maria Rodriguez', 'supply@apexbeverages.com', '+1-555-0188', '500 Commerce Blvd, Atlanta, GA', 3);

-- 3. SEED PRODUCTS (10 products with diverse stock states)
-- NORMAL: Milk, Rice, Coffee, Tea
-- LOW: Bread, Biscuits
-- CRITICAL: Sugar, Cooking Oil, Chips
-- OUT_OF_STOCK: Coca Cola
INSERT INTO products (id, sku, name, category, current_stock, minimum_stock, unit, unit_price, supplier_id, stock_status) VALUES
('b0000000-0000-0000-0000-000000000001', 'SKU-MILK-001', 'Milk', 'Dairy', 45, 20, 'bottles', 3.49, 'a0000000-0000-0000-0000-000000000001', 'NORMAL'),
('b0000000-0000-0000-0000-000000000002', 'SKU-BRED-002', 'Bread', 'Bakery', 18, 30, 'loaves', 2.99, 'a0000000-0000-0000-0000-000000000001', 'LOW'),
('b0000000-0000-0000-0000-000000000003', 'SKU-RICE-003', 'Rice', 'Grains', 65, 50, 'bags (5kg)', 12.99, 'a0000000-0000-0000-0000-000000000002', 'NORMAL'),
('b0000000-0000-0000-0000-000000000004', 'SKU-SUGR-004', 'Sugar', 'Staples', 12, 40, 'bags (1kg)', 2.49, 'a0000000-0000-0000-0000-000000000002', 'CRITICAL'),
('b0000000-0000-0000-0000-000000000005', 'SKU-COKE-005', 'Coca Cola', 'Beverages', 0, 60, 'cans', 1.50, 'a0000000-0000-0000-0000-000000000003', 'OUT_OF_STOCK'),
('b0000000-0000-0000-0000-000000000006', 'SKU-BISC-006', 'Biscuits', 'Snacks', 22, 25, 'packs', 1.89, 'a0000000-0000-0000-0000-000000000003', 'LOW'),
('b0000000-0000-0000-0000-000000000007', 'SKU-COIL-007', 'Cooking Oil', 'Staples', 8, 30, 'bottles (1L)', 7.29, 'a0000000-0000-0000-0000-000000000002', 'CRITICAL'),
('b0000000-0000-0000-0000-000000000008', 'SKU-COFF-008', 'Coffee', 'Beverages', 35, 20, 'jars', 8.99, 'a0000000-0000-0000-0000-000000000003', 'NORMAL'),
('b0000000-0000-0000-0000-000000000009', 'SKU-TEAA-009', 'Tea', 'Beverages', 25, 20, 'boxes', 4.49, 'a0000000-0000-0000-0000-000000000003', 'NORMAL'),
('b0000000-0000-0000-0000-000000000010', 'SKU-CHIP-010', 'Chips', 'Snacks', 15, 40, 'bags', 2.19, 'a0000000-0000-0000-0000-000000000003', 'CRITICAL');

-- 4. SEED SIMULATED IoT DEVICES (At least 3 devices)
INSERT INTO simulated_devices (id, device_code, device_name, device_type, location, product_id, status, unit_weight_grams, last_ping_at) VALUES
('c0000000-0000-0000-0000-000000000001', 'SIM-IOT-SCALE-01', 'Smart Shelf Load Cell #1', 'WEIGHT_SENSOR', 'Aisle 1 - Dairy Fridge', 'b0000000-0000-0000-0000-000000000001', 'ACTIVE', 1000.00, NOW() - INTERVAL '2 minutes'),
('c0000000-0000-0000-0000-000000000002', 'SIM-IOT-OPTIC-02', 'Beverage Chute Optical Counter', 'OPTICAL_LEVEL', 'Aisle 4 - Beverage Cooler', 'b0000000-0000-0000-0000-000000000005', 'ACTIVE', 350.00, NOW() - INTERVAL '5 minutes'),
('c0000000-0000-0000-0000-000000000003', 'SIM-IOT-RFID-03', 'Dry Staples Smart Rack RFID', 'RFID_SCANNER', 'Aisle 2 - Dry Goods Shelf B', 'b0000000-0000-0000-0000-000000000004', 'ACTIVE', 1000.00, NOW() - INTERVAL '1 minute');

-- 5. SEED INITIAL SENSOR READINGS (Simulated Telemetry Samples)
INSERT INTO sensor_readings (device_id, product_id, raw_reading, calculated_units, simulated_delta, battery_level, recorded_at) VALUES
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 45000.00, 45, -2, 98, NOW() - INTERVAL '2 minutes'),
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000005', 0.00, 0, -4, 91, NOW() - INTERVAL '5 minutes'),
('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004', 12000.00, 12, -3, 89, NOW() - INTERVAL '1 minute');

-- 6. SEED INITIAL INVENTORY HISTORY
INSERT INTO inventory_history (product_id, change_quantity, previous_stock, new_stock, reason, created_at) VALUES
('b0000000-0000-0000-0000-000000000001', -2, 47, 45, 'SIMULATED_CONSUMPTION', NOW() - INTERVAL '2 hours'),
('b0000000-0000-0000-0000-000000000002', -5, 23, 18, 'SIMULATED_CONSUMPTION', NOW() - INTERVAL '3 hours'),
('b0000000-0000-0000-0000-000000000004', -8, 20, 12, 'SIMULATED_CONSUMPTION', NOW() - INTERVAL '1 hour'),
('b0000000-0000-0000-0000-000000000005', -10, 10, 0, 'SIMULATED_CONSUMPTION', NOW() - INTERVAL '30 minutes'),
('b0000000-0000-0000-0000-000000000007', -4, 12, 8, 'SIMULATED_CONSUMPTION', NOW() - INTERVAL '4 hours');

-- 7. SEED ALERTS FOR DEFICIT PRODUCTS
INSERT INTO alerts (id, product_id, alert_type, severity, message, current_stock, minimum_stock, source, status, created_at) VALUES
('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'OUT_OF_STOCK', 'OUT_OF_STOCK', 'Coca Cola is out of stock.', 0, 60, 'SYSTEM', 'ACTIVE', NOW() - INTERVAL '30 minutes'),
('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', 'CRITICAL_STOCK', 'CRITICAL', 'Sugar stock is critical. Current stock is 12 bags (1kg) and minimum stock is 40 bags (1kg).', 12, 40, 'SYSTEM', 'ACTIVE', NOW() - INTERVAL '1 hour'),
('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000007', 'CRITICAL_STOCK', 'CRITICAL', 'Cooking Oil stock is critical. Current stock is 8 bottles (1L) and minimum stock is 30 bottles (1L).', 8, 30, 'SYSTEM', 'ACTIVE', NOW() - INTERVAL '4 hours'),
('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000010', 'CRITICAL_STOCK', 'CRITICAL', 'Chips stock is critical. Current stock is 15 bags and minimum stock is 40 bags.', 15, 40, 'SYSTEM', 'ACTIVE', NOW() - INTERVAL '5 hours'),
('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'LOW_STOCK', 'LOW', 'Bread stock is low. Current stock is 18 loaves and minimum stock is 30 loaves.', 18, 30, 'SYSTEM', 'ACTIVE', NOW() - INTERVAL '3 hours'),
('d0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', 'LOW_STOCK', 'LOW', 'Biscuits stock is low. Current stock is 22 packs and minimum stock is 25 packs.', 22, 25, 'SYSTEM', 'ACTIVE', NOW() - INTERVAL '6 hours');

-- 8. SEED NOTIFICATIONS
INSERT INTO notifications (alert_id, title, message, type, is_read, created_at) VALUES
('d0000000-0000-0000-0000-000000000001', 'Out of Stock Alert: Coca Cola', 'Coca Cola stock depleted to 0 units. Immediate supplier restock required.', 'STOCK_ALERT', FALSE, NOW() - INTERVAL '30 minutes'),
('d0000000-0000-0000-0000-000000000002', 'Critical Stock Alert: Sugar', 'Sugar stock is at 12 units (minimum: 40).', 'STOCK_ALERT', FALSE, NOW() - INTERVAL '1 hour'),
('d0000000-0000-0000-0000-000000000003', 'Critical Stock Alert: Cooking Oil', 'Cooking Oil stock dropped to 8 bottles (minimum: 30).', 'STOCK_ALERT', FALSE, NOW() - INTERVAL '4 hours');

-- 9. SEED RESTOCK ORDER SAMPLE
INSERT INTO restock_orders (order_number, product_id, supplier_id, quantity, unit_cost, total_cost, status, notes) VALUES
('PO-202609-001', 'b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 120, 0.85, 102.00, 'PENDING', 'Urgent re-order due to complete stock depletion');
