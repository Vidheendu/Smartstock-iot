/**
 * SmartStock Restocking & Purchase Order Controller
 */

import * as restockService from '../services/restock.service.js';

/**
 * GET /api/restock
 * List all restock orders with filters (status, supplierId, search, dates, sorting).
 */
export async function getOrders(req, res, next) {
  try {
    const { status, dateFrom, dateTo, search, sortBy, sortOrder } = req.query;

    if (status && !['ALL', 'PENDING', 'ORDERED', 'RECEIVED', 'CANCELLED'].includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status filter '${status}'. Allowed: ALL, PENDING, ORDERED, RECEIVED, CANCELLED`
      });
    }

    if (dateFrom && dateTo) {
      const fromTime = new Date(dateFrom).getTime();
      const toTime = new Date(dateTo).getTime();
      if (isNaN(fromTime) || isNaN(toTime)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format in dateFrom or dateTo'
        });
      }
      if (fromTime > toTime) {
        return res.status(400).json({
          success: false,
          message: 'dateFrom must be before or equal to dateTo'
        });
      }
    }

    const filters = {
      status: status ? status.toUpperCase() : undefined,
      supplierId: req.query.supplierId || req.query.supplier,
      search: search ? String(search).trim().slice(0, 100) : undefined,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder
    };

    const orders = await restockService.getRestockOrders(filters);
    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/restock/summary
 * KPI summary metrics for the restocking page.
 */
export async function getSummary(req, res, next) {
  try {
    const summary = await restockService.getRestockSummary();
    return res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/restock/needing-restock
 * List of products needing replenishment with suggested quantities.
 */
export async function getNeedingRestock(req, res, next) {
  try {
    const products = await restockService.getProductsNeedingRestock();
    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/restock/:id
 * Retrieve details for a single restock order by ID or order_number.
 */
export async function getOrderById(req, res, next) {
  try {
    const order = await restockService.getRestockOrderById(req.params.id);
    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/restock
 * Create a new restock order (MANAGER only).
 */
export async function createOrder(req, res, next) {
  try {
    const { supplierId, supplier_id, items, notes } = req.body;
    const effectiveSupplierId = supplierId || supplier_id;

    const order = await restockService.createRestockOrder({
      supplierId: effectiveSupplierId,
      items,
      notes,
      userId: req.user?.id
    });

    return res.status(201).json({
      success: true,
      message: `Restock order ${order.orderNumber} created successfully`,
      order
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/restock/:id
 * Update an order before it has been received (MANAGER only).
 */
export async function updateOrder(req, res, next) {
  try {
    const { supplierId, supplier_id, items, notes } = req.body;
    const effectiveSupplierId = supplierId !== undefined ? supplierId : supplier_id;

    const order = await restockService.updateRestockOrder(req.params.id, {
      supplierId: effectiveSupplierId,
      items,
      notes,
      userId: req.user?.id
    });

    return res.status(200).json({
      success: true,
      message: `Restock order ${order.orderNumber} updated successfully`,
      order
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/restock/:id/order
 * Transition order status from PENDING to ORDERED (MANAGER only).
 */
export async function markOrdered(req, res, next) {
  try {
    const order = await restockService.markOrderAsOrdered(req.params.id, req.user?.id);
    return res.status(200).json({
      success: true,
      message: `Restock order ${order.orderNumber} marked as ORDERED`,
      order
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/restock/:id/receive
 * Mark order as RECEIVED, atomically increasing product stock and creating inventory history (MANAGER only).
 * Protected against duplicate receiving.
 */
export async function receiveOrder(req, res, next) {
  try {
    const result = await restockService.receiveRestockOrder(req.params.id, req.user?.id);
    return res.status(200).json({
      success: true,
      message: `Restock order ${result.order.orderNumber} successfully received and inventory updated`,
      order: result.order,
      receivedTransactions: result.receivedTransactions
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/restock/:id/cancel
 * Cancel order before receiving (MANAGER only).
 */
export async function cancelOrder(req, res, next) {
  try {
    const order = await restockService.cancelRestockOrder(
      req.params.id,
      req.user?.id,
      req.body?.reason || ''
    );
    return res.status(200).json({
      success: true,
      message: `Restock order ${order.orderNumber} cancelled`,
      order
    });
  } catch (error) {
    next(error);
  }
}
