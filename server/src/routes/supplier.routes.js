import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as productController from '../controllers/product.controller.js';

const router = express.Router();

/**
 * @route   GET /api/suppliers
 * @desc    Get list of suppliers for product assignment
 * @access  Protected (STAFF, MANAGER)
 */
router.get('/', authenticateToken, productController.getSuppliers);

export default router;
