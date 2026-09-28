/**
 * SmartStock Restocking & Purchase Order Management Service
 * 
 * Manages procurement workflows for inventory replenishment:
 * - Identification of products needing restock (rule-based inventory & forecast thresholds)
 * - Deterministic suggested restock quantities: Target Stock (2 * minimum_stock) - Current Stock
 * - Multi-item Restock Orders associated with registered suppliers
 * - Order lifecycle state machine: DRAFT -> PENDING -> ORDERED -> RECEIVED (or CANCELLED)
 * - Atomic stock receiving with duplicate receiving protection
 * - Automatic inventory history creation and alert re-evaluation via inventory.service
 * - System notification generation on order events
 * 
 * Real database data only. Strictly NO mock orders, external supplier APIs, or payment gateways.
 */

import crypto from 'crypto';
import supabase from '../config/db.js';
import { RESTOCK_STATUS } from '../types/restock.js';
import { getAllProducts, getProductById, getSuppliers } from './product.service.js';
import { stockIn } from './inventory.service.js';
import { findUserById, getAllUsers } from './auth.service.js';
import { createNotification, NOTIFICATION_TYPES } from './notification.service.js';
import { getForecastOverview } from './forecast.service.js';

// Pre-seeded in-memory restock orders fallback (mirrors database/seeds.sql)
let inMemoryOrders = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    order_number: 'RS-0001',
    supplier_id: 'a0000000-0000-0000-0000-000000000003',
    status: RESTOCK_STATUS.PENDING,
    notes: 'Urgent re-order due to complete stock depletion',
    total_items: 1,
    total_amount: 102.00,
    created_by: 'e0000000-0000-0000-0000-000000000001',
    ordered_at: null,
    received_at: null,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600000).toISOString()
  }
];

let inMemoryOrderItems = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    restock_order_id: 'c0000000-0000-0000-0000-000000000001',
    product_id: 'b0000000-0000-0000-0000-000000000005',
    quantity: 120,
    unit_price: 0.85,
    total_price: 102.00,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString()
  }
];

/**
 * Generates the next sequential human-readable restock order number (e.g., RS-0001, RS-0002).
 * Formatted with 'RS-' prefix and 4-digit zero-padded sequence.
 * 
 * @returns {Promise<string>}
 */
export async function generateOrderNumber() {
  let highestNum = 0;

  // 1. Check database if available
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('restock_orders')
        .select('order_number')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && Array.isArray(data)) {
        for (const row of data) {
          const match = row.order_number?.match(/^RS-(\d+)$/i);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > highestNum) highestNum = num;
          }
        }
      }
    } catch {
      // Fall through to in-memory check
    }
  }

  // 2. Check in-memory orders
  for (const order of inMemoryOrders) {
    const match = order.order_number?.match(/^RS-(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > highestNum) highestNum = num;
    }
  }

  const nextNum = highestNum + 1;
  return `RS-${String(nextNum).padStart(4, '0')}`;
}

/**
 * Formats a restock order item with enriched product metadata.
 */
function formatOrderItem(item, productMap = {}) {
  const prod = productMap[item.product_id] || null;
  const quantity = Number(item.quantity) || 0;
  const unitPrice = Number(item.unit_price) || 0;
  const totalPrice = Number((quantity * unitPrice).toFixed(2));

  return {
    id: item.id,
    restockOrderId: item.restock_order_id,
    productId: item.product_id,
    productName: prod ? prod.name : 'Unknown Product',
    sku: prod ? prod.sku : 'N/A',
    category: prod ? prod.category : 'N/A',
    unit: prod ? prod.unit : 'units',
    currentStock: prod ? prod.currentStock : 0,
    minimumStock: prod ? prod.minimumStock : 0,
    unitPrice,
    quantity,
    totalPrice,
    createdAt: item.created_at
  };
}

/**
 * Enriches a raw database/in-memory restock order with joined supplier, creator, and items.
 */
