/**
 * SmartStock Analytics Service
 * 
 * Provides server-side aggregation and analytical metrics using REAL database data:
 * - Overview metrics (Products, Stock, Statuses, Transactions, Alerts, IoT)
 * - Inventory movement trends (Stock In vs Stock Out vs Adjustments)
 * - Category-wise inventory distribution
 * - Product stock comparison and attention priorities
 * - Alert trends, severity breakdown, and source distribution
 * - Software-simulated IoT telemetry activity, device status, and simulated battery
 * 
 * NOTE: Current-state metrics reflect live state.
 *       Historical trends use the user-selected date range.
 *       NO forecasting, predictive modeling, or restocking logic is implemented.
 */

import supabase from '../config/db.js';
import { getAllProducts } from './product.service.js';
import { getInventoryHistory } from './inventory.service.js';
import { getAlerts, getAlertSummary } from './alert.service.js';
import { getDevices, getSensorReadings } from './iot.service.js';
import { calculateStockStatus, STOCK_STATUS } from '../utils/stockStatus.js';
import {
  getRangeStartDate,
  formatDateKey,
  formatDisplayDate
} from '../utils/dateRange.js';

/**
 * 1. OVERVIEW METRICS
 * Returns high-level summary cards as required by Phase 9 Part 6.
 * Current stock and status reflect current live state.
 * Transactions and IoT readings reflect database records.
 */
export async function getOverview(range = '30d') {
  const [products, allHistory, alertSummary, allReadings] = await Promise.all([
    getAllProducts({ isActive: true }),
    getInventoryHistory(),
    getAlertSummary(),
    getSensorReadings()
  ]);

  let totalCurrentStock = 0;
  let lowStockProducts = 0;
  let criticalStockProducts = 0;
  let outOfStockProducts = 0;

  for (const p of products) {
    const stock = Number(p.currentStock ?? 0);
    const min = Number(p.minimumStock ?? 0);
    totalCurrentStock += stock;

    const status = p.stockStatus || calculateStockStatus(stock, min);
    if (status === STOCK_STATUS.LOW) {
      lowStockProducts++;
    } else if (status === STOCK_STATUS.CRITICAL) {
      criticalStockProducts++;
    } else if (status === STOCK_STATUS.OUT_OF_STOCK) {
      outOfStockProducts++;
    }
  }

  return {
    totalProducts: products.length,
    totalCurrentStock,
    lowStockProducts,
    criticalStockProducts,
    outOfStockProducts,
    inventoryTransactions: allHistory.length,
    activeAlerts: alertSummary.activeAlerts ?? 0,
    iotReadings: allReadings.length
  };
}

/**
 * 2. INVENTORY MOVEMENT TRENDS
 * Aggregates inventory_history by date within the selected range:
 * - STOCK_IN
 * - STOCK_OUT
 * - ADJUSTMENT
 * Distinguishes positive additions, negative depletions, and net movement.
 */
export async function getInventoryMovement(range = '30d') {
  const startDate = getRangeStartDate(range);
  const history = await getInventoryHistory({ since: startDate.toISOString() });

  let totalStockIn = 0;
  let totalStockOut = 0;
  let totalAdjustments = 0;

  // Group by Date ('YYYY-MM-DD')
  const dateMap = new Map();

  for (const record of history) {
    const dateKey = formatDateKey(record.createdAt || record.created_at);
    const displayDate = formatDisplayDate(record.createdAt || record.created_at);

    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, {
        date: dateKey,
        displayDate,
        stockIn: 0,
        stockOut: 0,
        adjustments: 0,
        net: 0,
        transactions: 0
      });
    }

    const day = dateMap.get(dateKey);
    const changeType = record.changeType || record.change_type;
    const qtyChange = Number(record.quantityChange ?? record.quantity_change ?? 0);

    day.transactions++;

    if (changeType === 'STOCK_IN') {
      const added = Math.abs(qtyChange);
      day.stockIn += added;
      day.net += added;
      totalStockIn += added;
    } else if (changeType === 'STOCK_OUT') {
      const removed = Math.abs(qtyChange);
      day.stockOut += removed;
      day.net -= removed;
      totalStockOut += removed;
    } else if (changeType === 'ADJUSTMENT') {
      day.adjustments += qtyChange;
      day.net += qtyChange;
      totalAdjustments += qtyChange;
    }
  }

  // Sort timeline chronologically (oldest first for charts)
  const timeline = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  return {
    range,
    summary: {
      totalStockIn,
      totalStockOut,
      totalAdjustments,
      netMovement: totalStockIn - totalStockOut + totalAdjustments,
      totalTransactions: history.length
    },
    timeline
  };
}

