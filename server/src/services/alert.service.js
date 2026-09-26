import crypto from 'crypto';
import supabase from '../config/db.js';
import { calculateStockStatus, STOCK_STATUS } from '../utils/stockStatus.js';
import { getProductById } from './product.service.js';
import { findUserById } from './auth.service.js';

export const ALERT_TYPES = Object.freeze({
  LOW_STOCK: 'LOW_STOCK',
  CRITICAL_STOCK: 'CRITICAL_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK'
});

export const ALERT_SEVERITIES = Object.freeze({
  LOW: 'LOW',
  CRITICAL: 'CRITICAL',
  OUT_OF_STOCK: 'OUT_OF_STOCK'
});

export const ALERT_STATUSES = Object.freeze({
  ACTIVE: 'ACTIVE',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  RESOLVED: 'RESOLVED'
});

export const ALERT_SOURCES = Object.freeze({
  MANUAL: 'MANUAL',
  IOT: 'IOT',
  SYSTEM: 'SYSTEM'
});

/**
 * Pre-seeded in-memory fallback alerts (mirrors database/seeds.sql)
 */
let inMemoryAlerts = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    product_id: 'b0000000-0000-0000-0000-000000000005',
    alert_type: 'OUT_OF_STOCK',
    severity: 'OUT_OF_STOCK',
    message: 'Coca Cola is out of stock.',
    current_stock: 0,
    minimum_stock: 60,
    source: 'SYSTEM',
    status: 'ACTIVE',
    acknowledged_by: null,
    acknowledged_at: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    product_id: 'b0000000-0000-0000-0000-000000000004',
    alert_type: 'CRITICAL_STOCK',
    severity: 'CRITICAL',
    message: 'Sugar stock is critical. Current stock is 12 bags (1kg) and minimum stock is 40 bags (1kg).',
    current_stock: 12,
    minimum_stock: 40,
    source: 'SYSTEM',
    status: 'ACTIVE',
    acknowledged_by: null,
    acknowledged_at: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 60000).toISOString()
  },
  {
    id: 'd0000000-0000-0000-0000-000000000003',
    product_id: 'b0000000-0000-0000-0000-000000000007',
    alert_type: 'CRITICAL_STOCK',
    severity: 'CRITICAL',
    message: 'Cooking Oil stock is critical. Current stock is 8 bottles (1L) and minimum stock is 30 bottles (1L).',
    current_stock: 8,
    minimum_stock: 30,
    source: 'SYSTEM',
    status: 'ACTIVE',
    acknowledged_by: null,
    acknowledged_at: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 'd0000000-0000-0000-0000-000000000004',
    product_id: 'b0000000-0000-0000-0000-000000000010',
    alert_type: 'CRITICAL_STOCK',
    severity: 'CRITICAL',
    message: 'Chips stock is critical. Current stock is 15 bags and minimum stock is 40 bags.',
    current_stock: 15,
    minimum_stock: 40,
    source: 'SYSTEM',
    status: 'ACTIVE',
    acknowledged_by: null,
    acknowledged_at: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 3600000).toISOString()
  },
  {
    id: 'd0000000-0000-0000-0000-000000000005',
    product_id: 'b0000000-0000-0000-0000-000000000002',
    alert_type: 'LOW_STOCK',
    severity: 'LOW',
    message: 'Bread stock is low. Current stock is 18 loaves and minimum stock is 30 loaves.',
    current_stock: 18,
    minimum_stock: 30,
    source: 'SYSTEM',
    status: 'ACTIVE',
    acknowledged_by: null,
    acknowledged_at: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    id: 'd0000000-0000-0000-0000-000000000006',
    product_id: 'b0000000-0000-0000-0000-000000000006',
    alert_type: 'LOW_STOCK',
    severity: 'LOW',
    message: 'Biscuits stock is low. Current stock is 22 packs and minimum stock is 25 packs.',
    current_stock: 22,
    minimum_stock: 25,
    source: 'SYSTEM',
    status: 'ACTIVE',
    acknowledged_by: null,
    acknowledged_at: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 3600000).toISOString()
  }
];

