import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as productController from '../controllers/product.controller.js';

const router = express.Router();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard summary statistics calculated from real products database
 * @access  Protected (STAFF, MANAGER)
 */
router.get('/stats', authenticateToken, productController.getDashboardStats);

export default router;