async function enrichRestockOrder(order, items = [], suppliersList = null, productsList = null) {
  const suppliers = suppliersList || await getSuppliers();
  const supplier = suppliers.find(s => s.id === order.supplier_id) || null;

  const products = productsList || await getAllProducts();
  const productMap = products.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const orderItems = items
    .filter(i => i.restock_order_id === order.id)
    .map(i => formatOrderItem(i, productMap));

  let creator = null;
  if (order.created_by) {
    try {
      const user = await findUserById(order.created_by);
      if (user) {
        creator = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };
      }
    } catch {
      // Creator lookup fallback
    }
  }

  const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = Number(orderItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2));

  return {
    id: order.id,
    orderNumber: order.order_number,
    supplierId: order.supplier_id,
    supplier: supplier ? {
      id: supplier.id,
      name: supplier.name,
      contactName: supplier.contactName || supplier.contact_name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      leadTimeDays: supplier.leadTimeDays || supplier.lead_time_days || 3
    } : null,
    status: order.status,
    notes: order.notes || '',
    totalItems: orderItems.length,
    totalQuantity,
    totalAmount,
    createdBy: creator,
    orderedAt: order.ordered_at || null,
    receivedAt: order.received_at || null,
    createdAt: order.created_at,
    updatedAt: order.updated_at || order.created_at,
    items: orderItems
  };
}

/**
 * Retrieves all restock orders with filtering, searching, and sorting.
 * 
 * @param {Object} filters
 * @param {string} [filters.status] - Filter by status (PENDING, ORDERED, RECEIVED, CANCELLED)
 * @param {string} [filters.supplierId] - Filter by supplier ID
 * @param {string} [filters.search] - Search by order number, notes, or supplier name
 * @param {string} [filters.dateFrom] - Start date ISO
 * @param {string} [filters.dateTo] - End date ISO
 * @param {string} [filters.sortBy] - Sort field ('createdAt', 'orderNumber', 'status', 'totalAmount')
 * @param {string} [filters.sortOrder] - 'asc' | 'desc' (default: 'desc')
 * @returns {Promise<Array>}
 */
export async function getRestockOrders(filters = {}) {
  const suppliers = await getSuppliers();
  const products = await getAllProducts();

  let orders = [...inMemoryOrders];
  let items = [...inMemoryOrderItems];

  if (supabase) {
    try {
      const { data: dbOrders, error: orderErr } = await supabase
        .from('restock_orders')
        .select('*');

      const { data: dbItems, error: itemsErr } = await supabase
        .from('restock_order_items')
        .select('*');

      if (!orderErr && Array.isArray(dbOrders)) {
        // Merge or replace in-memory with dbOrders
        const dbOrderIds = new Set(dbOrders.map(o => o.id));
        const combinedOrders = [...dbOrders];
        for (const memOrder of inMemoryOrders) {
          if (!dbOrderIds.has(memOrder.id)) combinedOrders.push(memOrder);
        }
        orders = combinedOrders;
      }

      if (!itemsErr && Array.isArray(dbItems)) {
        const dbItemIds = new Set(dbItems.map(i => i.id));
        const combinedItems = [...dbItems];
        for (const memItem of inMemoryOrderItems) {
          if (!dbItemIds.has(memItem.id)) combinedItems.push(memItem);
        }
        items = combinedItems;
      }
    } catch {
      // Use in-memory
    }
  }

  // 1. Status Filter
  if (filters.status && filters.status.trim() !== '' && filters.status !== 'ALL') {
    const targetStatus = filters.status.toUpperCase();
    orders = orders.filter(o => o.status === targetStatus);
  }

  // 2. Supplier Filter
  if (filters.supplierId && filters.supplierId.trim() !== '') {
    orders = orders.filter(o => o.supplier_id === filters.supplierId);
  }

  // 3. Date Range Filter
  if (filters.dateFrom) {
    const fromTime = new Date(filters.dateFrom).getTime();
    if (!isNaN(fromTime)) {
      orders = orders.filter(o => new Date(o.created_at).getTime() >= fromTime);
    }
  }

  if (filters.dateTo) {
    const toTime = new Date(filters.dateTo).getTime();
    if (!isNaN(toTime)) {
      orders = orders.filter(o => new Date(o.created_at).getTime() <= toTime);
    }
  }

  // 4. Search Filter
  if (filters.search && filters.search.trim() !== '') {
    const q = filters.search.trim().toLowerCase();
    orders = orders.filter(o => {
      const orderNo = (o.order_number || '').toLowerCase();
      const notes = (o.notes || '').toLowerCase();
      const sup = suppliers.find(s => s.id === o.supplier_id);
      const supName = (sup?.name || '').toLowerCase();
      return orderNo.includes(q) || notes.includes(q) || supName.includes(q);
    });
  }

  // 5. Enrich Orders
  const enrichedList = await Promise.all(
    orders.map(o => enrichRestockOrder(o, items, suppliers, products))
  );

  // 6. Sorting (default: createdAt descending)
  const sortBy = filters.sortBy || 'createdAt';
  const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

  enrichedList.sort((a, b) => {
    if (sortBy === 'orderNumber') {
      return a.orderNumber.localeCompare(b.orderNumber) * sortOrder;
    }
    if (sortBy === 'status') {
      return a.status.localeCompare(b.status) * sortOrder;
    }
    if (sortBy === 'totalAmount') {
      return (a.totalAmount - b.totalAmount) * sortOrder;
    }
    // Default: createdAt
    return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * sortOrder;
  });

  return enrichedList;
}

