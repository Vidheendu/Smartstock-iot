import crypto from 'crypto';
import supabase from '../config/db.js';
import { calculateStockStatus } from '../utils/stockStatus.js';

// Pre-seeded fallback in-memory suppliers (mirrors database/seeds.sql)
const inMemorySuppliers = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Fresh Dairy & Bakery Ltd',
    contact_name: 'Sarah Jenkins',
    email: 'orders@freshdairybakery.com',
    phone: '+1-555-0192',
    address: '104 Meadow Lane, Agro Park, NY',
    lead_time_days: 2,
    created_at: new Date().toISOString()
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    name: 'Agro Staples & Grains Co',
    contact_name: 'Robert Chen',
    email: 'sales@agrostaples.com',
    phone: '+1-555-0144',
    address: '88 Grain Terminal Rd, Chicago, IL',
    lead_time_days: 4,
    created_at: new Date().toISOString()
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    name: 'Apex Beverages & Snacks Inc',
    contact_name: 'Maria Rodriguez',
    email: 'supply@apexbeverages.com',
    phone: '+1-555-0188',
    address: '500 Commerce Blvd, Atlanta, GA',
    lead_time_days: 3,
    created_at: new Date().toISOString()
  }
];

// Pre-seeded fallback in-memory products (mirrors database/seeds.sql)
let inMemoryProducts = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    sku: 'SKU-MILK-001',
    name: 'Milk',
    category: 'Dairy',
    description: 'Pasteurized whole cow milk in refrigerated 1-liter bottles.',
    current_stock: 45,
    minimum_stock: 20,
    unit: 'bottles',
    unit_price: 3.49,
    supplier_id: 'a0000000-0000-0000-0000-000000000001',
    stock_status: 'NORMAL',
    is_active: true,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    sku: 'SKU-BRED-002',
    name: 'Bread',
    category: 'Bakery',
    description: 'Freshly baked sandwich white bread loaves.',
    current_stock: 18,
    minimum_stock: 30,
    unit: 'loaves',
    unit_price: 2.99,
    supplier_id: 'a0000000-0000-0000-0000-000000000001',
    stock_status: 'LOW',
    is_active: true,
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    sku: 'SKU-RICE-003',
    name: 'Rice',
    category: 'Grains',
    description: 'Long-grain fragrant basmati rice 5kg pack.',
    current_stock: 65,
    minimum_stock: 50,
    unit: 'bags (5kg)',
    unit_price: 12.99,
    supplier_id: 'a0000000-0000-0000-0000-000000000002',
    stock_status: 'NORMAL',
    is_active: true,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    sku: 'SKU-SUGR-004',
    name: 'Sugar',
    category: 'Grocery',
    description: 'Refined cane white sugar 1kg package.',
    current_stock: 12,
    minimum_stock: 40,
    unit: 'bags (1kg)',
    unit_price: 2.49,
    supplier_id: 'a0000000-0000-0000-0000-000000000002',
    stock_status: 'CRITICAL',
    is_active: true,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'b0000000-0000-0000-0000-000000000005',
    sku: 'SKU-COKE-005',
    name: 'Coca Cola',
    category: 'Beverages',
    description: 'Classic carbonated soft drink 330ml aluminum cans.',
    current_stock: 0,
    minimum_stock: 60,
    unit: 'cans',
    unit_price: 1.50,
    supplier_id: 'a0000000-0000-0000-0000-000000000003',
    stock_status: 'OUT_OF_STOCK',
    is_active: true,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'b0000000-0000-0000-0000-000000000006',
    sku: 'SKU-BISC-006',
    name: 'Biscuits',
    category: 'Snacks',
    description: 'Crispy butter cookies, standard consumer pack.',
    current_stock: 22,
    minimum_stock: 25,
    unit: 'packs',
    unit_price: 1.89,
    supplier_id: 'a0000000-0000-0000-0000-000000000003',
    stock_status: 'LOW',
    is_active: true,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'b0000000-0000-0000-0000-000000000007',
    sku: 'SKU-COIL-007',
    name: 'Cooking Oil',
    category: 'Grocery',
    description: 'Pure refined sunflower cooking oil 1-liter bottle.',
    current_stock: 8,
    minimum_stock: 30,
    unit: 'bottles (1L)',
    unit_price: 7.29,
    supplier_id: 'a0000000-0000-0000-0000-000000000002',
    stock_status: 'CRITICAL',
    is_active: true,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'b0000000-0000-0000-0000-000000000008',
    sku: 'SKU-COFF-008',
    name: 'Coffee',
    category: 'Beverages',
    description: 'Dark roast instant ground coffee glass jar.',
    current_stock: 35,
    minimum_stock: 20,
    unit: 'jars',
    unit_price: 8.99,
    supplier_id: 'a0000000-0000-0000-0000-000000000003',
    stock_status: 'NORMAL',
    is_active: true,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'b0000000-0000-0000-0000-000000000009',
    sku: 'SKU-TEAA-009',
    name: 'Tea',
    category: 'Beverages',
    description: 'Premium organic black tea bags (100 pack box).',
    current_stock: 25,
    minimum_stock: 20,
    unit: 'boxes',
    unit_price: 4.49,
    supplier_id: 'a0000000-0000-0000-0000-000000000003',
    stock_status: 'NORMAL',
    is_active: true,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'b0000000-0000-0000-0000-000000000010',
    sku: 'SKU-CHIP-010',
    name: 'Chips',
    category: 'Snacks',
    description: 'Salted potato crisps foil bag.',
    current_stock: 15,
    minimum_stock: 40,
    unit: 'bags',
    unit_price: 2.19,
    supplier_id: 'a0000000-0000-0000-0000-000000000003',
    stock_status: 'CRITICAL',
    is_active: true,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

