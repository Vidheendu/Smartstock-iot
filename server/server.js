import express from 'express';
import cors from 'cors';
import config, { validateEnv } from './src/config/env.js';
import './src/config/db.js';
import { securityHeaders } from './src/middleware/security.middleware.js';
import { authRateLimiter, generalRateLimiter } from './src/middleware/rateLimit.middleware.js';
import authRoutes from './src/routes/auth.routes.js';
import productRoutes from './src/routes/product.routes.js';
import supplierRoutes from './src/routes/supplier.routes.js';
import dashboardRoutes from './src/routes/dashboard.routes.js';
import inventoryRoutes from './src/routes/inventory.routes.js';
import alertRoutes from './src/routes/alert.routes.js';
import iotRoutes from './src/routes/iot.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';
import analyticsRoutes from './src/routes/analytics.routes.js';
import forecastRoutes from './src/routes/forecast.routes.js';
import restockRoutes from './src/routes/restock.routes.js';
import settingsRoutes from './src/routes/settings.routes.js';
import { notFoundHandler, errorHandler } from './src/middleware/error.middleware.js';

// Validate environment variables on startup
validateEnv();

const app = express();

// 1. Disable framework identification
app.disable('x-powered-by');

// 2. HTTP Security Headers (Helmet-equivalent hardening)
app.use(securityHeaders);

// 3. Robust CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests or missing origin (e.g. tests, curl, mobile)
    if (!origin) return callback(null, true);

    if (config.allowedOrigins.includes(origin) || config.nodeEnv === 'development') {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: Not allowed by Access-Control-Allow-Origin'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// 4. Request Body Size Limit (1MB payload cap to prevent memory exhaustion)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 5. Rate Limiting Middleware
// Strict rate limit on authentication endpoints (brute-force defense)
app.use('/api/auth/login', authRateLimiter);
app.use('/api/auth/register', authRateLimiter);
app.use('/api/auth/change-password', authRateLimiter);

// General rate limiter on all API endpoints
app.use('/api', generalRateLimiter);

// Health Check Endpoint (Phase 1 Requirement)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'SmartStock API is running'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/simulation', iotRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/restock', restockRoutes);
app.use('/api/settings', settingsRoutes);

// 404 & Centralized Error Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
const server = app.listen(config.port, () => {
  console.log(`[SmartStock Server] Running on http://localhost:${config.port}`);
  console.log(`[SmartStock Server] Health check available at: http://localhost:${config.port}/api/health`);
});

export default app;