/**
 * Reusable function to generate consistent alert messages.
 * 
 * @param {Object} product - Product model containing name, unit, etc.
 * @param {string} alertType - LOW_STOCK | CRITICAL_STOCK | OUT_OF_STOCK
 * @param {number} currentStock - Current stock level
 * @param {number} minimumStock - Minimum stock threshold
 * @returns {string} Formatted alert message
 */
export function generateAlertMessage(product, alertType, currentStock, minimumStock) {
  const name = product?.name || 'Product';
  const unit = product?.unit ? ` ${product.unit}` : '';

  switch (alertType) {
    case ALERT_TYPES.OUT_OF_STOCK:
      return `${name} is out of stock.`;
    case ALERT_TYPES.CRITICAL_STOCK:
      return `${name} stock is critical. Current stock is ${currentStock}${unit} and minimum stock is ${minimumStock}${unit}.`;
    case ALERT_TYPES.LOW_STOCK:
    default:
      return `${name} stock is low. Current stock is ${currentStock}${unit} and minimum stock is ${minimumStock}${unit}.`;
  }
}

/**
 * Enriches an alert record with product and acknowledgement user details.
 */
export async function enrichAlertRecord(record) {
  let productName = 'Unknown Product';
  let sku = 'N/A';
  let unit = 'units';
  let category = 'Uncategorized';
  let productPrice = 0;

  if (record.product_id) {
    try {
      const prod = await getProductById(record.product_id);
      if (prod) {
        productName = prod.name;
        sku = prod.sku;
        unit = prod.unit || 'units';
        category = prod.category || 'General';
        productPrice = prod.price || 0;
      }
    } catch {
      // Product may not be found or error during fetch
    }
  }

  let acknowledgedByUser = null;
  if (record.acknowledged_by) {
    try {
      const user = await findUserById(record.acknowledged_by);
      if (user) {
        acknowledgedByUser = {
          id: user.id,
          name: user.full_name || user.name || 'Staff User',
          email: user.email || ''
        };
      }
    } catch {
      // User lookup fallback
    }
  }

  return {
    id: record.id,
    productId: record.product_id,
    productName,
    sku,
    unit,
    category,
    price: productPrice,
    alertType: record.alert_type || (record.severity === 'OUT_OF_STOCK' ? 'OUT_OF_STOCK' : `${record.severity}_STOCK`),
    severity: record.severity,
    status: record.status || 'ACTIVE',
    currentStock: record.current_stock,
    minimumStock: record.minimum_stock,
    source: record.source || 'SYSTEM',
    message: record.message,
    acknowledgedBy: acknowledgedByUser,
    acknowledgedAt: record.acknowledged_at || null,
    resolvedAt: record.resolved_at || null,
    createdAt: record.created_at,
    updatedAt: record.updated_at || record.created_at
  };
}

/**
 * Core Alert Engine Function:
 * Evaluates stock thresholds for a product and creates, updates, or resolves alerts.
 * 
 * Rules:
 * 1. Stock Status calculated using calculateStockStatus.
 * 2. If NORMAL: automatically resolve any existing active/acknowledged alerts for this product.
 * 3. If LOW/CRITICAL/OUT_OF_STOCK:
 *    - If an active alert of the SAME type already exists: keep it active, do NOT create a duplicate.
 *    - If an active alert of a DIFFERENT type exists (severity transition): resolve old alert, create new one.
 *    - If no active alert exists: create new alert.
 * 4. Preserves resolved alerts in history for auditing.
 * 
 * @param {string} productId - Product UUID
 * @param {string} source - 'MANUAL' | 'IOT' | 'SYSTEM'
 * @returns {Promise<Object>} Evaluation result containing created/updated/resolved alert info
 */
