import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as inventoryController from '../controllers/inventory.controller.js';
import {
  validateStockIn,
  validateStockOut,
  validateAdjust
} from '../validators/inventory.validator.js';

const router = express.Router();

/**
 * Custom role authorization middleware for inventory adjustments.
 * Enforces Part 27 requirement: STAFF receives HTTP 403 with specific message.
 */
const requireManagerForAdjustment = (req, res, next) => {
  if (!req.user || req.user.role !== 'MANAGER') {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to adjust inventory.'
    });
  }
  next();
};

// All inventory endpoints require valid authentication
router.use(authenticateToken);

// 1. GET /api/inventory — Overview of current inventory
router.get('/', inventoryController.getInventory);

// 2. GET /api/inventory/history — Global inventory audit trail (Placed before :productId)
router.get('/history', inventoryController.getInventoryHistory);

// 3. GET /api/inventory/:productId — Product specific inventory
router.get('/:productId', inventoryController.getInventoryByProduct);

// 4. GET /api/inventory/:productId/history — Product specific audit history
router.get('/:productId/history', inventoryController.getProductHistory);

// 5. POST /api/inventory/stock-in — Add received stock
router.post('/stock-in', validateStockIn, inventoryController.stockIn);

// 6. POST /api/inventory/stock-out — Deduct stock (cannot exceed available stock)
router.post('/stock-out', validateStockOut, inventoryController.stockOut);

// 7. POST /api/inventory/adjust — Manual physical inventory count adjustment (MANAGER only)
router.post('/adjust', requireManagerForAdjustment, validateAdjust, inventoryController.adjustStock);

export default router;
