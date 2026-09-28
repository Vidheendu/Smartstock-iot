export interface AnalyticsOverview {
  totalProducts: number;
  totalCurrentStock: number;
  lowStockProducts: number;
  criticalStockProducts: number;
  outOfStockProducts: number;
  inventoryTransactions: number;
  activeAlerts: number;
  iotReadings: number;
}

export interface InventoryMovementSummary {
  totalStockIn: number;
  totalStockOut: number;
  totalAdjustments: number;
  netMovement: number;
  totalTransactions: number;
}

export interface InventoryMovementDay {
  date: string;
  displayDate: string;
  stockIn: number;
  stockOut: number;
  adjustments: number;
  net: number;
}

export interface InventoryMovementResponse {
  range: string;
  summary: InventoryMovementSummary;
  timeline: InventoryMovementDay[];
}

export interface CategoryAnalyticsItem {
  category: string;
  productCount: number;
  currentStock: number;
  minimumStock: number;
  lowStockCount: number;
  criticalStockCount: number;
  outOfStockCount: number;
}

export interface ProductStockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  stockStatus: string;
  unit: string;
}

export interface ProductAnalyticsResponse {
  products: ProductStockItem[];
  attentionProducts: ProductStockItem[];
  statusDistribution: {
    NORMAL: number;
    LOW: number;
    CRITICAL: number;
    OUT_OF_STOCK: number;
  };
}

export interface AlertAnalyticsResponse {
  range: string;
  summary: {
    totalAlerts: number;
    activeAlerts: number;
    acknowledgedAlerts: number;
    resolvedAlerts: number;
  };
  bySeverity: {
    LOW_STOCK: number;
    CRITICAL_STOCK: number;
    OUT_OF_STOCK: number;
  };
  bySource: {
    MANUAL: number;
    IOT: number;
    SYSTEM: number;
  };
  timeline: Array<{
    date: string;
    displayDate: string;
    lowStock: number;
    criticalStock: number;
    outOfStock: number;
    total: number;
  }>;
}

export interface IoTAnalyticsResponse {
  isSimulated: boolean;
  notice: string;
  summary: {
    totalDevices: number;
    onlineDevices: number;
    offlineDevices: number;
    totalReadings: number;
    averageBattery: number;
    latestReadingTime: string | null;
  };
  devices: Array<{
    deviceCode: string;
    deviceName: string;
    productName: string;
    status: string;
    lastReading: string;
    batteryLevel: number;
    readingsCount: number;
    lastPingAt: string | null;
  }>;
  timeline: Array<{
    date: string;
    displayDate: string;
    readings: number;
  }>;
}
