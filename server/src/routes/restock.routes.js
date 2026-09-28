/**
 * SmartStock Restocking & Purchase Order Routes
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import * as restockController from '../controllers/restock.controller.js';

const router = express.Router();

// Read endpoints: accessible by both MANAGER and STAFF
router.get('/', authenticateToken, restockController.getOrders);
router.get('/summary', authenticateToken, restockController.getSummary);
router.get('/needing-restock', authenticateToken, restockController.getNeedingRestock);
router.get('/:id', authenticateToken, restockController.getOrderById);

// Mutation endpoints: restricted strictly to MANAGER
router.post('/', authenticateToken, authorizeRoles('MANAGER'), restockController.createOrder);
router.put('/:id', authenticateToken, authorizeRoles('MANAGER'), restockController.updateOrder);
router.patch('/:id/order', authenticateToken, authorizeRoles('MANAGER'), restockController.markOrdered);
router.patch('/:id/receive', authenticateToken, authorizeRoles('MANAGER'), restockController.receiveOrder);
router.patch('/:id/cancel', authenticateToken, authorizeRoles('MANAGER'), restockController.cancelOrder);

export default router;
