/**
 * SmartStock Restock & Purchase Order Types
 * 
 * Standard statuses:
 * - DRAFT: Order drafted but not submitted
 * - PENDING: Restock order created, waiting for supplier transmission
 * - ORDERED: Transmitted to supplier, stock in transit
 * - RECEIVED: Stock received, inventory updated, transactions recorded
 * - CANCELLED: Order cancelled before stock receipt
 */

export const RESTOCK_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  ORDERED: 'ORDERED',
  RECEIVED: 'RECEIVED',
  CANCELLED: 'CANCELLED'
});

export const RESTOCK_STATUSES = Object.freeze(Object.values(RESTOCK_STATUS));

/**
 * Valid state transitions for Restock Orders
 */
export const RESTOCK_TRANSITIONS = Object.freeze({
  [RESTOCK_STATUS.DRAFT]: [RESTOCK_STATUS.PENDING, RESTOCK_STATUS.CANCELLED],
  [RESTOCK_STATUS.PENDING]: [RESTOCK_STATUS.ORDERED, RESTOCK_STATUS.CANCELLED],
  [RESTOCK_STATUS.ORDERED]: [RESTOCK_STATUS.RECEIVED, RESTOCK_STATUS.CANCELLED],
  [RESTOCK_STATUS.RECEIVED]: [], // Terminal state, immutable
  [RESTOCK_STATUS.CANCELLED]: []  // Terminal state, immutable
});
