/**
 * SmartStock Forecasting Controller
 * 
 * Handles incoming HTTP requests for:
 * - GET /api/forecast/overview?period=30
 * - GET /api/forecast/products/:productId?period=30
 * - GET /api/forecast/products/:productId/consumption?period=30
 */

import * as forecastService from '../services/forecast.service.js';

/**
 * GET /api/forecast/overview
 * Returns storewide forecast metrics across all active products.
 */
export async function getOverview(req, res, next) {
  try {
    const period = req.query.period ? forecastService.parsePeriod(req.query.period) : forecastService.DEFAULT_FORECAST_PERIOD;
    const data = await forecastService.getForecastOverview(period);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/forecast/products/:productId
 * Returns detailed stock forecast for a single product.
 */
export async function getProductForecast(req, res, next) {
  try {
    const { productId } = req.params;
    const period = req.query.period ? forecastService.parsePeriod(req.query.period) : forecastService.DEFAULT_FORECAST_PERIOD;
    const data = await forecastService.getProductForecast(productId, period);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/forecast/products/:productId/consumption
 * Returns historical daily consumption breakdown for a single product.
 */
export async function getProductConsumption(req, res, next) {
  try {
    const { productId } = req.params;
    const period = req.query.period ? forecastService.parsePeriod(req.query.period) : forecastService.DEFAULT_FORECAST_PERIOD;
    const data = await forecastService.getProductConsumption(productId, period);

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
  getProductForecast,
  getProductConsumption
};
