import crypto from 'crypto';
import supabase from '../config/db.js';
import { getAllProducts, getProductById, updateProductStock } from './product.service.js';
import { findUserById } from './auth.service.js';
import { evaluateStockAlert } from './alert.service.js';

// Pre-seeded in-memory inventory history fallback (mirrors database/seeds.sql)
let inMemoryHistory = [
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    product_id: 'b0000000-0000-0000-0000-000000000001',
    user_id: 'e0000000-0000-0000-0000-000000000001',
    change_type: 'STOCK_OUT',
    quantity_change: -2,
    previous_stock: 47,
    new_stock: 45,
    reason: 'Store checkout order #1082',
    source: 'MANUAL',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    product_id: 'b0000000-0000-0000-0000-000000000002',
    user_id: 'e0000000-0000-0000-0000-000000000002',
    change_type: 'STOCK_OUT',
    quantity_change: -5,
    previous_stock: 23,
    new_stock: 18,
    reason: 'Shelf restocking sale',
    source: 'MANUAL',
    created_at: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    product_id: 'b0000000-0000-0000-0000-000000000004',
    user_id: 'e0000000-0000-0000-0000-000000000001',
    change_type: 'STOCK_OUT',
    quantity_change: -8,
    previous_stock: 20,
    new_stock: 12,
    reason: 'Customer purchase bulk',
    source: 'MANUAL',
    created_at: new Date(Date.now() - 1 * 3600000).toISOString()
  },
  {
    id: 'f0000000-0000-0000-0000-000000000005',
    product_id: 'b0000000-0000-0000-0000-000000000005',
    user_id: 'e0000000-0000-0000-0000-000000000002',
    change_type: 'STOCK_OUT',
    quantity_change: -10,
    previous_stock: 10,
    new_stock: 0,
    reason: 'Store promotion depletion',
    source: 'MANUAL',
    created_at: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: 'f0000000-0000-0000-0000-000000000006',
    product_id: 'b0000000-0000-0000-0000-000000000007',
    user_id: 'e0000000-0000-0000-0000-000000000001',
    change_type: 'ADJUSTMENT',
    quantity_change: -4,
    previous_stock: 12,
    new_stock: 8,
    reason: 'Physical count discrepancy audit',
    source: 'MANUAL',
    created_at: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 'f0000000-0000-0000-0000-000000000007',
    product_id: 'b0000000-0000-0000-0000-000000000003',
    user_id: 'e0000000-0000-0000-0000-000000000001',
    change_type: 'STOCK_IN',
    quantity_change: 25,
    previous_stock: 40,
    new_stock: 65,
    reason: 'Supplier delivery received PO-8831',
    source: 'MANUAL',
    created_at: new Date(Date.now() - 12 * 3600000).toISOString()
  }
];

/**
 * Format a database/in-memory product object into standardized inventory item.
 */
function formatInventoryItem(product) {
  return {
    productId: product.id,
    name: product.name,
    sku: product.sku,
    category: product.category,
    currentStock: product.currentStock,
    minimumStock: product.minimumStock,
    unit: product.unit || 'units',
    status: product.stockStatus || 'NORMAL',
    price: product.price || 0,
    supplier: product.supplier || null,
    isActive: product.isActive !== false,
    updatedAt: product.updatedAt || product.createdAt
  };
}

/**
 * Enriches a history record with product and user details for display.
 */
async function enrichHistoryRecord(record) {
  let productName = 'Unknown Product';
  let sku = 'N/A';
  let unit = 'units';

  try {
    const prod = await getProductById(record.product_id);
    if (prod) {
      productName = prod.name;
      sku = prod.sku;
      unit = prod.unit;
    }
  } catch (err) {
    // Product may be deleted or not found
  }

  let performedByName = 'System / Staff';
  let performedByEmail = '';

  if (record.user_id) {
    try {
      const usr = await findUserById(record.user_id);
      if (usr) {
        performedByName = usr.full_name || usr.name || performedByName;
        performedByEmail = usr.email || '';
      }
    } catch (err) {
      // User lookup fallback
    }
  }

  return {
    id: record.id,
    productId: record.product_id,
    productName,
    sku,
    unit,
    changeType: record.change_type || 'ADJUSTMENT',
    quantityChange: record.quantity_change !== undefined ? record.quantity_change : record.change_quantity,
    previousStock: record.previous_stock,
    newStock: record.new_stock,
    reason: record.reason,
    source: record.source || 'MANUAL',
    performedBy: {
      id: record.user_id,
      name: performedByName,
      email: performedByEmail
    },
    createdAt: record.created_at
  };
}

/**
 * Retrieves the current inventory overview for all products.
 */