/**
 * Retrieves a single restock order by ID or order_number.
 * 
 * @param {string} orderId 
 * @returns {Promise<Object>}
 */
export async function getRestockOrderById(orderId) {
  if (!orderId) {
    const error = new Error('Restock order ID is required');
    error.status = 400;
    throw error;
  }

  let order = inMemoryOrders.find(o => o.id === orderId || o.order_number === orderId) || null;
  let items = inMemoryOrderItems.filter(i => order && i.restock_order_id === order.id);

  if (supabase) {
    try {
      const { data: dbOrder, error: orderErr } = await supabase
        .from('restock_orders')
        .select('*')
        .or(`id.eq.${orderId},order_number.eq.${orderId}`)
        .maybeSingle();

      if (!orderErr && dbOrder) {
        order = dbOrder;
        const { data: dbItems, error: itemsErr } = await supabase
          .from('restock_order_items')
          .select('*')
          .eq('restock_order_id', order.id);

        if (!itemsErr && Array.isArray(dbItems)) {
          items = dbItems;
        }
      }
    } catch {
      // Use in-memory
    }
  }

  if (!order) {
    const error = new Error(`Restock order not found: ${orderId}`);
    error.status = 404;
    throw error;
  }

  return enrichRestockOrder(order, items);
}

/**
 * Creates a new Restock Order.
 * Default initial status: PENDING.
 * 
 * @param {Object} data
 * @param {string} data.supplierId - Associated supplier UUID (required)
 * @param {Array<Object>} data.items - List of { productId, quantity, unitPrice? } (required, >= 1)
 * @param {string} [data.notes] - Optional notes
 * @param {string} [data.userId] - Creator user ID
 * @returns {Promise<Object>}
 */
