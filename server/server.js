import express from 'express';
import cors from 'cors';
import config, { validateEnv } from './src/config/env.js';
import './src/config/db.js';
import authRoutes from './src/routes/auth.routes.js';
import productRoutes from './src/routes/product.routes.js';
import supplierRoutes from './src/routes/supplier.routes.js';
import dashboardRoutes from './src/routes/dashboard.routes.js';
import inventoryRoutes from './src/routes/inventory.routes.js';
import alertRoutes from './src/routes/alert.routes.js';
import iotRoutes from './src/routes/iot.routes.js';
import { notFoundHandler, errorHandler } from './src/middleware/error.middleware.js';

// Validate environment variables on startup
validateEnv();

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());

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

// 404 & Centralized Error Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
const server = app.listen(config.port, () => {
  console.log(`[SmartStock Server] Running on http://localhost:${config.port}`);
  console.log(`[SmartStock Server] Health check available at: http://localhost:${config.port}/api/health`);
});

export default app;