export async function getInventory(filters = {}) {
  const products = await getAllProducts({
    isActive: filters.isActive !== undefined ? filters.isActive : 'true',
    category: filters.category,
    status: filters.status,
    search: filters.search
  });

  return products.map(formatInventoryItem);
}

/**
 * Retrieves inventory details for a specific product by ID.
 */
export async function getInventoryByProduct(productId) {
  const product = await getProductById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }
  return formatInventoryItem(product);
}

/**
 * Records a Stock In transaction.
 * Increases current stock by quantity and records an immutable inventory_history record.
 */
export async function stockIn({ productId, quantity, reason, userId, source = 'MANUAL' }) {
  const product = await getProductById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }

  const parsedQty = parseInt(quantity, 10);
  if (isNaN(parsedQty) || parsedQty <= 0) {
    const error = new Error('Quantity must be greater than zero');
    error.status = 400;
    throw error;
  }

  const previousStock = product.currentStock;
  const newStock = previousStock + parsedQty;
  const now = new Date().toISOString();
  const historyId = crypto.randomUUID();

  // Create history record object
  const historyRecord = {
    id: historyId,
    product_id: product.id,
    user_id: userId || null,
    change_type: 'STOCK_IN',
    quantity_change: parsedQty,
    previous_stock: previousStock,
    new_stock: newStock,
    reason: String(reason).trim(),
    source: source || 'MANUAL',
    created_at: now
  };

  // 1. Try Supabase transaction if configured
  if (supabase) {
    try {
      // Insert history first
      const { error: histErr } = await supabase
        .from('inventory_history')
        .insert({
          id: historyRecord.id,
          product_id: historyRecord.product_id,
          user_id: historyRecord.user_id,
          change_type: historyRecord.change_type,
          quantity_change: historyRecord.quantity_change,
          previous_stock: historyRecord.previous_stock,
          new_stock: historyRecord.new_stock,
          reason: historyRecord.reason,
          source: historyRecord.source,
          created_at: historyRecord.created_at
        });

      if (histErr) {
        console.warn('[INVENTORY DB] Supabase history insert failed:', histErr.message);
      }
    } catch (err) {
      console.warn('[INVENTORY DB] Supabase stock-in error:', err.message);
    }
  }

  // 2. Update product stock atomically
  const updatedProduct = await updateProductStock(product.id, newStock);

  // 3. Keep in-memory history updated
  inMemoryHistory.unshift(historyRecord);

  // 4. Trigger Automatic Alert Engine after stock update succeeds
  try {
    await evaluateStockAlert(product.id, source || 'MANUAL');
  } catch (alertErr) {
    console.warn('[INVENTORY ALERT] Failed to evaluate stock alert:', alertErr.message);
  }

  const enrichedTransaction = await enrichHistoryRecord(historyRecord);

  return {
    inventory: formatInventoryItem(updatedProduct),
    transaction: enrichedTransaction
  };
}

/**
 * Records a Stock Out transaction.
 * Decreases current stock by quantity, strictly preventing negative inventory.
 */
export async function stockOut({ productId, quantity, reason, userId, source = 'MANUAL' }) {
  const product = await getProductById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }

  const parsedQty = parseInt(quantity, 10);
  if (isNaN(parsedQty) || parsedQty <= 0) {
    const error = new Error('Quantity must be greater than zero');
    error.status = 400;
    throw error;
  }

  const previousStock = product.currentStock;

  // Strict negative stock prevention rule
  if (parsedQty > previousStock) {
    const error = new Error('Insufficient stock.');
    error.status = 400;
    throw error;
  }

  const newStock = previousStock - parsedQty;
  const now = new Date().toISOString();
  const historyId = crypto.randomUUID();

  const historyRecord = {
    id: historyId,
    product_id: product.id,
    user_id: userId || null,
    change_type: 'STOCK_OUT',
    quantity_change: -parsedQty,
    previous_stock: previousStock,
    new_stock: newStock,
    reason: String(reason).trim(),
    source: source || 'MANUAL',
    created_at: now
  };

  if (supabase) {
    try {
      const { error: histErr } = await supabase
        .from('inventory_history')
        .insert({
          id: historyRecord.id,
          product_id: historyRecord.product_id,
          user_id: historyRecord.user_id,
          change_type: historyRecord.change_type,
          quantity_change: historyRecord.quantity_change,
          previous_stock: historyRecord.previous_stock,
          new_stock: historyRecord.new_stock,
          reason: historyRecord.reason,
          source: historyRecord.source,
          created_at: historyRecord.created_at
        });

      if (histErr) {
        console.warn('[INVENTORY DB] Supabase history insert failed:', histErr.message);
      }
    } catch (err) {
      console.warn('[INVENTORY DB] Supabase stock-out error:', err.message);
    }
  }

  const updatedProduct = await updateProductStock(product.id, newStock);
  inMemoryHistory.unshift(historyRecord);

  // Trigger Automatic Alert Engine after stock update succeeds
  try {
    await evaluateStockAlert(product.id, source || 'MANUAL');
  } catch (alertErr) {
    console.warn('[INVENTORY ALERT] Failed to evaluate stock alert:', alertErr.message);
  }

  const enrichedTransaction = await enrichHistoryRecord(historyRecord);

  return {
    inventory: formatInventoryItem(updatedProduct),
    transaction: enrichedTransaction
  };
}

