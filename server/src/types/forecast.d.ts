export type ForecastStatus = 'STABLE' | 'ATTENTION' | 'URGENT' | 'OUT_OF_STOCK' | 'NO_DATA';
export type DataConfidence = 'HIGH' | 'LIMITED' | 'NONE';

export interface ProductForecastItem {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  totalConsumed: number;
  averageDailyConsumption: number;
  estimatedDaysRemaining: number | null;
  projectedDepletionDate: string | null;
  periodDays: number;
  consumptionRecordsCount: number;
  consumptionDataAvailable: boolean;
  forecastAvailable: boolean;
  forecastStatus: ForecastStatus;
  dataConfidence: DataConfidence;
}

export interface ForecastOverviewSummary {
  totalProducts: number;
  productsWithForecast: number;
  productsNoData: number;
  productsOutOfStock: number;
  productsRunningOutSoon: number;
  averageStoreConsumptionRate: number;
}

export interface ForecastOverviewResponse {
  periodDays: number;
  summary: ForecastOverviewSummary;
  products: ProductForecastItem[];
}

export interface DailyConsumptionPoint {
  date: string;
  displayDate: string;
  consumed: number;
  transactionsCount: number;
}

export interface ProductConsumptionResponse {
  productId: string;
  productName: string;
  sku: string;
  periodDays: number;
  totalConsumed: number;
  recordsCount: number;
  timeline: DailyConsumptionPoint[];
}