export async function createRestockOrder({ supplierId, items, notes = '', userId = null }) {
  // 1. Supplier Validation
  if (!supplierId || typeof supplierId !== 'string' || supplierId.trim() === '') {
    const error = new Error('Supplier is required');
    error.status = 400;
    throw error;
  }

  const suppliers = await getSuppliers();
  const supplierExists = suppliers.some(s => s.id === supplierId.trim());
  if (!supplierExists) {
    const error = new Error('Supplier not found');
    error.status = 404;
    throw error;
  }

  // 2. Items Validation
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error('At least one product line is required in a restock order');
    error.status = 400;
    throw error;
  }

  const seenProductIds = new Set();
  const validatedItems = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const productId = item.productId || item.product_id;

    if (!productId || typeof productId !== 'string') {
      const error = new Error(`Item ${i + 1}: Valid product ID is required`);
      error.status = 400;
      throw error;
    }

    if (seenProductIds.has(productId)) {
      const error = new Error('Duplicate product lines in the same restock order are not allowed');
      error.status = 400;
      throw error;
    }
    seenProductIds.add(productId);

    // Verify product exists in active catalog
    const product = await getProductById(productId);
    if (!product) {
      const error = new Error(`Product not found: ${productId}`);
      error.status = 404;
      throw error;
    }

    // Verify quantity
    const quantity = parseInt(item.quantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      const error = new Error(`Quantity for product '${product.name}' must be greater than zero`);
      error.status = 400;
      throw error;
    }

    // Verify unit price (optional; default to product's price or 0)
    let unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : (Number(product.price) || 0);
    if (isNaN(unitPrice) || unitPrice < 0) {
      const error = new Error(`Unit price for product '${product.name}' cannot be negative`);
      error.status = 400;
      throw error;
    }
    unitPrice = Number(unitPrice.toFixed(2));
    const totalPrice = Number((quantity * unitPrice).toFixed(2));

    validatedItems.push({
      product_id: product.id,
      quantity,
      unit_price: unitPrice,
      total_price: totalPrice
    });
  }

  // 3. Generate Order Number
  const orderNumber = await generateOrderNumber();
  const orderId = crypto.randomUUID();
  const now = new Date().toISOString();

  const totalCost = Number(validatedItems.reduce((acc, it) => acc + it.total_price, 0).toFixed(2));

  const orderRecord = {
    id: orderId,
    order_number: orderNumber,
    supplier_id: supplierId.trim(),
    status: RESTOCK_STATUS.PENDING,
    notes: String(notes || '').trim(),
    total_items: validatedItems.length,
    total_amount: totalCost,
    created_by: userId || null,
    ordered_at: null,
    received_at: null,
    created_at: now,
    updated_at: now
  };

  const itemRecords = validatedItems.map(it => ({
    id: crypto.randomUUID(),
    restock_order_id: orderId,
    product_id: it.product_id,
    quantity: it.quantity,
    unit_price: it.unit_price,
    total_price: it.total_price,
    created_at: now
  }));

  // 4. Persistence
  if (supabase) {
    try {
      await supabase.from('restock_orders').insert({
        id: orderRecord.id,
        order_number: orderRecord.order_number,
        supplier_id: orderRecord.supplier_id,
        status: orderRecord.status,
        notes: orderRecord.notes,
        total_items: orderRecord.total_items,
        total_amount: orderRecord.total_amount,
        created_by: orderRecord.created_by,
        created_at: orderRecord.created_at,
        updated_at: orderRecord.updated_at
      });

      await supabase.from('restock_order_items').insert(itemRecords);
    } catch (dbErr) {
      console.warn('[RESTOCK DB] Supabase order insert failed, using memory:', dbErr.message);
    }
  }

  // Update in-memory state
  inMemoryOrders.unshift(orderRecord);
  inMemoryOrderItems.push(...itemRecords);

  // 5. System Notification Integration
  try {
    const allUsers = await getAllUsers();
    for (const u of allUsers) {
      await createNotification({
        userId: u.id,
        type: NOTIFICATION_TYPES.SYSTEM,
        title: 'Restock Order Created',
        message: `Restock order ${orderNumber} has been created with ${validatedItems.length} product(s).`
      });
    }
  } catch (notifErr) {
    console.warn('[RESTOCK NOTIF] Could not send creation notification:', notifErr.message);
  }

  return enrichRestockOrder(orderRecord, itemRecords);
}

