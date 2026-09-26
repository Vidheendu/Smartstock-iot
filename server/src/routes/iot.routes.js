import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as iotController from '../controllers/iot.controller.js';

const router = express.Router();

// All IoT simulation endpoints require authentication
router.use(authenticateToken);

// 1. GET /api/iot/devices — Fetch all simulated devices
router.get('/devices', iotController.getDevices);

// 2. POST /api/iot/simulate — Send software simulated telemetry reading
router.post('/simulate', iotController.simulateTelemetry);

export default router;
