/**
 * SmartStock Forecasting & Demand Insights Service
 * 
 * Rule-based forecasting calculation engine based strictly on historical
 * STOCK_OUT transactions from the inventory_history table.
 * 
 * Calculations:
 * 1. Total Consumed = sum(|quantity_change|) of STOCK_OUT transactions in selected period
 * 2. Average Daily Consumption (ADC) = Total Consumed / Period Days
 * 3. Estimated Days Remaining = Current Stock / ADC (or 0 if stock=0, null if ADC=0)
 * 4. Projected Depletion Date = Current Date + Days Remaining
 * 
 * NOTE: No machine learning, predictive AI models, or restocking logic is implemented.
 * Real database data only. Edge cases (0 stock, 0 consumption, limited data) handled safely.
 */

import { getAllProducts, getProductById } from './product.service.js';
import { getInventoryHistory } from './inventory.service.js';
import { FORECAST_PERIODS, DEFAULT_FORECAST_PERIOD, FORECAST_STATUS } from '../types/forecast.js';
import { formatDateKey, formatDisplayDate } from '../utils/dateRange.js';

/**
 * Validates and parses the requested forecast period (in calendar days).
 * Supported: 7, 30, 90.
 * 
 * @param {number|string} periodParam 
 * @returns {number} 7, 30, or 90
 */
export function parsePeriod(periodParam) {
  if (periodParam === undefined || periodParam === null || periodParam === '') {
    return DEFAULT_FORECAST_PERIOD;
  }

  const parsed = parseInt(periodParam, 10);
  if (isNaN(parsed) || !FORECAST_PERIODS.includes(parsed)) {
    const error = new Error(`Invalid forecast period '${periodParam}'. Supported periods: 7, 30, 90.`);
    error.status = 400;
    throw error;
  }

  return parsed;
}

/**
 * Calculates Average Daily Consumption (ADC).
 * ADC = Total Consumed / Period Days
 * 
 * @param {number} totalConsumed - Total units consumed via STOCK_OUT
 * @param {number} periodDays - Number of days in the observation window (7, 30, 90)
 * @returns {number} Rounded to 2 decimal places
 */
export function calculateAverageDailyConsumption(totalConsumed, periodDays) {
  const consumed = Number(totalConsumed);
  const days = Number(periodDays);

  if (isNaN(consumed) || consumed <= 0 || isNaN(days) || days <= 0) {
    return 0;
  }

  return Number((consumed / days).toFixed(2));
}

/**
 * Calculates Estimated Days Remaining until stock depletion.
 * Days Remaining = Current Stock / ADC
 * 
 * Safe Edge Case Handling:
 * - If currentStock <= 0: returns 0 (Depleted / Out of stock)
 * - If ADC <= 0: returns null (Avoids division by zero / Infinity)
 * 
 * @param {number} currentStock - Current on-hand inventory units
 * @param {number} adc - Average daily consumption units/day
 * @returns {number|null} Rounded to 1 decimal place, or null if ADC is 0
 */
export function calculateDaysRemaining(currentStock, adc) {
  const stock = Number(currentStock);
  const rate = Number(adc);

  if (isNaN(stock) || stock <= 0) {
    return 0;
  }

  if (isNaN(rate) || rate <= 0) {
    return null; // Insufficient consumption data, never Infinity
  }

  return Number((stock / rate).toFixed(1));
}

/**
 * Calculates Projected Depletion Date.
 * Depletion Date = fromDate + (daysRemaining * 24 hours)
 * 
 * @param {number|null} daysRemaining 
 * @param {Date} [fromDate=new Date()]
 * @returns {string|null} ISO 8601 timestamp string or null
 */
export function calculateProjectedDepletionDate(daysRemaining, fromDate = new Date()) {
  if (daysRemaining === null || daysRemaining === undefined) {
    return null;
  }

  const days = Number(daysRemaining);
  if (days <= 0) {
    return new Date(fromDate).toISOString();
  }

  const baseTime = fromDate instanceof Date ? fromDate.getTime() : new Date(fromDate).getTime();
  const msToAdd = Math.round(days * 24 * 60 * 60 * 1000);
  return new Date(baseTime + msToAdd).toISOString();
}