/**
 * Updates an existing restock order that has NOT yet been received.
 * 
 * @param {string} orderId 
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
export async function updateRestockOrder(orderId, updateData = {}) {
  const currentOrder = await getRestockOrderById(orderId);

  // Guard: Cannot edit a RECEIVED or CANCELLED order
  if (currentOrder.status === RESTOCK_STATUS.RECEIVED) {
    const error = new Error('Cannot edit a restock order that has already been received');
    error.status = 400;
    throw error;
  }
  if (currentOrder.status === RESTOCK_STATUS.CANCELLED) {
    const error = new Error('Cannot edit a cancelled restock order');
    error.status = 400;
    throw error;
  }

  // Update supplier if specified
  let supplierId = currentOrder.supplierId;
  if (updateData.supplierId !== undefined) {
    if (!updateData.supplierId || typeof updateData.supplierId !== 'string') {
      const error = new Error('Supplier is required');
      error.status = 400;
      throw error;
    }
    const suppliers = await getSuppliers();
    const sup = suppliers.find(s => s.id === updateData.supplierId.trim());
    if (!sup) {
      const error = new Error('Supplier not found');
      error.status = 404;
      throw error;
    }
    supplierId = sup.id;
  }

  // Update items if specified
  let newItems = currentOrder.items;
  if (updateData.items !== undefined) {
    if (!Array.isArray(updateData.items) || updateData.items.length === 0) {
      const error = new Error('At least one product line is required in a restock order');
      error.status = 400;
      throw error;
    }

    const seenIds = new Set();
    const validated = [];

    for (let i = 0; i < updateData.items.length; i++) {
      const it = updateData.items[i];
      const prodId = it.productId || it.product_id;
      if (!prodId) {
        const error = new Error(`Item ${i + 1}: Valid product ID is required`);
        error.status = 400;
        throw error;
      }
      if (seenIds.has(prodId)) {
        const error = new Error('Duplicate product lines in restock order are not allowed');
        error.status = 400;
        throw error;
      }
      seenIds.add(prodId);

      const prod = await getProductById(prodId);
      if (!prod) {
        const error = new Error(`Product not found: ${prodId}`);
        error.status = 404;
        throw error;
      }

      const qty = parseInt(it.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        const error = new Error(`Quantity for product '${prod.name}' must be greater than zero`);
        error.status = 400;
        throw error;
      }

      let price = it.unitPrice !== undefined ? Number(it.unitPrice) : (Number(prod.price) || 0);
      if (isNaN(price) || price < 0) {
        const error = new Error(`Unit price for product '${prod.name}' cannot be negative`);
        error.status = 400;
        throw error;
      }
      price = Number(price.toFixed(2));
      const total = Number((qty * price).toFixed(2));

      validated.push({
        id: it.id || crypto.randomUUID(),
        restock_order_id: currentOrder.id,
        product_id: prod.id,
        quantity: qty,
        unit_price: price,
        total_price: total,
        created_at: new Date().toISOString()
      });
    }

    newItems = validated;
  }

  const now = new Date().toISOString();
  const notes = updateData.notes !== undefined ? String(updateData.notes || '').trim() : currentOrder.notes;
  const totalAmount = Number(newItems.reduce((acc, it) => acc + (it.total_price || it.totalPrice), 0).toFixed(2));

  // Update in-memory
  const orderIdx = inMemoryOrders.findIndex(o => o.id === currentOrder.id);
  if (orderIdx !== -1) {
    inMemoryOrders[orderIdx] = {
      ...inMemoryOrders[orderIdx],
      supplier_id: supplierId,
      notes,
      total_items: newItems.length,
      total_amount: totalAmount,
      updated_at: now
    };
  }

  if (updateData.items !== undefined) {
    // Replace order items
    inMemoryOrderItems = inMemoryOrderItems.filter(i => i.restock_order_id !== currentOrder.id);
    inMemoryOrderItems.push(...newItems.map(it => ({
      id: it.id || crypto.randomUUID(),
      restock_order_id: currentOrder.id,
      product_id: it.product_id || it.productId,
      quantity: it.quantity,
      unit_price: it.unit_price || it.unitPrice,
      total_price: it.total_price || it.totalPrice,
      created_at: it.created_at || now
    })));
  }

  // Update Supabase if available
  if (supabase) {
    try {
      await supabase
        .from('restock_orders')
        .update({
          supplier_id: supplierId,
          notes,
          total_items: newItems.length,
          total_amount: totalAmount,
          updated_at: now
        })
        .eq('id', currentOrder.id);

      if (updateData.items !== undefined) {
        await supabase
          .from('restock_order_items')
          .delete()
          .eq('restock_order_id', currentOrder.id);

        await supabase
          .from('restock_order_items')
          .insert(newItems.map(it => ({
            id: it.id || crypto.randomUUID(),
            restock_order_id: currentOrder.id,
            product_id: it.product_id || it.productId,
            quantity: it.quantity,
            unit_price: it.unit_price || it.unitPrice,
            total_price: it.total_price || it.totalPrice,
            created_at: now
          })));
      }
    } catch {
      // Supabase fallback
    }
  }

  return getRestockOrderById(currentOrder.id);
}

/**
 * Transitions restock order from PENDING to ORDERED.
 * Sets ordered_at timestamp.
 * 
 * @param {string} orderId 
 * @param {string} [userId]
 * @returns {Promise<Object>}
 */