/**
 * Normalizes a product record for client consumption.
 */
function formatProduct(product, supplierMap = {}) {
  if (!product) return null;

  const supplier = product.suppliers || (product.supplier_id ? supplierMap[product.supplier_id] : null);

  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    category: product.category,
    description: product.description || '',
    currentStock: Number(product.current_stock ?? 0),
    minimumStock: Number(product.minimum_stock ?? 0),
    unit: product.unit || 'units',
    price: Number(product.unit_price ?? 0),
    supplierId: product.supplier_id || null,
    supplier: supplier
      ? {
          id: supplier.id,
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone
        }
      : null,
    stockStatus: product.stock_status || calculateStockStatus(product.current_stock, product.minimum_stock),
    isActive: product.is_active !== false,
    createdAt: product.created_at,
    updatedAt: product.updated_at
  };
}

/**
 * Fetch list of suppliers.
 */
export async function getSuppliers() {
  try {
    const { getSuppliers: fetchFromSupplierService } = await import('./supplier.service.js');
    const res = await fetchFromSupplierService();
    return res.data || [];
  } catch (err) {
    console.warn('[PRODUCT SERVICE] Fallback getSuppliers failed:', err.message);
    return inMemorySuppliers.map((s) => ({
      id: s.id,
      name: s.name,
      contactName: s.contact_name,
      email: s.email,
      phone: s.phone,
      isActive: s.is_active !== undefined ? s.is_active : true
    }));
  }
}

/**
 * Retrieve all products with optional filtering.
 */
export async function getAllProducts({ search, category, status, isActive } = {}) {
  // Build supplier map for joining
  const suppliers = await getSuppliers();
  const supplierMap = suppliers.reduce((acc, s) => {
    acc[s.id] = s;
    return acc;
  }, {});

  if (supabase) {
    try {
      let query = supabase
        .from('products')
        .select('*, suppliers(*)');

      if (isActive === 'true' || isActive === true) {
        query = query.eq('is_active', true);
      } else if (isActive === 'false' || isActive === false) {
        query = query.eq('is_active', false);
      }

      if (category && category !== 'ALL') {
        query = query.eq('category', category);
      }

      if (status && status !== 'ALL') {
        query = query.eq('stock_status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data) {
        let results = data.map((p) => formatProduct(p, supplierMap));

        if (search && search.trim()) {
          const s = search.trim().toLowerCase();
          results = results.filter(
            (p) =>
              p.name.toLowerCase().includes(s) ||
              p.sku.toLowerCase().includes(s) ||
              p.category.toLowerCase().includes(s)
          );
        }

        return results;
      }
    } catch (err) {
      console.warn('[PRODUCTS DB] Supabase query failed, falling back:', err.message);
    }
  }

  // Fallback in-memory store
  let results = inMemoryProducts.map((p) => formatProduct(p, supplierMap));

  if (isActive === 'true' || isActive === true) {
    results = results.filter((p) => p.isActive === true);
  } else if (isActive === 'false' || isActive === false) {
    results = results.filter((p) => p.isActive === false);
  }

  if (category && category !== 'ALL') {
    results = results.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (status && status !== 'ALL') {
    results = results.filter((p) => p.stockStatus === status);
  }

  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s)
    );
  }

  return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Retrieve a single product by ID.
 */
