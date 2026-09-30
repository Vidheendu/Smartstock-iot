/**
 * SmartStock Common API Validators & Sanitizers
 * 
 * Reusable validation logic for pagination, sorting allowlists, date ranges,
 * prices, quantities, and string sanitization.
 */

/**
 * Sanitizes and caps pagination parameters.
 * Guarantees page >= 1, limit >= 1, and limit <= maxLimit (default 100).
 * Prevents denial of service queries via limit=999999999.
 * 
 * @param {Object} query - Express req.query object or params
 * @param {number} defaultLimit - Fallback limit if unspecified
 * @param {number} maxLimit - Upper bound for limit (default 100)
 * @returns {{ page: number, limit: number, offset: number }}
 */
export function sanitizePagination(query = {}, defaultLimit = 20, maxLimit = 100) {
  let page = parseInt(query.page, 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  let limit = parseInt(query.limit, 10);
  if (isNaN(limit) || limit < 1) {
    limit = defaultLimit;
  } else if (limit > maxLimit) {
    limit = maxLimit;
  }

  const offset = query.offset !== undefined && !isNaN(parseInt(query.offset, 10))
    ? Math.max(0, parseInt(query.offset, 10))
    : (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Validates a sort field against an allowlist.
 * If user provides an unlisted field, safely falls back to defaultField.
 * 
 * @param {string} field - Requested sort field name
 * @param {Array<string>} allowlist - List of permitted fields
 * @param {string} defaultField - Safe default fallback
 * @returns {string} Allowed sort field
 */
export function validateSortField(field, allowlist = [], defaultField = 'created_at') {
  if (!field || typeof field !== 'string') {
    return defaultField;
  }

  const normalized = field.trim().toLowerCase();
  const matched = allowlist.find((allowed) => allowed.toLowerCase() === normalized);

  return matched || defaultField;
}

/**
 * Validates date range parameters.
 * Verifies that dates are valid formats and that startDate <= endDate.
 * 
 * @param {string|Date} startDate 
 * @param {string|Date} endDate 
 * @throws {Error} If dates are invalid or startDate > endDate
 */
export function validateDateRange(startDate, endDate) {
  if (!startDate && !endDate) return true;

  let startTimestamp = null;
  let endTimestamp = null;

  if (startDate) {
    const parsedStart = new Date(startDate).getTime();
    if (isNaN(parsedStart)) {
      const err = new Error('Invalid start date format');
      err.status = 400;
      throw err;
    }
    startTimestamp = parsedStart;
  }

  if (endDate) {
    const parsedEnd = new Date(endDate).getTime();
    if (isNaN(parsedEnd)) {
      const err = new Error('Invalid end date format');
      err.status = 400;
      throw err;
    }
    endTimestamp = parsedEnd;
  }

  if (startTimestamp !== null && endTimestamp !== null && startTimestamp > endTimestamp) {
    const err = new Error('Start date must be earlier than or equal to end date');
    err.status = 400;
    throw err;
  }

  return true;
}

/**
 * Validates quantity is a positive finite integer.
 * 
 * @param {any} quantity 
 * @param {string} fieldName 
 * @param {number} max 
 * @returns {number} Validated integer
 */
export function validateQuantity(quantity, fieldName = 'Quantity', max = 1000000) {
  const num = Number(quantity);
  if (quantity === undefined || quantity === null || quantity === '' || isNaN(num)) {
    const err = new Error(`${fieldName} must be a valid number`);
    err.status = 400;
    throw err;
  }
  if (!Number.isFinite(num)) {
    const err = new Error(`${fieldName} must be a finite number`);
    err.status = 400;
    throw err;
  }
  if (!Number.isInteger(num)) {
    const err = new Error(`${fieldName} must be a whole integer`);
    err.status = 400;
    throw err;
  }
  if (num <= 0) {
    const err = new Error(`${fieldName} must be greater than zero`);
    err.status = 400;
    throw err;
  }
  if (num > max) {
    const err = new Error(`${fieldName} cannot exceed ${max.toLocaleString()}`);
    err.status = 400;
    throw err;
  }
  return num;
}

/**
 * Validates price is a non-negative finite number.
 * 
 * @param {any} price 
 * @param {string} fieldName 
 * @param {number} max 
 * @returns {number} Validated price
 */
export function validatePrice(price, fieldName = 'Price', max = 100000000) {
  const num = Number(price);
  if (price === undefined || price === null || price === '' || isNaN(num)) {
    const err = new Error(`${fieldName} must be a valid number`);
    err.status = 400;
    throw err;
  }
  if (!Number.isFinite(num)) {
    const err = new Error(`${fieldName} must be a finite number`);
    err.status = 400;
    throw err;
  }
  if (num < 0) {
    const err = new Error(`${fieldName} cannot be negative`);
    err.status = 400;
    throw err;
  }
  if (num > max) {
    const err = new Error(`${fieldName} cannot exceed ${max.toLocaleString()}`);
    err.status = 400;
    throw err;
  }
  return Number(num.toFixed(2));
}

/**
 * Trims and validates maximum length of user string inputs.
 * 
 * @param {any} str 
 * @param {number} maxLength 
 * @param {string} fieldName 
 * @returns {string} Sanitized string
 */
export function sanitizeString(str, maxLength = 255, fieldName = 'Input') {
  if (str === undefined || str === null) return '';
  const trimmed = String(str).trim();
  if (trimmed.length > maxLength) {
    const err = new Error(`${fieldName} must not exceed ${maxLength} characters`);
    err.status = 400;
    throw err;
  }
  return trimmed;
}

export default {
  sanitizePagination,
  validateSortField,
  validateDateRange,
  validateQuantity,
  validatePrice,
  sanitizeString
};