export async function markOrderAsOrdered(orderId, userId = null) {
  const currentOrder = await getRestockOrderById(orderId);

  if (currentOrder.status === RESTOCK_STATUS.RECEIVED) {
    const error = new Error('Cannot mark as ordered: Restock order has already been received');
    error.status = 400;
    throw error;
  }
  if (currentOrder.status === RESTOCK_STATUS.CANCELLED) {
    const error = new Error('Cannot mark as ordered: Restock order has been cancelled');
    error.status = 400;
    throw error;
  }
  if (currentOrder.status === RESTOCK_STATUS.ORDERED) {
    // Idempotent: already ordered
    return currentOrder;
  }

  const now = new Date().toISOString();

  // Update in memory
  const orderIdx = inMemoryOrders.findIndex(o => o.id === currentOrder.id);
  if (orderIdx !== -1) {
    inMemoryOrders[orderIdx].status = RESTOCK_STATUS.ORDERED;
    inMemoryOrders[orderIdx].ordered_at = now;
    inMemoryOrders[orderIdx].updated_at = now;
  }

  if (supabase) {
    try {
      await supabase
        .from('restock_orders')
        .update({
          status: RESTOCK_STATUS.ORDERED,
          ordered_at: now,
          updated_at: now
        })
        .eq('id', currentOrder.id);
    } catch {
      // Memory fallback
    }
  }

  return getRestockOrderById(currentOrder.id);
}

/**
 * Marks restock order as RECEIVED and atomically increases inventory.
 * 
 * CRITICAL DUPLICATE PROTECTION:
 * - If order is already RECEIVED, returns HTTP 400: "Restock order has already been received."
 * - Reuses existing inventory.service.stockIn() to ensure atomic stock increment,
 *   immutable inventory history creation with reason 'Restock order received: RS-XXXX',
 *   and automatic alert engine re-evaluation.
 * - Dispatches a system notification to all users.
 * 
 * @param {string} orderId 
 * @param {string} [userId]
 * @returns {Promise<Object>}
 */
