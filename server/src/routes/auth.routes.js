import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', authenticateToken, authController.getMe);
router.get(
  '/manager-test',
  authenticateToken,
  authorizeRoles('MANAGER'),
  authController.managerTest
);
router.get(
  '/staff-test',
  authenticateToken,
  authorizeRoles('MANAGER', 'STAFF'),
  authController.staffTest
);

export default router;
