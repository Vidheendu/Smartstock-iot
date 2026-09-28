/**
 * SmartStock Analytics Routes
 * 
 * Base: /api/analytics
 * All endpoints require authentication.
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as analyticsController from '../controllers/analytics.controller.js';

const router = express.Router();

// 1. Overview statistics (Products, Stock, Statuses, Transactions, Alerts, IoT)
router.get('/overview', authenticateToken, analyticsController.getOverview);

// 2. Inventory movement trends (Stock In vs Stock Out vs Adjustments)
router.get('/inventory-movement', authenticateToken, analyticsController.getInventoryMovement);

// 3. Category-wise stock analytics
router.get('/categories', authenticateToken, analyticsController.getCategories);

// 4. Product-level stock vs minimum threshold comparison & attention list
router.get('/products', authenticateToken, analyticsController.getProducts);

// 5. Alert trends, severity breakdown, and source distribution
router.get('/alerts', authenticateToken, analyticsController.getAlerts);

// 6. Simulated IoT telemetry insights, device activity, and battery status
router.get('/iot', authenticateToken, analyticsController.getIoT);

export default router;
