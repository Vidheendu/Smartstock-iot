/**
 * SmartStock Alert TypeScript Definitions (Phase 7)
 */

export type AlertSeverity = 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK';

export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export type AlertType = 'LOW_STOCK' | 'CRITICAL_STOCK' | 'OUT_OF_STOCK';

export type AlertSource = 'MANUAL' | 'IOT' | 'SYSTEM';

export interface AlertUser {
  id: string;
  name: string;
  email: string;
}

export interface Alert {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  category: string;
  price: number;
  alertType: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  currentStock: number;
  minimumStock: number;
  source: AlertSource;
  message: string;
  acknowledgedBy: AlertUser | null;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AlertSummary {
  activeAlerts: number;
  criticalAlerts: number;
  lowStockAlerts: number;
  outOfStockAlerts: number;
}

export interface AlertFilters {
  severity?: 'ALL' | AlertSeverity;
  status?: 'ALL' | AlertStatus;
  source?: 'ALL' | AlertSource;
  productId?: 'ALL' | string;
  search?: string;
}
