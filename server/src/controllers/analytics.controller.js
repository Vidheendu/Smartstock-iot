/**
 * SmartStock Analytics Controller
 * 
 * Exposes endpoints for:
 * - GET /api/analytics/overview
 * - GET /api/analytics/inventory-movement
 * - GET /api/analytics/categories
 * - GET /api/analytics/products
 * - GET /api/analytics/alerts
 * - GET /api/analytics/iot
 */

import * as analyticsService from '../services/analytics.service.js';
import { parseRange } from '../utils/dateRange.js';

/**
 * GET /api/analytics/overview
 * Returns summary count metrics across products, inventory, alerts, and IoT.
 */
export async function getOverview(req, res, next) {
  try {
    const range = req.query.range ? parseRange(req.query.range) : '30d';
    const data = await analyticsService.getOverview(range);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/inventory-movement
 * Returns time-series movement breakdown: stock-in, stock-out, adjustments.
 */
export async function getInventoryMovement(req, res, next) {
  try {
    const range = parseRange(req.query.range);
    const data = await analyticsService.getInventoryMovement(range);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/categories
 * Returns inventory distribution and stock levels aggregated by product category.
 */
export async function getCategories(req, res, next) {
  try {
    const data = await analyticsService.getCategoryAnalytics();

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/products
 * Returns product stock comparison vs minimum threshold, status distribution,
 * and prioritised list of products requiring attention.
 */
export async function getProducts(req, res, next) {
  try {
    const data = await analyticsService.getProductAnalytics();

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/alerts
 * Returns alert trends, severity breakdown, and source distribution for the selected period.
 */
export async function getAlerts(req, res, next) {
  try {
    const range = parseRange(req.query.range);
    const data = await analyticsService.getAlertAnalytics(range);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/analytics/iot
 * Returns software-simulated IoT telemetry metrics, daily activity, and battery status.
 */
export async function getIoT(req, res, next) {
  try {
    const range = parseRange(req.query.range);
    const data = await analyticsService.getIoTAnalytics(range);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getOverview,
  getInventoryMovement,
  getCategories,
  getProducts,
  getAlerts,
  getIoT
};