/**
 * Determines categorical Forecast Status based on remaining days.
 * 
 * Distinct from inventory stock status (NORMAL, LOW, CRITICAL, OUT_OF_STOCK).
 * - OUT_OF_STOCK: Current stock is 0
 * - NO_DATA: Insufficient consumption history to calculate rate
 * - URGENT: Estimated depletion < 7 days
 * - ATTENTION: Estimated depletion >= 7 and < 14 days
 * - STABLE: Estimated depletion >= 14 days
 * 
 * @param {number} currentStock 
 * @param {number|null} daysRemaining 
 * @param {boolean} forecastAvailable 
 * @returns {string} One of FORECAST_STATUS enum
 */
export function determineForecastStatus(currentStock, daysRemaining, forecastAvailable) {
  if (currentStock <= 0) {
    return FORECAST_STATUS.OUT_OF_STOCK;
  }

  if (!forecastAvailable || daysRemaining === null) {
    return FORECAST_STATUS.NO_DATA;
  }

  if (daysRemaining < 7) {
    return FORECAST_STATUS.URGENT;
  }

  if (daysRemaining < 14) {
    return FORECAST_STATUS.ATTENTION;
  }

  return FORECAST_STATUS.STABLE;
}

/**
 * Assesses data confidence level based on number of consumption transactions.
 * 
 * @param {number} recordsCount 
 * @returns {'HIGH'|'LIMITED'|'NONE'}
 */
export function determineDataConfidence(recordsCount) {
  if (recordsCount <= 0) return 'NONE';
  if (recordsCount < 3) return 'LIMITED';
  return 'HIGH';
}

/**
 * Formats a single product's forecast item.
 */
function buildProductForecastItem(product, stockOutRecords, periodDays) {
  const currentStock = Number(product.currentStock ?? 0);
  const minimumStock = Number(product.minimumStock ?? 0);

  let totalConsumed = 0;
  for (const record of stockOutRecords) {
    const qty = Number(record.quantityChange ?? record.quantity_change ?? 0);
    totalConsumed += Math.abs(qty);
  }

  const consumptionRecordsCount = stockOutRecords.length;
  const consumptionDataAvailable = totalConsumed > 0;
  const averageDailyConsumption = calculateAverageDailyConsumption(totalConsumed, periodDays);

  const forecastAvailable = currentStock > 0 && consumptionDataAvailable;
  const estimatedDaysRemaining = calculateDaysRemaining(currentStock, averageDailyConsumption);
  const projectedDepletionDate = calculateProjectedDepletionDate(estimatedDaysRemaining);
  const forecastStatus = determineForecastStatus(currentStock, estimatedDaysRemaining, forecastAvailable);
  const dataConfidence = determineDataConfidence(consumptionRecordsCount);

  return {
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    category: product.category,
    unit: product.unit || 'units',
    currentStock,
    minimumStock,
    totalConsumed,
    averageDailyConsumption,
    estimatedDaysRemaining,
    projectedDepletionDate,
    periodDays,
    consumptionRecordsCount,
    consumptionDataAvailable,
    forecastAvailable,
    forecastStatus,
    dataConfidence
  };
}

/**
 * Retrieves forecast information for all active products across the store.
 * 
 * GET /api/forecast/overview?period=30
 * 
 * @param {number|string} [periodParam=30] - 7, 30, or 90 days
 */