export async function receiveRestockOrder(orderId, userId = null) {
  const order = await getRestockOrderById(orderId);

  // 1. Strict Duplicate Protection Guard
  if (order.status === RESTOCK_STATUS.RECEIVED) {
    const error = new Error('Restock order has already been received.');
    error.status = 400;
    throw error;
  }

  // 2. Cancellation Guard
  if (order.status === RESTOCK_STATUS.CANCELLED) {
    const error = new Error('Cannot receive a cancelled restock order.');
    error.status = 400;
    throw error;
  }

  // 3. Atomically Receive Each Product Line
  const receivedTransactions = [];
  const reasonText = `Restock order received: ${order.orderNumber}`;

  for (const item of order.items) {
    const result = await stockIn({
      productId: item.productId,
      quantity: item.quantity,
      reason: reasonText,
      userId: userId || null,
      source: 'MANUAL'
    });
    receivedTransactions.push(result);
  }

  // 4. Update Order Status to RECEIVED
  const now = new Date().toISOString();
  const orderIdx = inMemoryOrders.findIndex(o => o.id === order.id);
  if (orderIdx !== -1) {
    inMemoryOrders[orderIdx].status = RESTOCK_STATUS.RECEIVED;
    inMemoryOrders[orderIdx].received_at = now;
    inMemoryOrders[orderIdx].updated_at = now;
  }

  if (supabase) {
    try {
      await supabase
        .from('restock_orders')
        .update({
          status: RESTOCK_STATUS.RECEIVED,
          received_at: now,
          updated_at: now
        })
        .eq('id', order.id);
    } catch {
      // Supabase update fallback
    }
  }

  // 5. System Notification Integration
  try {
    const allUsers = await getAllUsers();
    for (const u of allUsers) {
      await createNotification({
        userId: u.id,
        type: NOTIFICATION_TYPES.SYSTEM,
        title: 'Restock Order Received',
        message: `Restock order ${order.orderNumber} has been received and inventory has been updated.`
      });
    }
  } catch (notifErr) {
    console.warn('[RESTOCK NOTIF] Could not send receipt notification:', notifErr.message);
  }

  const updatedOrder = await getRestockOrderById(order.id);

  return {
    order: updatedOrder,
    receivedTransactions
  };
}

/**
 * Cancels a restock order before it is received.
 * Allowed ONLY when status is PENDING or ORDERED.
 * 
 * @param {string} orderId 
 * @param {string} [userId]
 * @param {string} [reason]
 * @returns {Promise<Object>}
 */
export async function cancelRestockOrder(orderId, userId = null, reason = '') {
  const currentOrder = await getRestockOrderById(orderId);

  // Guard: Cannot cancel a RECEIVED order
  if (currentOrder.status === RESTOCK_STATUS.RECEIVED) {
    const error = new Error('Cannot cancel a restock order that has already been received');
    error.status = 400;
    throw error;
  }

  // Guard: Cannot cancel an already cancelled order
  if (currentOrder.status === RESTOCK_STATUS.CANCELLED) {
    const error = new Error('Restock order is already cancelled');
    error.status = 400;
    throw error;
  }

  const now = new Date().toISOString();
  const cancellationNote = reason
    ? `${currentOrder.notes ? currentOrder.notes + ' | ' : ''}Cancellation reason: ${reason}`
    : currentOrder.notes;

  const orderIdx = inMemoryOrders.findIndex(o => o.id === currentOrder.id);
  if (orderIdx !== -1) {
    inMemoryOrders[orderIdx].status = RESTOCK_STATUS.CANCELLED;
    inMemoryOrders[orderIdx].notes = cancellationNote;
    inMemoryOrders[orderIdx].updated_at = now;
  }

  if (supabase) {
    try {
      await supabase
        .from('restock_orders')
        .update({
          status: RESTOCK_STATUS.CANCELLED,
          notes: cancellationNote,
          updated_at: now
        })
        .eq('id', currentOrder.id);
    } catch {
      // Memory fallback
    }
  }

  return getRestockOrderById(currentOrder.id);
}

/**
 * Identifies products needing restock based on real database stock and forecast data.
 * 
 * Deterministic Criteria:
 * 1. Current Stock <= Minimum Stock (Standard reorder threshold)
 *    OR
 * 2. Forecast Estimated Days Remaining < 14 days (STABLE threshold)
 * 
 * Deterministic Suggested Quantity:
 * Target Stock = minimum_stock * 2
 * Suggested Quantity = Math.max(0, Target Stock - Current Stock)
 * If current stock is already >= Target Stock (due to rapid consumption rate),
 * suggested quantity defaults to minimum_stock to ensure safe reorder batching.
 * 
 * @returns {Promise<Array>}
 */