export async function evaluateStockAlert(productId, source = 'SYSTEM') {
  const product = await getProductById(productId);
  if (!product) {
    return { success: false, reason: 'Product not found' };
  }

  const currentStock = Math.max(0, Number(product.currentStock));
  const minimumStock = Math.max(0, Number(product.minimumStock));
  const stockStatus = calculateStockStatus(currentStock, minimumStock);
  const now = new Date().toISOString();

  // Find all active or acknowledged alerts for this product
  let activeAlerts = inMemoryAlerts.filter(
    (a) => a.product_id === productId && (a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED')
  );

  // If Supabase is connected, query active alerts from database
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('product_id', productId)
        .in('status', ['ACTIVE', 'ACKNOWLEDGED']);

      if (!error && data) {
        activeAlerts = data;
      }
    } catch (err) {
      console.warn('[ALERT SERVICE] Supabase query active alerts failed:', err.message);
    }
  }

  // CASE 1: Stock is NORMAL -> resolve any active/acknowledged alerts
  if (stockStatus === STOCK_STATUS.NORMAL) {
    if (activeAlerts.length > 0) {
      for (const alert of activeAlerts) {
        alert.status = 'RESOLVED';
        alert.resolved_at = now;
        alert.updated_at = now;

        if (supabase) {
          try {
            await supabase
              .from('alerts')
              .update({
                status: 'RESOLVED',
                resolved_at: now,
                updated_at: now
              })
              .eq('id', alert.id);
          } catch (err) {
            console.warn('[ALERT SERVICE] Supabase auto-resolve alert failed:', err.message);
          }
        }
      }

      return {
        action: 'RESOLVED',
        resolvedAlerts: await Promise.all(activeAlerts.map(enrichAlertRecord))
      };
    }

    return { action: 'NONE', message: 'Stock is normal, no alert required.' };
  }

  // Determine required alert type and severity based on stock status
  let requiredAlertType;
  let requiredSeverity;

  switch (stockStatus) {
    case STOCK_STATUS.OUT_OF_STOCK:
      requiredAlertType = ALERT_TYPES.OUT_OF_STOCK;
      requiredSeverity = ALERT_SEVERITIES.OUT_OF_STOCK;
      break;
    case STOCK_STATUS.CRITICAL:
      requiredAlertType = ALERT_TYPES.CRITICAL_STOCK;
      requiredSeverity = ALERT_SEVERITIES.CRITICAL;
      break;
    case STOCK_STATUS.LOW:
    default:
      requiredAlertType = ALERT_TYPES.LOW_STOCK;
      requiredSeverity = ALERT_SEVERITIES.LOW;
      break;
  }

  // Check if an alert with the SAME alert_type is already active
  const existingSameAlert = activeAlerts.find((a) => a.alert_type === requiredAlertType);

  if (existingSameAlert) {
    // Duplicate prevention rule:
    // Update current_stock and updated_at on existing alert, but DO NOT create a new record
    existingSameAlert.current_stock = currentStock;
    existingSameAlert.minimum_stock = minimumStock;
    existingSameAlert.updated_at = now;

    if (supabase) {
      try {
        await supabase
          .from('alerts')
          .update({
            current_stock: currentStock,
            minimum_stock: minimumStock,
            updated_at: now
          })
          .eq('id', existingSameAlert.id);
      } catch (err) {
        console.warn('[ALERT SERVICE] Supabase update existing alert failed:', err.message);
      }
    }

    // If there were any other conflicting active alerts, resolve them
    const conflictingAlerts = activeAlerts.filter((a) => a.id !== existingSameAlert.id);
    for (const conf of conflictingAlerts) {
      conf.status = 'RESOLVED';
      conf.resolved_at = now;
      conf.updated_at = now;

      if (supabase) {
        try {
          await supabase
            .from('alerts')
            .update({ status: 'RESOLVED', resolved_at: now, updated_at: now })
            .eq('id', conf.id);
        } catch (err) {
          console.warn('[ALERT SERVICE] Supabase resolve conflicting alert failed:', err.message);
        }
      }
    }

    return {
      action: 'EXISTING_MAINTAINED',
      isNew: false,
      alert: await enrichAlertRecord(existingSameAlert)
    };
  }

  // CASE 2: Severity Transition or Fresh Deficit Condition
  // Close any previously active alert of different condition for this product
  for (const prevAlert of activeAlerts) {
    prevAlert.status = 'RESOLVED';
    prevAlert.resolved_at = now;
    prevAlert.updated_at = now;

    if (supabase) {
      try {
        await supabase
          .from('alerts')
          .update({
            status: 'RESOLVED',
            resolved_at: now,
            updated_at: now
          })
          .eq('id', prevAlert.id);
      } catch (err) {
        console.warn('[ALERT SERVICE] Supabase resolve previous alert failed:', err.message);
      }
    }
  }

  // Create brand new alert record
  const newAlert = {
    id: crypto.randomUUID(),
    product_id: product.id,
    alert_type: requiredAlertType,
    severity: requiredSeverity,
    message: generateAlertMessage(product, requiredAlertType, currentStock, minimumStock),
    current_stock: currentStock,
    minimum_stock: minimumStock,
    source: source || 'SYSTEM',
    status: 'ACTIVE',
    acknowledged_by: null,
    acknowledged_at: null,
    resolved_at: null,
    created_at: now,
    updated_at: now
  };

  if (supabase) {
    try {
      const { error: insErr } = await supabase.from('alerts').insert(newAlert);
      if (insErr) {
        console.warn('[ALERT SERVICE] Supabase insert new alert failed:', insErr.message);
      }
    } catch (err) {
      console.warn('[ALERT SERVICE] Supabase insert alert exception:', err.message);
    }
  }

  inMemoryAlerts.unshift(newAlert);

  return {
    action: 'CREATED',
    isNew: true,
    alert: await enrichAlertRecord(newAlert)
  };
}

