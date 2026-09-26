/**
 * SmartStock Alert TypeScript Definitions (Backend)
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

export interface AlertRecord {
  id: string;
  product_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  current_stock: number;
  minimum_stock: number;
  source: AlertSource;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}
