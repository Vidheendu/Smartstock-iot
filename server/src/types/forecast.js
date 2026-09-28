/**
 * TypeScript / JSDoc Type Definitions for SmartStock Forecasting Module
 * 
 * Defines standard interfaces for:
 * - ProductForecastItem
 * - ForecastOverviewResponse
 * - ProductConsumptionResponse
 * - ForecastStatus
 */

export const FORECAST_PERIODS = Object.freeze([7, 30, 90]);
export const DEFAULT_FORECAST_PERIOD = 30;

export const FORECAST_STATUS = Object.freeze({
  STABLE: 'STABLE',             // >= 14 days
  ATTENTION: 'ATTENTION',       // 7 - 13.9 days
  URGENT: 'URGENT',             // < 7 days
  OUT_OF_STOCK: 'OUT_OF_STOCK', // Current stock = 0
  NO_DATA: 'NO_DATA'            // ADC = 0 or no consumption data
});

/**
 * @typedef {Object} ProductForecastItem
 * @property {string} productId
 * @property {string} productName
 * @property {string} sku
 * @property {string} category
 * @property {string} unit
 * @property {number} currentStock
 * @property {number} minimumStock
 * @property {number} totalConsumed
 * @property {number} averageDailyConsumption
 * @property {number|null} estimatedDaysRemaining
 * @property {string|null} projectedDepletionDate
 * @property {number} periodDays
 * @property {number} consumptionRecordsCount
 * @property {boolean} consumptionDataAvailable
 * @property {boolean} forecastAvailable
 * @property {string} forecastStatus - 'STABLE' | 'ATTENTION' | 'URGENT' | 'OUT_OF_STOCK' | 'NO_DATA'
 * @property {string} dataConfidence - 'HIGH' | 'LIMITED' | 'NONE'
 */

/**
 * @typedef {Object} ForecastOverviewSummary
 * @property {number} totalProducts
 * @property {number} productsWithForecast
 * @property {number} productsNoData
 * @property {number} productsOutOfStock
 * @property {number} productsRunningOutSoon
 * @property {number} averageStoreConsumptionRate
 */

/**
 * @typedef {Object} ForecastOverviewResponse
 * @property {number} periodDays
 * @property {ForecastOverviewSummary} summary
 * @property {ProductForecastItem[]} products
 */

/**
 * @typedef {Object} DailyConsumptionPoint
 * @property {string} date - 'YYYY-MM-DD'
 * @property {string} displayDate - 'Sep 28'
 * @property {number} consumed - Units consumed
 * @property {number} transactionsCount
 */

/**
 * @typedef {Object} ProductConsumptionResponse
 * @property {string} productId
 * @property {string} productName
 * @property {string} sku
 * @property {number} periodDays
 * @property {number} totalConsumed
 * @property {number} recordsCount
 * @property {DailyConsumptionPoint[]} timeline
 */

export default {
  FORECAST_PERIODS,
  DEFAULT_FORECAST_PERIOD,
  FORECAST_STATUS
};