export async function getProductById(id) {
  const suppliers = await getSuppliers();
  const supplierMap = suppliers.reduce((acc, s) => {
    acc[s.id] = s;
    return acc;
  }, {});

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, suppliers(*)')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return formatProduct(data, supplierMap);
      }
    } catch (err) {
      console.warn('[PRODUCTS DB] Supabase getProductById failed:', err.message);
    }
  }

  const found = inMemoryProducts.find((p) => p.id === id);
  if (!found) return null;
  return formatProduct(found, supplierMap);
}

/**
 * Check if a SKU exists (excluding a specific product ID if updating).
 */
export async function checkSkuExists(sku, excludeId = null) {
  const normalizedSku = sku.trim().toUpperCase();

  if (supabase) {
    try {
      let query = supabase
        .from('products')
        .select('id')
        .ilike('sku', normalizedSku);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        return true;
      }
    } catch (err) {
      console.warn('[PRODUCTS DB] SKU check failed, checking fallback:', err.message);
    }
  }

  return inMemoryProducts.some(
    (p) => p.sku.toUpperCase() === normalizedSku && (!excludeId || p.id !== excludeId)
  );
}

/**
 * Create a new product.
 */
export async function createProduct(data) {
  const sku = String(data.sku).trim().toUpperCase();
  const name = String(data.name).trim();
  const category = String(data.category).trim();
  const unit = String(data.unit || 'units').trim();
  const description = data.description ? String(data.description).trim() : '';

  const currentStock = Math.max(0, parseInt(data.currentStock ?? data.current_stock ?? 0, 10));
  const minimumStock = Math.max(0, parseInt(data.minimumStock ?? data.minimum_stock ?? 10, 10));
  const unitPrice = Math.max(0, parseFloat(data.price ?? data.unit_price ?? 0));
  const supplierId = data.supplierId || data.supplier_id || null;
  const isActive = data.isActive !== undefined ? Boolean(data.isActive) : (data.is_active !== undefined ? Boolean(data.is_active) : true);

  // Check unique SKU
  const exists = await checkSkuExists(sku);
  if (exists) {
    const error = new Error('Product SKU already exists');
    error.status = 409;
    throw error;
  }

  // Calculate stock status
  const stockStatus = calculateStockStatus(currentStock, minimumStock);
  const now = new Date().toISOString();
  const newId = crypto.randomUUID();

  const newRecord = {
    id: newId,
    sku,
    name,
    category,
    description,
    current_stock: currentStock,
    minimum_stock: minimumStock,
    unit,
    unit_price: unitPrice,
    supplier_id: supplierId,
    stock_status: stockStatus,
    is_active: isActive,
    created_at: now,
    updated_at: now
  };

  if (supabase) {
    try {
      const { data: created, error } = await supabase
        .from('products')
        .insert([newRecord])
        .select('*, suppliers(*)')
        .single();

      if (!error && created) {
        return formatProduct(created);
      }
    } catch (err) {
      console.warn('[PRODUCTS DB] Supabase createProduct failed, falling back:', err.message);
    }
  }

  inMemoryProducts.push(newRecord);
  return getProductById(newId);
}

/**
 * Update an existing product.
 */
