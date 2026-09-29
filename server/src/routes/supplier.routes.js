/**
 * SmartStock Supplier Routes (Phase 12)
 * 
 * Defines routing endpoints and role-based access control for Supplier Management.
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import * as supplierController from '../controllers/supplier.controller.js';

const router = express.Router();

// Read endpoints: Accessible by both MANAGER and STAFF
router.get('/', authenticateToken, supplierController.getSuppliers);
router.get('/:id', authenticateToken, supplierController.getSupplierById);
router.get('/:id/products', authenticateToken, supplierController.getSupplierProducts);
router.get('/:id/restock-orders', authenticateToken, supplierController.getSupplierRestockOrders);

// Mutation endpoints: Restricted strictly to MANAGER
router.post('/', authenticateToken, authorizeRoles('MANAGER'), supplierController.createSupplier);
router.put('/:id', authenticateToken, authorizeRoles('MANAGER'), supplierController.updateSupplier);
router.patch('/:id/status', authenticateToken, authorizeRoles('MANAGER'), supplierController.updateSupplierStatus);

export default router;