/**
 * Records a Stock Adjustment transaction.
 * Resets current stock to an absolute new stock value (must be >= 0).
 */
export async function adjustStock({ productId, newStock, reason, userId, source = 'MANUAL' }) {
  const product = await getProductById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }

  const parsedNewStock = parseInt(newStock, 10);
  if (isNaN(parsedNewStock) || parsedNewStock < 0) {
    const error = new Error('New stock cannot be negative');
    error.status = 400;
    throw error;
  }

  const previousStock = product.currentStock;
  const quantityChange = parsedNewStock - previousStock;
  const now = new Date().toISOString();
  const historyId = crypto.randomUUID();

  const historyRecord = {
    id: historyId,
    product_id: product.id,
    user_id: userId || null,
    change_type: 'ADJUSTMENT',
    quantity_change: quantityChange,
    previous_stock: previousStock,
    new_stock: parsedNewStock,
    reason: String(reason).trim(),
    source: source || 'MANUAL',
    created_at: now
  };

  if (supabase) {
    try {
      const { error: histErr } = await supabase
        .from('inventory_history')
        .insert({
          id: historyRecord.id,
          product_id: historyRecord.product_id,
          user_id: historyRecord.user_id,
          change_type: historyRecord.change_type,
          quantity_change: historyRecord.quantity_change,
          previous_stock: historyRecord.previous_stock,
          new_stock: historyRecord.new_stock,
          reason: historyRecord.reason,
          source: historyRecord.source,
          created_at: historyRecord.created_at
        });

      if (histErr) {
        console.warn('[INVENTORY DB] Supabase history insert failed:', histErr.message);
      }
    } catch (err) {
      console.warn('[INVENTORY DB] Supabase adjust error:', err.message);
    }
  }

  const updatedProduct = await updateProductStock(product.id, parsedNewStock);
  inMemoryHistory.unshift(historyRecord);

  // Trigger Automatic Alert Engine after stock update succeeds
  try {
    await evaluateStockAlert(product.id, source || 'MANUAL');
  } catch (alertErr) {
    console.warn('[INVENTORY ALERT] Failed to evaluate stock alert:', alertErr.message);
  }

  const enrichedTransaction = await enrichHistoryRecord(historyRecord);

  return {
    inventory: formatInventoryItem(updatedProduct),
    transaction: enrichedTransaction
  };
}

/**
 * Retrieves full inventory history with filtering capabilities.
 */
export async function getInventoryHistory(filters = {}) {
  let records = [];

  if (supabase) {
    try {
      let query = supabase
        .from('inventory_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.productId) {
        query = query.eq('product_id', filters.productId);
      }
      if (filters.changeType && filters.changeType !== 'ALL') {
        query = query.eq('change_type', filters.changeType);
      }
      if (filters.source && filters.source !== 'ALL') {
        query = query.eq('source', filters.source);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        records = data;
      }
    } catch (err) {
      console.warn('[INVENTORY DB] Supabase getInventoryHistory query error, fallback to in-memory:', err.message);
    }
  }

  // Fallback to in-memory history if Supabase had no records or not connected
  if (records.length === 0) {
    records = [...inMemoryHistory];

    if (filters.productId) {
      records = records.filter((r) => r.product_id === filters.productId);
    }
    if (filters.changeType && filters.changeType !== 'ALL') {
      records = records.filter((r) => r.change_type === filters.changeType);
    }
    if (filters.source && filters.source !== 'ALL') {
      records = records.filter((r) => r.source === filters.source);
    }
  }

  // Sort descending by created_at
  records.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Enrich each record with product and user display metadata
  return Promise.all(records.map(enrichHistoryRecord));
}

/**
 * Retrieves inventory history for a single product.
 */
export async function getProductHistory(productId) {
  // Validate that product exists
  const product = await getProductById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }

  return getInventoryHistory({ productId: product.id });
}

export default {
  getInventory,
  getInventoryByProduct,
  stockIn,
  stockOut,
  adjustStock,
  getInventoryHistory,
  getProductHistory
};