export async function getForecastOverview(periodParam = DEFAULT_FORECAST_PERIOD) {
  const periodDays = parsePeriod(periodParam);
  const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

  // 1. Fetch active products and historical STOCK_OUT transactions concurrently
  const [products, stockOutHistory] = await Promise.all([
    getAllProducts({ isActive: true }),
    getInventoryHistory({
      changeType: 'STOCK_OUT',
      since: startDate.toISOString()
    })
  ]);

  // 2. Group stock out records by product_id
  const historyByProduct = new Map();
  for (const record of stockOutHistory) {
    const pId = record.productId || record.product_id;
    if (!historyByProduct.has(pId)) {
      historyByProduct.set(pId, []);
    }
    historyByProduct.get(pId).push(record);
  }

  // 3. Compute forecasts for each product
  let productsWithForecast = 0;
  let productsNoData = 0;
  let productsOutOfStock = 0;
  let productsRunningOutSoon = 0;
  let totalAdcSum = 0;

  const productForecasts = products.map((prod) => {
    const records = historyByProduct.get(prod.id) || [];
    const item = buildProductForecastItem(prod, records, periodDays);

    if (item.currentStock <= 0) {
      productsOutOfStock++;
    } else if (item.forecastAvailable) {
      productsWithForecast++;
      totalAdcSum += item.averageDailyConsumption;
      if (item.forecastStatus === FORECAST_STATUS.URGENT || item.forecastStatus === FORECAST_STATUS.ATTENTION) {
        productsRunningOutSoon++;
      }
    } else {
      productsNoData++;
    }

    return item;
  });

  // Sort: URGENT first, then ATTENTION, then OUT_OF_STOCK, then STABLE, then NO_DATA
  const statusPriority = {
    [FORECAST_STATUS.URGENT]: 1,
    [FORECAST_STATUS.ATTENTION]: 2,
    [FORECAST_STATUS.OUT_OF_STOCK]: 3,
    [FORECAST_STATUS.STABLE]: 4,
    [FORECAST_STATUS.NO_DATA]: 5
  };

  productForecasts.sort((a, b) => {
    const pDiff = (statusPriority[a.forecastStatus] || 99) - (statusPriority[b.forecastStatus] || 99);
    if (pDiff !== 0) return pDiff;
    if (a.estimatedDaysRemaining !== null && b.estimatedDaysRemaining !== null) {
      return a.estimatedDaysRemaining - b.estimatedDaysRemaining;
    }
    return 0;
  });

  const averageStoreConsumptionRate = productsWithForecast > 0
    ? Number((totalAdcSum / productsWithForecast).toFixed(2))
    : 0;

  return {
    periodDays,
    summary: {
      totalProducts: products.length,
      productsWithForecast,
      productsNoData,
      productsOutOfStock,
      productsRunningOutSoon,
      averageStoreConsumptionRate
    },
    products: productForecasts
  };
}

/**
 * Retrieves detailed forecast for a specific product.
 * 
 * GET /api/forecast/products/:productId?period=30
 * 
 * @param {string} productId 
 * @param {number|string} [periodParam=30]
 */
export async function getProductForecast(productId, periodParam = DEFAULT_FORECAST_PERIOD) {
  const periodDays = parsePeriod(periodParam);
  const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

  const product = await getProductById(productId);
  if (!product) {
    const error = new Error('Product not found.');
    error.status = 404;
    throw error;
  }

  const stockOutRecords = await getInventoryHistory({
    productId: product.id,
    changeType: 'STOCK_OUT',
    since: startDate.toISOString()
  });

  return buildProductForecastItem(product, stockOutRecords, periodDays);
}

/**
 * Retrieves historical consumption daily timeline used by the forecast.
 * 
 * GET /api/forecast/products/:productId/consumption?period=30
 * 
 * @param {string} productId 
 * @param {number|string} [periodParam=30]
 */
export async function getProductConsumption(productId, periodParam = DEFAULT_FORECAST_PERIOD) {
  const periodDays = parsePeriod(periodParam);
  const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

  const product = await getProductById(productId);
  if (!product) {
    const error = new Error('Product not found.');
    error.status = 404;
    throw error;
  }

  const stockOutRecords = await getInventoryHistory({
    productId: product.id,
    changeType: 'STOCK_OUT',
    since: startDate.toISOString()
  });

  // Aggregate consumption by day ('YYYY-MM-DD')
  const dateMap = new Map();
  let totalConsumed = 0;

  for (const record of stockOutRecords) {
    const dateKey = formatDateKey(record.createdAt || record.created_at);
    const displayDate = formatDisplayDate(record.createdAt || record.created_at);
    const qty = Math.abs(Number(record.quantityChange ?? record.quantity_change ?? 0));

    totalConsumed += qty;

    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, {
        date: dateKey,
        displayDate,
        consumed: 0,
        transactionsCount: 0
      });
    }

    const day = dateMap.get(dateKey);
    day.consumed += qty;
    day.transactionsCount++;
  }

  const timeline = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  return {
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    unit: product.unit || 'units',
    periodDays,
    totalConsumed,
    recordsCount: stockOutRecords.length,
    timeline
  };
}

export default {
  FORECAST_PERIODS,
  DEFAULT_FORECAST_PERIOD,
  FORECAST_STATUS,
  parsePeriod,
  calculateAverageDailyConsumption,
  calculateDaysRemaining,
  calculateProjectedDepletionDate,
  determineForecastStatus,
  determineDataConfidence,
  getForecastOverview,
  getProductForecast,
  getProductConsumption
};