export async function updateProduct(id, data) {
  const existing = await getProductById(id);
  if (!existing) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }

  const updates = {
    updated_at: new Date().toISOString()
  };

  if (data.name !== undefined) {
    updates.name = String(data.name).trim();
  }

  if (data.sku !== undefined) {
    const newSku = String(data.sku).trim().toUpperCase();
    if (newSku !== existing.sku) {
      const exists = await checkSkuExists(newSku, id);
      if (exists) {
        const error = new Error('Product SKU already exists');
        error.status = 409;
        throw error;
      }
      updates.sku = newSku;
    }
  }

  if (data.category !== undefined) {
    updates.category = String(data.category).trim();
  }

  if (data.description !== undefined) {
    updates.description = String(data.description).trim();
  }

  if (data.unit !== undefined) {
    updates.unit = String(data.unit).trim();
  }

  if (data.price !== undefined || data.unit_price !== undefined) {
    updates.unit_price = Math.max(0, parseFloat(data.price ?? data.unit_price ?? 0));
  }

  if (data.supplierId !== undefined || data.supplier_id !== undefined) {
    updates.supplier_id = data.supplierId || data.supplier_id || null;
  }

  if (data.isActive !== undefined || data.is_active !== undefined) {
    updates.is_active = Boolean(data.isActive ?? data.is_active);
  }

  // Stock status recalculation if current_stock or minimum_stock changed
  const currentStock = data.currentStock !== undefined || data.current_stock !== undefined
    ? Math.max(0, parseInt(data.currentStock ?? data.current_stock, 10))
    : existing.currentStock;

  const minimumStock = data.minimumStock !== undefined || data.minimum_stock !== undefined
    ? Math.max(0, parseInt(data.minimumStock ?? data.minimum_stock, 10))
    : existing.minimumStock;

  if (data.currentStock !== undefined || data.current_stock !== undefined) {
    updates.current_stock = currentStock;
  }
  if (data.minimumStock !== undefined || data.minimum_stock !== undefined) {
    updates.minimum_stock = minimumStock;
  }

  updates.stock_status = calculateStockStatus(currentStock, minimumStock);

  if (supabase) {
    try {
      const { data: updated, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select('*, suppliers(*)')
        .single();

      if (!error && updated) {
        return formatProduct(updated);
      }
    } catch (err) {
      console.warn('[PRODUCTS DB] Supabase updateProduct failed:', err.message);
    }
  }

  // Update in-memory fallback
  const index = inMemoryProducts.findIndex((p) => p.id === id);
  if (index !== -1) {
    inMemoryProducts[index] = {
      ...inMemoryProducts[index],
      ...updates
    };
  }

  return getProductById(id);
}

/**
 * Soft delete (deactivate) or delete product.
 */
export async function deleteProduct(id, softDelete = true) {
  const existing = await getProductById(id);
  if (!existing) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }

  if (softDelete) {
    return await updateProduct(id, { is_active: false });
  }

  if (supabase) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (!error) {
        return { success: true, message: 'Product deleted successfully' };
      }
    } catch (err) {
      console.warn('[PRODUCTS DB] Supabase deleteProduct failed:', err.message);
    }
  }

  inMemoryProducts = inMemoryProducts.filter((p) => p.id !== id);
  return { success: true, message: 'Product deleted successfully' };
}

/**
 * Calculate product summary statistics from database.
 */
export async function getProductStats() {
  const activeProducts = await getAllProducts({ isActive: true });

  const totalProducts = activeProducts.length;
  let lowStock = 0;
  let criticalStock = 0;
  let outOfStock = 0;
  let normal = 0;

  activeProducts.forEach((p) => {
    switch (p.stockStatus) {
      case 'NORMAL':
        normal++;
        break;
      case 'LOW':
        lowStock++;
        break;
      case 'CRITICAL':
        criticalStock++;
        break;
      case 'OUT_OF_STOCK':
        outOfStock++;
        break;
    }
  });

  return {
    totalProducts,
    lowStock,
    criticalStock,
    outOfStock,
    normal
  };
}

/**
 * Safely and atomically updates product current stock and recalculates stock status.
 * Used by Inventory Service for stock-in, stock-out, and adjustment transactions.
 */
