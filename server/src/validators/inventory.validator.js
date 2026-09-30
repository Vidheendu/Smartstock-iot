/**
 * Inventory Request Validators
 * 
 * Validates payload structures for stock-in, stock-out, and adjustment transactions.
 */

export function validateStockInPayload(data) {
  const errors = [];

  const productId = data.productId ? String(data.productId).trim() : '';
  const quantity = Number(data.quantity);
  const reason = data.reason !== undefined && data.reason !== null ? String(data.reason).trim() : '';

  if (!productId) {
    errors.push('Product ID is required');
  }

  if (data.quantity === undefined || data.quantity === null || isNaN(quantity) || !Number.isFinite(quantity)) {
    errors.push('Quantity must be a valid number');
  } else if (!Number.isInteger(quantity)) {
    errors.push('Quantity must be a whole integer');
  } else if (quantity <= 0) {
    errors.push('Quantity must be greater than zero');
  } else if (quantity > 1000000) {
    errors.push('Quantity cannot exceed 1,000,000');
  }

  if (!reason) {
    errors.push('Reason is required and cannot be empty');
  } else if (reason.length > 255) {
    errors.push('Reason must not exceed 255 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateStockOutPayload(data) {
  const errors = [];

  const productId = data.productId ? String(data.productId).trim() : '';
  const quantity = Number(data.quantity);
  const reason = data.reason !== undefined && data.reason !== null ? String(data.reason).trim() : '';

  if (!productId) {
    errors.push('Product ID is required');
  }

  if (data.quantity === undefined || data.quantity === null || isNaN(quantity) || !Number.isFinite(quantity)) {
    errors.push('Quantity must be a valid number');
  } else if (!Number.isInteger(quantity)) {
    errors.push('Quantity must be a whole integer');
  } else if (quantity <= 0) {
    errors.push('Quantity must be greater than zero');
  } else if (quantity > 1000000) {
    errors.push('Quantity cannot exceed 1,000,000');
  }

  if (!reason) {
    errors.push('Reason is required and cannot be empty');
  } else if (reason.length > 255) {
    errors.push('Reason must not exceed 255 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateAdjustPayload(data) {
  const errors = [];

  const productId = data.productId ? String(data.productId).trim() : '';
  const newStock = Number(data.newStock);
  const reason = data.reason !== undefined && data.reason !== null ? String(data.reason).trim() : '';

  if (!productId) {
    errors.push('Product ID is required');
  }

  if (data.newStock === undefined || data.newStock === null || isNaN(newStock) || !Number.isFinite(newStock)) {
    errors.push('New stock must be a valid number');
  } else if (!Number.isInteger(newStock)) {
    errors.push('New stock must be a whole integer');
  } else if (newStock < 0) {
    errors.push('New stock cannot be negative');
  } else if (newStock > 1000000) {
    errors.push('New stock cannot exceed 1,000,000');
  }

  if (!reason) {
    errors.push('Reason is required and cannot be empty');
  } else if (reason.length > 255) {
    errors.push('Reason must not exceed 255 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export const validateStockIn = (req, res, next) => {
  const validation = validateStockInPayload(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: validation.errors[0],
      errors: validation.errors
    });
  }
  next();
};

export const validateStockOut = (req, res, next) => {
  const validation = validateStockOutPayload(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: validation.errors[0],
      errors: validation.errors
    });
  }
  next();
};

export const validateAdjust = (req, res, next) => {
  const validation = validateAdjustPayload(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: validation.errors[0],
      errors: validation.errors
    });
  }
  next();
};

/**
 * Validates history query params (date range & pagination)
 */
export const validateHistoryQuery = (req, res, next) => {
  const { dateFrom, dateTo, startDate, endDate, limit, page } = req.query;
  const start = startDate || dateFrom;
  const end = endDate || dateTo;

  if (start && end) {
    const fromTime = new Date(start).getTime();
    const toTime = new Date(end).getTime();
    if (isNaN(fromTime) || isNaN(toTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format in query'
      });
    }
    if (fromTime > toTime) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date range: start date must be before or equal to end date'
      });
    }
  }

  if (limit !== undefined) {
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be an integer greater than or equal to 1'
      });
    }
    req.query.limit = Math.min(100, parsedLimit);
  }

  if (page !== undefined) {
    const parsedPage = parseInt(page, 10);
    if (isNaN(parsedPage) || parsedPage < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be an integer greater than or equal to 1'
      });
    }
  }

  next();
};

