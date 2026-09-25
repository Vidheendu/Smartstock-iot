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
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      if (!error && data) {
        return data.map((s) => ({
          id: s.id,
          name: s.name,
          contactName: s.contact_name,
          email: s.email,
          phone: s.phone
        }));
      }
    } catch (err) {
      console.warn('[SUPPLIERS DB] Supabase query failed, falling back:', err.message);
    }
  }

  return inMemorySuppliers.map((s) => ({
    id: s.id,
    name: s.name,
    contactName: s.contact_name,
    email: s.email,
    phone: s.phone
  }));
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

export default {
  getAllProducts,
  getProductById,
  checkSkuExists,
  createProduct,
  updateProduct,
  deleteProduct,
  getSuppliers,
  getProductStats
};
