/**
 * SmartStock Forecasting Routes
 * 
 * Base: /api/forecast
 * Protected by authenticateToken middleware (STAFF and MANAGER allowed).
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as forecastController from '../controllers/forecast.controller.js';

const router = express.Router();

// 1. Overview forecast for all active products
router.get('/overview', authenticateToken, forecastController.getOverview);

// 2. Product-specific forecast
router.get('/products/:productId', authenticateToken, forecastController.getProductForecast);

// 3. Product-specific consumption history timeline
router.get('/products/:productId/consumption', authenticateToken, forecastController.getProductConsumption);

export default router;