/**
 * 3. CATEGORY INVENTORY DISTRIBUTION
 * Groups live products by category, calculating unit counts and stock totals.
 */
export async function getCategoryAnalytics() {
  const products = await getAllProducts({ isActive: true });

  const categoryMap = new Map();

  for (const p of products) {
    const cat = p.category || 'Uncategorized';
    const stock = Number(p.currentStock ?? 0);
    const min = Number(p.minimumStock ?? 0);
    const status = p.stockStatus || calculateStockStatus(stock, min);

    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, {
        category: cat,
        productCount: 0,
        currentStock: 0,
        minimumStock: 0,
        lowStockCount: 0,
        criticalStockCount: 0,
        outOfStockCount: 0
      });
    }

    const entry = categoryMap.get(cat);
    entry.productCount++;
    entry.currentStock += stock;
    entry.minimumStock += min;

    if (status === STOCK_STATUS.LOW) entry.lowStockCount++;
    else if (status === STOCK_STATUS.CRITICAL) entry.criticalStockCount++;
    else if (status === STOCK_STATUS.OUT_OF_STOCK) entry.outOfStockCount++;
  }

  // Sort categories by currentStock descending
  return Array.from(categoryMap.values()).sort((a, b) => b.currentStock - a.currentStock);
}

/**
 * 4. PRODUCT STOCK COMPARISON & ATTENTION LIST
 * Compares current stock vs minimum stock threshold for products.
 * Highlights products requiring attention sorted by severity:
 * OUT_OF_STOCK -> CRITICAL -> LOW.
 */
export async function getProductAnalytics() {
  const products = await getAllProducts({ isActive: true });

  const statusDistribution = {
    NORMAL: 0,
    LOW: 0,
    CRITICAL: 0,
    OUT_OF_STOCK: 0
  };

  const productItems = products.map((p) => {
    const currentStock = Number(p.currentStock ?? 0);
    const minimumStock = Number(p.minimumStock ?? 0);
    const stockStatus = p.stockStatus || calculateStockStatus(currentStock, minimumStock);

    if (statusDistribution[stockStatus] !== undefined) {
      statusDistribution[stockStatus]++;
    }

    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      currentStock,
      minimumStock,
      stockStatus,
      unit: p.unit || 'units'
    };
  });

  // Filter products requiring attention
  const attentionOrder = {
    OUT_OF_STOCK: 1,
    CRITICAL: 2,
    LOW: 3
  };

  const attentionProducts = productItems
    .filter((p) => attentionOrder[p.stockStatus] !== undefined)
    .sort((a, b) => {
      const orderDiff = attentionOrder[a.stockStatus] - attentionOrder[b.stockStatus];
      if (orderDiff !== 0) return orderDiff;
      return a.currentStock - b.currentStock;
    });

  return {
    products: productItems,
    attentionProducts,
    statusDistribution
  };
}

/**
 * 5. ALERT ANALYTICS
 * Analyzes alerts over the selected period:
 * - Active alerts (current state)
 * - Severity breakdown (LOW_STOCK, CRITICAL_STOCK, OUT_OF_STOCK)
 * - Source breakdown (MANUAL, IOT, SYSTEM)
 * - Timeline trend of alert creation
 */