/**
 * Retrieves all alerts with optional filtering.
 * Default ordering: Newest first.
 */
export async function getAlerts(filters = {}) {
  let records = [];

  if (supabase) {
    try {
      let query = supabase.from('alerts').select('*').order('created_at', { ascending: false });

      if (filters.severity && filters.severity !== 'ALL') {
        query = query.eq('severity', filters.severity);
      }
      if (filters.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status);
      }
      if (filters.source && filters.source !== 'ALL') {
        query = query.eq('source', filters.source);
      }
      if (filters.productId && filters.productId !== 'ALL') {
        query = query.eq('product_id', filters.productId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        records = data;
      }
    } catch (err) {
      console.warn('[ALERT SERVICE] Supabase getAlerts failed, using in-memory:', err.message);
    }
  }

  if (records.length === 0) {
    records = [...inMemoryAlerts];

    if (filters.severity && filters.severity !== 'ALL') {
      records = records.filter((a) => a.severity === filters.severity);
    }
    if (filters.status && filters.status !== 'ALL') {
      records = records.filter((a) => a.status === filters.status);
    }
    if (filters.source && filters.source !== 'ALL') {
      records = records.filter((a) => a.source === filters.source);
    }
    if (filters.productId && filters.productId !== 'ALL') {
      records = records.filter((a) => a.product_id === filters.productId);
    }
  }

  // Sort newest first
  records.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Enrich each record
  const enriched = await Promise.all(records.map(enrichAlertRecord));

  // Apply optional search filter on enriched fields (product name, sku, message)
  if (filters.search && String(filters.search).trim() !== '') {
    const q = String(filters.search).toLowerCase().trim();
    return enriched.filter(
      (a) =>
        a.productName.toLowerCase().includes(q) ||
        a.sku.toLowerCase().includes(q) ||
        a.message.toLowerCase().includes(q)
    );
  }

  return enriched;
}

/**
 * Retrieves a single alert by ID with complete details.
 */
export async function getAlertById(alertId) {
  let record = null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('id', alertId)
        .single();

      if (!error && data) {
        record = data;
      }
    } catch (err) {
      console.warn('[ALERT SERVICE] Supabase getAlertById failed:', err.message);
    }
  }

  if (!record) {
    record = inMemoryAlerts.find((a) => a.id === alertId);
  }

  if (!record) {
    const error = new Error('Alert not found.');
    error.status = 404;
    throw error;
  }

  return enrichAlertRecord(record);
}

/**
 * Acknowledges an active alert.
 * 
 * Requirements:
 * - Alert must exist (404).
 * - Alert must not already be RESOLVED (400).
 * - Sets status = 'ACKNOWLEDGED', acknowledged_by = userId, acknowledged_at = now.
 */
