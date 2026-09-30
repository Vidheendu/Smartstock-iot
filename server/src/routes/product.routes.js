import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { validateProductMiddleware, validateProductQueryMiddleware } from '../validators/product.validator.js';
import * as productController from '../controllers/product.controller.js';

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    List products with optional search, category, status, and active filters
 * @access  Protected (STAFF, MANAGER)
 */
router.get('/', authenticateToken, validateProductQueryMiddleware, productController.getProducts);

/**
 * @route   GET /api/products/:id/details
 * @desc    Get consolidated product details, inventory, supplier, IoT, forecast, alerts & restock data
 * @access  Protected (STAFF, MANAGER)
 */
router.get('/:id/details', authenticateToken, productController.getProductDetails);

/**
 * @route   GET /api/products/:id
 * @desc    Get details for a single product
 * @access  Protected (STAFF, MANAGER)
 */
router.get('/:id', authenticateToken, productController.getProductById);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Protected (MANAGER only)
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles('MANAGER'),
  validateProductMiddleware,
  productController.createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update an existing product
 * @access  Protected (MANAGER only)
 */
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('MANAGER'),
  validateProductMiddleware,
  productController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Soft delete (deactivate) product
 * @access  Protected (MANAGER only; STAFF receives 403)
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('MANAGER'),
  productController.deleteProduct
);

export default router;