export async function getAlertAnalytics(range = '30d') {
  const startDate = getRangeStartDate(range);

  // Get active alerts (live state) and historical alerts in range
  const [allAlerts, rangeAlerts] = await Promise.all([
    getAlerts(),
    getAlerts({ since: startDate.toISOString() })
  ]);

  const liveActiveCount = allAlerts.filter((a) => a.status === 'ACTIVE').length;

  let acknowledgedCount = 0;
  let resolvedCount = 0;

  const bySeverity = {
    LOW_STOCK: 0,
    CRITICAL_STOCK: 0,
    OUT_OF_STOCK: 0
  };

  const bySource = {
    MANUAL: 0,
    IOT: 0,
    SYSTEM: 0
  };

  const dateMap = new Map();

  for (const alert of rangeAlerts) {
    if (alert.status === 'ACKNOWLEDGED') acknowledgedCount++;
    if (alert.status === 'RESOLVED') resolvedCount++;

    // Normalize severity / alertType
    const sev = alert.severity || (alert.alertType === 'LOW_STOCK' ? 'LOW' : alert.alertType);
    if (sev === 'LOW' || alert.alertType === 'LOW_STOCK') {
      bySeverity.LOW_STOCK++;
    } else if (sev === 'CRITICAL' || alert.alertType === 'CRITICAL_STOCK') {
      bySeverity.CRITICAL_STOCK++;
    } else if (sev === 'OUT_OF_STOCK' || alert.alertType === 'OUT_OF_STOCK') {
      bySeverity.OUT_OF_STOCK++;
    }

    // Source
    const src = (alert.source || 'SYSTEM').toUpperCase();
    if (bySource[src] !== undefined) {
      bySource[src]++;
    } else {
      bySource.SYSTEM++;
    }

    // Group for trend timeline
    const dateKey = formatDateKey(alert.createdAt || alert.created_at);
    const displayDate = formatDisplayDate(alert.createdAt || alert.created_at);

    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, {
        date: dateKey,
        displayDate,
        lowStock: 0,
        criticalStock: 0,
        outOfStock: 0,
        total: 0
      });
    }

    const day = dateMap.get(dateKey);
    day.total++;
    if (sev === 'LOW' || alert.alertType === 'LOW_STOCK') day.lowStock++;
    else if (sev === 'CRITICAL' || alert.alertType === 'CRITICAL_STOCK') day.criticalStock++;
    else if (sev === 'OUT_OF_STOCK' || alert.alertType === 'OUT_OF_STOCK') day.outOfStock++;
  }

  const timeline = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  return {
    range,
    summary: {
      totalAlerts: rangeAlerts.length,
      activeAlerts: liveActiveCount,
      acknowledgedAlerts: acknowledgedCount,
      resolvedAlerts: resolvedCount
    },
    bySeverity,
    bySource,
    timeline
  };
}

/**
 * 6. SIMULATED IoT ANALYTICS
 * Analyzes software-simulated IoT devices and sensor readings:
 * - Device count and online/offline status
 * - Telemetry activity trend over time
 * - Simulated battery levels
 * - Clearly labeled as SIMULATED IoT DATA
 */
export async function getIoTAnalytics(range = '30d') {
  const startDate = getRangeStartDate(range);

  const [devices, allReadings, rangeReadings] = await Promise.all([
    getDevices(),
    getSensorReadings(),
    getSensorReadings({ since: startDate.toISOString() })
  ]);

  const onlineDevices = devices.filter((d) => (d.status || 'ACTIVE') === 'ACTIVE').length;
  const offlineDevices = devices.length - onlineDevices;

  // Battery calculations
  let batterySum = 0;
  for (const d of devices) {
    batterySum += Number(d.batteryLevel ?? 95);
  }
  const averageBattery = devices.length > 0 ? Math.round(batterySum / devices.length) : 0;

  // Reading counts per device
  const readingCountByDevice = new Map();
  for (const r of allReadings) {
    const devId = r.device_id || r.deviceId;
    readingCountByDevice.set(devId, (readingCountByDevice.get(devId) || 0) + 1);
  }

  // Device activity list
  const deviceList = devices.map((d) => {
    return {
      id: d.id,
      deviceCode: d.deviceCode,
      deviceName: d.deviceName,
      productName: d.productName || 'Unassigned',
      status: d.status || 'ACTIVE',
      lastReading: d.currentStock !== undefined ? `${d.currentStock} ${d.unit || 'units'}` : 'N/A',
      batteryLevel: Number(d.batteryLevel ?? 95),
      readingsCount: readingCountByDevice.get(d.id) || 0,
      lastPingAt: d.lastPingAt || null
    };
  });

  // Timeline: readings per day in range
  const dateMap = new Map();
  for (const r of rangeReadings) {
    const dateKey = formatDateKey(r.recorded_at || r.recordedAt || new Date());
    const displayDate = formatDisplayDate(r.recorded_at || r.recordedAt || new Date());

    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, {
        date: dateKey,
        displayDate,
        readings: 0
      });
    }

    dateMap.get(dateKey).readings++;
  }

  const timeline = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  const latestReadingTime = allReadings.length > 0
    ? (allReadings[0].recorded_at || allReadings[0].recordedAt)
    : null;

  return {
    isSimulated: true,
    notice: 'SIMULATED IoT DATA - All devices and telemetry are software-simulated.',
    summary: {
      totalDevices: devices.length,
      onlineDevices,
      offlineDevices,
      totalReadings: allReadings.length,
      readingsInRange: rangeReadings.length,
      averageBattery,
      latestReadingTime
    },
    devices: deviceList,
    timeline
  };
}

export default {
  getOverview,
  getInventoryMovement,
  getCategoryAnalytics,
  getProductAnalytics,
  getAlertAnalytics,
  getIoTAnalytics
};