export async function acknowledgeAlert(alertId, userId) {
  let record = null;
  const now = new Date().toISOString();

  const inMemIndex = inMemoryAlerts.findIndex((a) => a.id === alertId);
  if (inMemIndex !== -1) {
    record = inMemoryAlerts[inMemIndex];
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('id', alertId)
        .single();

      if (!error && data) {
        record = data;
      }
    } catch (err) {
      console.warn('[ALERT SERVICE] Supabase check alert for acknowledge failed:', err.message);
    }
  }

  if (!record) {
    const error = new Error('Alert not found.');
    error.status = 404;
    throw error;
  }

  if (record.status === 'RESOLVED') {
    const error = new Error('Cannot acknowledge an already resolved alert.');
    error.status = 400;
    throw error;
  }

  record.status = 'ACKNOWLEDGED';
  record.acknowledged_by = userId || null;
  record.acknowledged_at = now;
  record.updated_at = now;

  if (supabase) {
    try {
      await supabase
        .from('alerts')
        .update({
          status: 'ACKNOWLEDGED',
          acknowledged_by: userId || null,
          acknowledged_at: now,
          updated_at: now
        })
        .eq('id', alertId);
    } catch (err) {
      console.warn('[ALERT SERVICE] Supabase acknowledgeAlert failed:', err.message);
    }
  }

  return enrichAlertRecord(record);
}

/**
 * Resolves an active or acknowledged alert manually.
 * 
 * Requirements:
 * - Alert must exist (404).
 * - Sets status = 'RESOLVED', resolved_at = now.
 * - Does NOT modify inventory stock.
 */
export async function resolveAlert(alertId) {
  let record = null;
  const now = new Date().toISOString();

  const inMemIndex = inMemoryAlerts.findIndex((a) => a.id === alertId);
  if (inMemIndex !== -1) {
    record = inMemoryAlerts[inMemIndex];
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('id', alertId)
        .single();

      if (!error && data) {
        record = data;
      }
    } catch (err) {
      console.warn('[ALERT SERVICE] Supabase check alert for resolve failed:', err.message);
    }
  }

  if (!record) {
    const error = new Error('Alert not found.');
    error.status = 404;
    throw error;
  }

  record.status = 'RESOLVED';
  record.resolved_at = now;
  record.updated_at = now;

  if (supabase) {
    try {
      await supabase
        .from('alerts')
        .update({
          status: 'RESOLVED',
          resolved_at: now,
          updated_at: now
        })
        .eq('id', alertId);
    } catch (err) {
      console.warn('[ALERT SERVICE] Supabase resolveAlert failed:', err.message);
    }
  }

  return enrichAlertRecord(record);
}

/**
 * Calculates summary metrics for active stock alerts.
 * Counts ONLY alerts with status === 'ACTIVE'.
 */
export async function getAlertSummary() {
  const allAlerts = await getAlerts({ status: 'ACTIVE' });

  let criticalCount = 0;
  let lowCount = 0;
  let outOfStockCount = 0;

  for (const a of allAlerts) {
    if (a.severity === 'CRITICAL') criticalCount++;
    else if (a.severity === 'LOW') lowCount++;
    else if (a.severity === 'OUT_OF_STOCK') outOfStockCount++;
  }

  return {
    activeAlerts: allAlerts.length,
    criticalAlerts: criticalCount,
    lowStockAlerts: lowCount,
    outOfStockAlerts: outOfStockCount
  };
}

/**
 * Returns raw count of active alerts for dashboard statistics.
 */
export function getActiveAlertsCount() {
  return inMemoryAlerts.filter((a) => a.status === 'ACTIVE').length;
}

export default {
  ALERT_TYPES,
  ALERT_SEVERITIES,
  ALERT_STATUSES,
  ALERT_SOURCES,
  evaluateStockAlert,
  generateAlertMessage,
  getAlerts,
  getAlertById,
  acknowledgeAlert,
  resolveAlert,
  getAlertSummary,
  getActiveAlertsCount
};