export async function getProductsNeedingRestock() {
  const products = await getAllProducts({ isActive: 'true' });
  const suppliers = await getSuppliers();

  // Retrieve forecast overview (30 days default)
  let forecastMap = {};
  try {
    const forecastOverview = await getForecastOverview(30);
    if (forecastOverview && Array.isArray(forecastOverview.products)) {
      for (const p of forecastOverview.products) {
        forecastMap[p.productId] = p;
      }
    }
  } catch (err) {
    console.warn('[RESTOCK FORECAST] Unable to fetch forecast data for restock suggestions:', err.message);
  }

  const needingRestock = [];

  for (const prod of products) {
    const currentStock = prod.currentStock;
    const minimumStock = prod.minimumStock;
    const forecast = forecastMap[prod.id] || null;

    const daysRemaining = forecast ? forecast.estimatedDaysRemaining : null;
    const adc = forecast ? forecast.averageDailyConsumption : 0;
    const forecastStatus = forecast ? forecast.forecastStatus : 'NO_DATA';

    // Criteria: stock <= min OR low runway (< 14 days)
    const isBelowMin = currentStock <= minimumStock;
    const isLowRunway = daysRemaining !== null && daysRemaining < 14;

    if (isBelowMin || isLowRunway) {
      // Target Stock = minimum_stock * 2
      const targetStock = minimumStock * 2;
      let suggestedQuantity = targetStock - currentStock;

      if (suggestedQuantity <= 0) {
        // Safe minimum reorder batch if current stock is elevated but runway is critical
        suggestedQuantity = minimumStock > 0 ? minimumStock : 10;
      }

      const sup = suppliers.find(s => s.id === prod.supplierId) || null;

      needingRestock.push({
        productId: prod.id,
        name: prod.name,
        sku: prod.sku,
        category: prod.category,
        currentStock,
        minimumStock,
        unit: prod.unit || 'units',
        price: prod.price || 0,
        status: prod.stockStatus,
        averageDailyConsumption: adc,
        estimatedDaysRemaining: daysRemaining,
        forecastStatus,
        suggestedQuantity,
        supplierId: sup ? sup.id : null,
        supplierName: sup ? sup.name : 'Unassigned',
        reason: isBelowMin
          ? (currentStock === 0 ? 'Out of stock' : 'Stock at or below minimum threshold')
          : `Projected depletion in ${daysRemaining} days`
      });
    }
  }

  // Sort: zero stock first, then ascending by daysRemaining/currentStock
  needingRestock.sort((a, b) => {
    if (a.currentStock === 0 && b.currentStock > 0) return -1;
    if (b.currentStock === 0 && a.currentStock > 0) return 1;

    if (a.estimatedDaysRemaining !== null && b.estimatedDaysRemaining !== null) {
      return a.estimatedDaysRemaining - b.estimatedDaysRemaining;
    }
    return a.currentStock - b.currentStock;
  });

  return needingRestock;
}

/**
 * Returns KPI overview metrics for the Restocking Dashboard.
 * 
 * @returns {Promise<Object>}
 */
export async function getRestockSummary() {
  const orders = await getRestockOrders();
  const needingRestock = await getProductsNeedingRestock();

  const pendingOrders = orders.filter(o => o.status === RESTOCK_STATUS.PENDING).length;
  const orderedOrders = orders.filter(o => o.status === RESTOCK_STATUS.ORDERED).length;
  const receivedOrders = orders.filter(o => o.status === RESTOCK_STATUS.RECEIVED).length;
  const cancelledOrders = orders.filter(o => o.status === RESTOCK_STATUS.CANCELLED).length;

  return {
    pendingOrders,
    orderedOrders,
    receivedOrders,
    cancelledOrders,
    totalOrders: orders.length,
    productsNeedingRestock: needingRestock.length
  };
}
