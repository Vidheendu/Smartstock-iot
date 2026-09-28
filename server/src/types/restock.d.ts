export type RestockStatus = 'DRAFT' | 'PENDING' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';

export interface RestockOrderItem {
  id: string;
  restockOrderId: string;
  productId: string;
  productName?: string;
  sku?: string;
  category?: string;
  unit?: string;
  currentStock?: number;
  minimumStock?: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt?: string;
}

export interface RestockOrderSupplier {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  leadTimeDays?: number;
}

export interface RestockOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplier?: RestockOrderSupplier;
  status: RestockStatus;
  notes?: string;
  totalItems: number;
  totalAmount: number;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  orderedAt?: string | null;
  receivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items: RestockOrderItem[];
}

export interface RestockSummary {
  pendingOrders: number;
  orderedOrders: number;
  receivedOrders: number;
  cancelledOrders: number;
  totalOrders: number;
  productsNeedingRestock: number;
}

export interface ProductNeedingRestock {
  productId: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  status: string;
  averageDailyConsumption: number;
  estimatedDaysRemaining: number | null;
  forecastStatus: string;
  suggestedQuantity: number;
  supplierId: string | null;
  supplierName: string | null;
}
