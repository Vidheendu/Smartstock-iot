import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as alertController from '../controllers/alert.controller.js';

const router = express.Router();

// All alert endpoints require authentication (MANAGER & STAFF)
router.use(authenticateToken);

// 1. GET /api/alerts — Fetch all alerts (with optional filtering)
router.get('/', alertController.getAlerts);

// 2. GET /api/alerts/summary — Fetch active alert counter summary
router.get('/summary', alertController.getAlertSummary);

// 3. GET /api/alerts/:id — Fetch single alert with details
router.get('/:id', alertController.getAlertById);

// 4. PATCH /api/alerts/:id/acknowledge — Acknowledge an active alert
router.patch('/:id/acknowledge', alertController.acknowledgeAlert);

// 5. PATCH /api/alerts/:id/resolve — Resolve an alert
router.patch('/:id/resolve', alertController.resolveAlert);

export default router;
