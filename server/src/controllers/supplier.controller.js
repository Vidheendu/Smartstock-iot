/**
 * SmartStock Supplier Controller (Phase 12)
 * 
 * Handles incoming HTTP requests for the Supplier Management module.
 * Validates request input, invokes supplier service, and formats HTTP responses.
 */

import * as supplierService from '../services/supplier.service.js';

/**
 * GET /api/suppliers
 * List suppliers with search, status filtering, hasActiveOrders, sorting, and pagination.
 */
export async function getSuppliers(req, res, next) {
  try {
    const { status, page, limit, search } = req.query;

    if (status && !['ALL', 'ACTIVE', 'INACTIVE'].includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status filter '${status}'. Allowed: ALL, ACTIVE, INACTIVE`
      });
    }

    let parsedPage = page !== undefined ? parseInt(page, 10) : undefined;
    if (parsedPage !== undefined && (isNaN(parsedPage) || parsedPage < 1)) {
      return res.status(400).json({
        success: false,
        message: 'Page parameter must be an integer greater than or equal to 1'
      });
    }

    let parsedLimit = limit !== undefined ? parseInt(limit, 10) : undefined;
    if (parsedLimit !== undefined && (isNaN(parsedLimit) || parsedLimit < 1)) {
      return res.status(400).json({
        success: false,
        message: 'Limit parameter must be an integer greater than or equal to 1'
      });
    }
    if (parsedLimit !== undefined && parsedLimit > 100) {
      parsedLimit = 100;
    }

    const params = {
      search: search ? String(search).trim().slice(0, 100) : undefined,
      status: status ? status.toUpperCase() : undefined,
      hasActiveOrders: req.query.hasActiveOrders,
      sort: req.query.sort || req.query.sortBy,
      order: req.query.order || req.query.sortOrder,
      page: parsedPage,
      limit: parsedLimit,
      activeOnly: req.query.activeOnly === 'true'
    };

    const result = await supplierService.getSuppliers(params);

    return res.status(200).json({
      success: true,
      count: result.data.length,
      data: result.data,
      pagination: result.pagination,
      summary: result.summary
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/suppliers/:id
 * Retrieve a supplier by ID with product summary, restock summary, and detailed statistics.
 */
export async function getSupplierById(req, res, next) {
  try {
    const supplier = await supplierService.getSupplierById(req.params.id);

    return res.status(200).json({
      success: true,
      data: supplier,
      supplier
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/suppliers
 * Create a new supplier (MANAGER only).
 */
export async function createSupplier(req, res, next) {
  try {
    const {
      name,
      contact_name,
      contact_person,
      contactPerson,
      contactName,
      email,
      phone,
      address,
      city,
      state,
      country,
      postal_code,
      postalCode,
      notes,
      lead_time_days,
      leadTimeDays,
      is_active,
      isActive
    } = req.body;

    const sanitizedData = {
      name,
      contact_person: contact_person || contactPerson || contact_name || contactName,
      email,
      phone,
      address,
      city,
      state,
      country,
      postal_code: postal_code || postalCode,
      notes,
      lead_time_days: lead_time_days || leadTimeDays,
      is_active: is_active !== undefined ? is_active : isActive
    };

    const supplier = await supplierService.createSupplier(sanitizedData);

    return res.status(201).json({
      success: true,
      message: `Supplier '${supplier.name}' created successfully`,
      data: supplier,
      supplier
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/suppliers/:id
 * Update an existing supplier (MANAGER only).
 */
export async function updateSupplier(req, res, next) {
  try {
    const {
      name,
      contact_name,
      contact_person,
      contactPerson,
      contactName,
      email,
      phone,
      address,
      city,
      state,
      country,
      postal_code,
      postalCode,
      notes,
      lead_time_days,
      leadTimeDays,
      is_active,
      isActive
    } = req.body;

    const sanitizedData = {
      name,
      contact_person: contact_person || contactPerson || contact_name || contactName,
      email,
      phone,
      address,
      city,
      state,
      country,
      postal_code: postal_code || postalCode,
      notes,
      lead_time_days: lead_time_days || leadTimeDays,
      is_active: is_active !== undefined ? is_active : isActive
    };

    const supplier = await supplierService.updateSupplier(req.params.id, sanitizedData);

    return res.status(200).json({
      success: true,
      message: `Supplier '${supplier.name}' updated successfully`,
      data: supplier,
      supplier
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/suppliers/:id/status
 * Activate or deactivate a supplier (MANAGER only).
 */
export async function updateSupplierStatus(req, res, next) {
  try {
    const isActive = req.body.is_active !== undefined ? req.body.is_active : req.body.isActive;
    if (isActive === undefined) {
      const error = new Error('is_active status boolean is required');
      error.status = 400;
      throw error;
    }

    const supplier = await supplierService.updateSupplierStatus(req.params.id, isActive);

    return res.status(200).json({
      success: true,
      message: `Supplier '${supplier.name}' ${supplier.isActive ? 'activated' : 'deactivated'} successfully`,
      data: supplier,
      supplier
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/suppliers/:id/products
 * Retrieve products supplied by a specific supplier.
 */
export async function getSupplierProducts(req, res, next) {
  try {
    const products = await supplierService.getSupplierProducts(req.params.id);

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
      products
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/suppliers/:id/restock-orders
 * Retrieve restock purchase orders associated with a specific supplier.
 */
export async function getSupplierRestockOrders(req, res, next) {
  try {
    const orders = await supplierService.getSupplierRestockOrders(req.params.id);

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
      orders
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  updateSupplierStatus,
  getSupplierProducts,
  getSupplierRestockOrders
};
