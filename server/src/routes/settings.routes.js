import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// User Preferences Routes (Both STAFF and MANAGER)
router.get('/preferences', authenticateToken, settingsController.getPreferences);
router.put('/preferences', authenticateToken, settingsController.updatePreferences);

export default router;