export async function updateProductStock(id, newStock) {
  const existing = await getProductById(id);
  if (!existing) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }

  const cleanStock = Math.max(0, parseInt(newStock, 10));
  const newStatus = calculateStockStatus(cleanStock, existing.minimumStock);
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const { data: updated, error } = await supabase
        .from('products')
        .update({
          current_stock: cleanStock,
          stock_status: newStatus,
          updated_at: now
        })
        .eq('id', id)
        .select('*, suppliers(*)')
        .single();

      if (!error && updated) {
        const idx = inMemoryProducts.findIndex((p) => p.id === id);
        if (idx !== -1) {
          inMemoryProducts[idx].current_stock = cleanStock;
          inMemoryProducts[idx].stock_status = newStatus;
          inMemoryProducts[idx].updated_at = now;
        }
        return formatProduct(updated);
      }
    } catch (err) {
      console.warn('[PRODUCTS DB] Supabase updateProductStock failed:', err.message);
    }
  }

  // Update in-memory fallback
  const idx = inMemoryProducts.findIndex((p) => p.id === id);
  if (idx !== -1) {
    inMemoryProducts[idx].current_stock = cleanStock;
    inMemoryProducts[idx].stock_status = newStatus;
    inMemoryProducts[idx].updated_at = now;
    return formatProduct(inMemoryProducts[idx]);
  }

  existing.currentStock = cleanStock;
  existing.stockStatus = newStatus;
  existing.updatedAt = now;
  return existing;
}

/**
 * Helper for supplier service to retrieve products without triggering circular getSuppliers calls.
 */
export async function getRawProductsForSupplierService() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      if (!error && Array.isArray(data)) return data;
    } catch {}
  }
  return inMemoryProducts;
}

/**
 * Consolidated product details service for Phase 13.
 * Gathers product details, inventory summary, supplier info, IoT device & telemetry,
 * alerts, forecast summary, recent restock orders, stock movement, and activity timeline.
 * Strictly reuses existing services and real database data.
 */
