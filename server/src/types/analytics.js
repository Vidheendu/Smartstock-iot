/**
 * TypeScript / JSDoc Definitions for SmartStock Analytics Module
 * 
 * Defines standard interfaces for:
 * - AnalyticsOverview
 * - InventoryMovement
 * - CategoryAnalytics
 * - ProductAnalytics
 * - AlertAnalytics
 * - IoTAnalytics
 */

export const ANALYTICS_RANGES = Object.freeze({
  TODAY: 'today',
  LAST_7_DAYS: '7d',
  LAST_30_DAYS: '30d',
  LAST_90_DAYS: '90d'
});

/**
 * @typedef {Object} AnalyticsOverview
 * @property {number} totalProducts - Current registered product count
 * @property {number} totalCurrentStock - Sum of current units across products
 * @property {number} lowStockProducts - Number of products with LOW status
 * @property {number} criticalStockProducts - Number of products with CRITICAL status
 * @property {number} outOfStockProducts - Number of products with OUT_OF_STOCK status
 * @property {number} inventoryTransactions - Total inventory transaction events
 * @property {number} activeAlerts - Current active alert count
 * @property {number} iotReadings - Total IoT sensor telemetry readings
 */

/**
 * @typedef {Object} InventoryMovementSummary
 * @property {number} totalStockIn - Total units added (+X)
 * @property {number} totalStockOut - Total units removed (-X)
 * @property {number} totalAdjustments - Net adjustment units
 * @property {number} netMovement - Net overall units moved
 * @property {number} totalTransactions - Transaction count in period
 */

/**
 * @typedef {Object} InventoryMovementDay
 * @property {string} date - 'YYYY-MM-DD'
 * @property {string} displayDate - Human readable 'Sep 28'
 * @property {number} stockIn - Units in
 * @property {number} stockOut - Units out
 * @property {number} adjustments - Signed adjustments
 * @property {number} net - Net change
 */

/**
 * @typedef {Object} InventoryMovementResponse
 * @property {string} range
 * @property {InventoryMovementSummary} summary
 * @property {InventoryMovementDay[]} timeline
 */

/**
 * @typedef {Object} CategoryAnalyticsItem
 * @property {string} category
 * @property {number} productCount
 * @property {number} currentStock
 * @property {number} minimumStock
 * @property {number} lowStockCount
 * @property {number} criticalStockCount
 * @property {number} outOfStockCount
 */

/**
 * @typedef {Object} ProductStockItem
 * @property {string} id
 * @property {string} name
 * @property {string} sku
 * @property {string} category
 * @property {number} currentStock
 * @property {number} minimumStock
 * @property {string} stockStatus
 * @property {string} unit
 */

/**
 * @typedef {Object} ProductAnalyticsResponse
 * @property {ProductStockItem[]} products
 * @property {ProductStockItem[]} attentionProducts - Sorted OUT_OF_STOCK, then CRITICAL, then LOW
 * @property {Object.<string, number>} statusDistribution - { NORMAL, LOW, CRITICAL, OUT_OF_STOCK }
 */

/**
 * @typedef {Object} AlertAnalyticsResponse
 * @property {string} range
 * @property {{ totalAlerts: number, activeAlerts: number, acknowledgedAlerts: number, resolvedAlerts: number }} summary
 * @property {{ LOW_STOCK: number, CRITICAL_STOCK: number, OUT_OF_STOCK: number }} bySeverity
 * @property {{ MANUAL: number, IOT: number, SYSTEM: number }} bySource
 * @property {Array<{ date: string, displayDate: string, lowStock: number, criticalStock: number, outOfStock: number, total: number }>} timeline
 */

/**
 * @typedef {Object} IoTAnalyticsResponse
 * @property {boolean} isSimulated
 * @property {string} notice
 * @property {{ totalDevices: number, onlineDevices: number, offlineDevices: number, totalReadings: number, averageBattery: number, latestReadingTime: string|null }} summary
 * @property {Array<{ deviceCode: string, deviceName: string, productName: string, status: string, lastReading: string, batteryLevel: number, readingsCount: number, lastPingAt: string|null }>} devices
 * @property {Array<{ date: string, displayDate: string, readings: number }>} timeline
 */

export default {
  ANALYTICS_RANGES
};
