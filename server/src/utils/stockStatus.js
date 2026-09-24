/**
 * Stock Status Utilities & Calculation Engine
 * 
 * Reusable stock state evaluation logic based on defined thresholds:
 * - NORMAL:       current_stock > minimum_stock
 * - LOW:          0.5 * minimum_stock < current_stock <= minimum_stock
 * - CRITICAL:     0 < current_stock <= 0.5 * minimum_stock
 * - OUT_OF_STOCK: current_stock === 0
 */

export const STOCK_STATUS = Object.freeze({
  NORMAL: 'NORMAL',
  LOW: 'LOW',
  CRITICAL: 'CRITICAL',
  OUT_OF_STOCK: 'OUT_OF_STOCK'
});

/**
 * Calculates the stock status given current inventory and threshold.
 * 
 * @param {number} currentStock - Non-negative integer representing current on-hand units
 * @param {number} minimumStock - Baseline threshold units for alerts
 * @returns {string} One of: 'NORMAL', 'LOW', 'CRITICAL', 'OUT_OF_STOCK'
 */
export function calculateStockStatus(currentStock, minimumStock) {
  const stock = Number(currentStock);
  const min = Number(minimumStock);

  if (isNaN(stock) || stock <= 0) {
    return STOCK_STATUS.OUT_OF_STOCK;
  }

  const criticalThreshold = 0.5 * min;

  if (stock <= criticalThreshold) {
    return STOCK_STATUS.CRITICAL;
  }

  if (stock <= min) {
    return STOCK_STATUS.LOW;
  }

  return STOCK_STATUS.NORMAL;
}

/**
 * Evaluates whether a stock status requires an active alert notification.
 * 
 * @param {string} status - Calculated stock status
 * @returns {boolean} True if status is LOW, CRITICAL, or OUT_OF_STOCK
 */
export function isDeficitStatus(status) {
  return [
    STOCK_STATUS.LOW,
    STOCK_STATUS.CRITICAL,
    STOCK_STATUS.OUT_OF_STOCK
  ].includes(status);
}