export async function getProductDetails(id) {
  const product = await getProductById(id);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }

  // 1. Current Inventory Summary
  const inventory = {
    productId: product.id,
    currentStock: product.currentStock,
    minimumStock: product.minimumStock,
    unit: product.unit,
    stockStatus: product.stockStatus
  };

  // 2. Supplier Details
  let supplier = null;
  if (product.supplierId) {
    try {
      const { getSupplierById } = await import('./supplier.service.js');
      const sup = await getSupplierById(product.supplierId);
      if (sup) {
        supplier = {
          id: sup.id,
          name: sup.name,
          contactPerson: sup.contact_person || sup.contact_name || sup.contactPerson || 'N/A',
          email: sup.email || 'N/A',
          phone: sup.phone || 'N/A',
          status: (sup.isActive !== false && sup.is_active !== false) ? 'ACTIVE' : 'INACTIVE',
          leadTimeDays: sup.leadTimeDays || sup.lead_time_days || null
        };
      }
    } catch (supErr) {
      console.warn('[PRODUCT DETAILS] Error loading supplier:', supErr.message);
    }
  }

  // 3. IoT Device & Telemetry (Phase 6)
  let iotDevice = null;
  let telemetry = [];
  try {
    const { getDevices, getSensorReadings } = await import('./iot.service.js');
    const allDevices = await getDevices();
    const assigned = allDevices.find(d => d.productId === product.id);
    if (assigned) {
      iotDevice = {
        id: assigned.id,
        deviceCode: assigned.deviceCode,
        deviceName: assigned.deviceName,
        deviceType: assigned.deviceType,
        location: assigned.location,
        status: (assigned.status === 'ACTIVE' || assigned.status === 'ONLINE') ? 'ONLINE' : 'OFFLINE',
        battery: assigned.batteryLevel ?? 95,
        lastSeen: assigned.lastPingAt,
        simulationStatus: 'SIMULATED IoT DEVICE'
      };

      const readings = await getSensorReadings({ productId: product.id });
      telemetry = readings.slice(0, 10).map(r => ({
        id: r.id,
        timestamp: r.recorded_at,
        rawReading: r.raw_reading,
        calculatedQuantity: r.calculated_units,
        battery: r.battery_level,
        readingType: 'SIMULATED'
      }));
    }
  } catch (iotErr) {
    console.warn('[PRODUCT DETAILS] Error loading IoT data:', iotErr.message);
  }

  // 4. Alerts (Phase 7)
  let alerts = [];
  try {
    const { getAlerts } = await import('./alert.service.js');
    const allAlerts = await getAlerts({ productId: product.id });
    alerts = allAlerts.map(a => ({
      id: a.id,
      alertType: a.alertType,
      severity: a.severity,
      message: a.message,
      status: a.status,
      source: a.source,
      createdAt: a.createdAt,
      resolvedAt: a.resolvedAt || null,
      acknowledgedAt: a.acknowledgedAt || null
    }));
  } catch (alertErr) {
    console.warn('[PRODUCT DETAILS] Error loading alerts:', alertErr.message);
  }

  // 5. Forecast & Consumption (Phase 10)
  let forecast = null;
  try {
    const { getProductForecast, getProductConsumption } = await import('./forecast.service.js');
    const [fc30, fc7, fc90] = await Promise.all([
      getProductForecast(product.id, 30).catch(() => null),
      getProductConsumption(product.id, 7).catch(() => null),
      getProductConsumption(product.id, 90).catch(() => null)
    ]);

    const isDepleted = product.currentStock === 0;
    const hasData = (fc30?.totalConsumed || 0) > 0 || (fc30?.recordsCount || 0) > 0;
    const isLimitedData = hasData && (fc30?.recordsCount || 0) < 3;

    forecast = {
      averageDailyConsumption: fc30?.averageDailyConsumption ?? 0,
      estimatedDaysRemaining: isDepleted ? 0 : (fc30?.estimatedDaysRemaining ?? null),
      projectedDepletionDate: isDepleted ? null : (fc30?.projectedDepletionDate ?? null),
      forecastPeriod: 30,
      status: isDepleted ? 'DEPLETED' : (fc30?.status || 'NO_DATA'),
      confidence: fc30?.confidence || 'INSUFFICIENT',
      isLimitedData,
      hasData,
      periods: {
        '7': {
          totalConsumed: fc7?.totalConsumed ?? 0,
          adc: fc7 ? Number(((fc7.totalConsumed || 0) / 7).toFixed(2)) : 0
        },
        '30': {
          totalConsumed: fc30?.totalConsumed ?? 0,
          adc: fc30?.averageDailyConsumption ?? 0
        },
        '90': {
          totalConsumed: fc90?.totalConsumed ?? 0,
          adc: fc90 ? Number(((fc90.totalConsumed || 0) / 90).toFixed(2)) : 0
        }
      }
    };
  } catch (fcErr) {
    console.warn('[PRODUCT DETAILS] Error loading forecast:', fcErr.message);
  }

  // 6. Restock Orders (Phase 11)
  let restockOrders = [];
  const suggestedRestockQuantity = Math.max(0, (product.minimumStock * 2) - product.currentStock);
  try {
    const { getRestockOrders } = await import('./restock.service.js');
    const allOrders = await getRestockOrders();
    const matchingOrders = allOrders.filter(o => 
      o.items && o.items.some(item => (item.productId === product.id || item.product_id === product.id))
    );

    restockOrders = matchingOrders.map(o => {
      const item = o.items.find(it => (it.productId === product.id || it.product_id === product.id));
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        supplier: o.supplier?.name || 'N/A',
        supplierId: o.supplierId,
        quantity: item?.quantity || 0,
        status: o.status,
        createdAt: o.createdAt,
        receivedAt: o.receivedAt || null
      };
    });
  } catch (restockErr) {
    console.warn('[PRODUCT DETAILS] Error loading restock orders:', restockErr.message);
  }

  // 7. Inventory History & Stock Movement (Phase 5)
  let stockMovement = [];
  let historyRecords = [];
  try {
    const { getInventoryHistory } = await import('./inventory.service.js');
    historyRecords = await getInventoryHistory({ productId: product.id });

    // Build chronological stock movement points (oldest to newest)
    const chronological = [...historyRecords].reverse();
    stockMovement = chronological.map(h => ({
      date: h.createdAt,
      stock: h.newStock,
      previousStock: h.previousStock,
      change: h.quantityChange,
      type: h.changeType,
      source: h.source
    }));

    if (stockMovement.length > 0) {
      const lastPoint = stockMovement[stockMovement.length - 1];
      if (lastPoint.stock !== product.currentStock) {
        stockMovement.push({
          date: new Date().toISOString(),
          stock: product.currentStock,
          previousStock: lastPoint.stock,
          change: product.currentStock - lastPoint.stock,
          type: 'CURRENT',
          source: 'SYSTEM'
        });
      }
    } else {
      stockMovement.push({
        date: product.createdAt,
        stock: product.currentStock,
        previousStock: product.currentStock,
        change: 0,
        type: 'INITIAL',
        source: 'SYSTEM'
      });
    }
  } catch (histErr) {
    console.warn('[PRODUCT DETAILS] Error loading stock movement:', histErr.message);
  }

  // 8. Recent Activity Timeline (Interleaved real events, top 10)
  const activities = [];

  // Stock movements
  for (const h of historyRecords.slice(0, 10)) {
    const qty = Math.abs(h.quantityChange);
    let title = 'Stock adjusted';
    let desc = `Stock adjusted to ${h.newStock} ${product.unit}`;
    if (h.changeType === 'STOCK_IN') {
      title = 'Stock received';
      desc = `Stock increased by ${qty} ${product.unit}`;
    } else if (h.changeType === 'STOCK_OUT') {
      title = 'Stock reduced';
      desc = `Stock reduced by ${qty} ${product.unit}`;
    }
    activities.push({
      id: `hist-${h.id}`,
      type: h.changeType,
      title,
      description: desc,
      timestamp: h.createdAt,
      source: h.source
    });
  }

  // IoT Readings
  for (const r of telemetry.slice(0, 5)) {
    activities.push({
      id: `iot-${r.id}`,
      type: 'IOT_READING',
      title: 'IoT sensor reading received',
      description: `Sensor reading: ${r.calculatedQuantity} ${product.unit} (${r.battery ? r.battery + '% battery' : 'SIMULATED'})`,
      timestamp: r.timestamp,
      source: 'IOT'
    });
  }

  // Alerts
  for (const a of alerts.slice(0, 5)) {
    const typeLabel = (a.alertType || 'Stock').replace(/_/g, ' ');
    activities.push({
      id: `alert-created-${a.id}`,
      type: 'ALERT_CREATED',
      title: `${typeLabel} alert created`,
      description: a.message,
      timestamp: a.createdAt,
      source: a.source || 'SYSTEM'
    });
    if (a.resolvedAt) {
      activities.push({
        id: `alert-resolved-${a.id}`,
        type: 'ALERT_RESOLVED',
        title: `${typeLabel} alert resolved`,
        description: 'Alert condition resolved',
        timestamp: a.resolvedAt,
        source: 'SYSTEM'
      });
    }
  }

  // Restock orders
  for (const ro of restockOrders.slice(0, 5)) {
    activities.push({
      id: `restock-created-${ro.id}`,
      type: 'RESTOCK_CREATED',
      title: `Restock order ${ro.orderNumber} created`,
      description: `Restock order created for ${ro.quantity} ${product.unit} (${ro.status})`,
      timestamp: ro.createdAt,
      source: 'SYSTEM'
    });
    if (ro.receivedAt) {
      activities.push({
        id: `restock-received-${ro.id}`,
        type: 'RESTOCK_RECEIVED',
        title: `Restock order ${ro.orderNumber} received`,
        description: `Shipment for ${ro.quantity} ${product.unit} received and restocked`,
        timestamp: ro.receivedAt,
        source: 'SYSTEM'
      });
    }
  }

  // Sort newest first
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const activityTimeline = activities.slice(0, 10);

  return {
    product,
    inventory,
    supplier,
    iotDevice,
    telemetry,
    alerts,
    forecast,
    restockOrders,
    suggestedRestockQuantity,
    stockMovement,
    activityTimeline
  };
}

export default {
  getAllProducts,
  getProductById,
  getProductDetails,
  checkSkuExists,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
  getSuppliers,
  getProductStats,
  getRawProductsForSupplierService
};

