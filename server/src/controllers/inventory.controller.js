import * as inventoryService from '../services/inventory.service.js';

/**
 * GET /api/inventory
 * Retrieves current inventory levels for products.
 */
export async function getInventory(req, res, next) {
  try {
    const data = await inventoryService.getInventory(req.query);
    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/inventory/:productId
 * Retrieves inventory details for a specific product.
 */
export async function getInventoryByProduct(req, res, next) {
  try {
    const data = await inventoryService.getInventoryByProduct(req.params.productId);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/inventory/stock-in
 * Records stock received / added to inventory.
 */
export async function stockIn(req, res, next) {
  try {
    const { productId, quantity, reason } = req.body;
    const userId = req.user?.userId;

    const result = await inventoryService.stockIn({
      productId,
      quantity,
      reason,
      userId
    });

    res.status(200).json({
      success: true,
      message: 'Stock-in recorded successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/inventory/stock-out
 * Records stock sold or depleted, enforcing strict positive inventory limits.
 */
export async function stockOut(req, res, next) {
  try {
    const { productId, quantity, reason } = req.body;
    const userId = req.user?.userId;

    const result = await inventoryService.stockOut({
      productId,
      quantity,
      reason,
      userId
    });

    res.status(200).json({
      success: true,
      message: 'Stock-out recorded successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/inventory/adjust
 * Adjusts stock level to an absolute physical inventory count (MANAGER only).
 */
export async function adjustStock(req, res, next) {
  try {
    const { productId, newStock, reason } = req.body;
    const userId = req.user?.userId;

    const result = await inventoryService.adjustStock({
      productId,
      newStock,
      reason,
      userId
    });

    res.status(200).json({
      success: true,
      message: 'Stock adjustment recorded successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/inventory/history
 * Retrieves audit log of inventory movements with optional filters.
 */
export async function getInventoryHistory(req, res, next) {
  try {
    const data = await inventoryService.getInventoryHistory(req.query);
    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/inventory/:productId/history
 * Retrieves audit log for a single product.
 */
export async function getProductHistory(req, res, next) {
  try {
    const data = await inventoryService.getProductHistory(req.params.productId);
    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
}
