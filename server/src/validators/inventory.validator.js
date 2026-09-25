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

  if (data.quantity === undefined || data.quantity === null || isNaN(quantity)) {
    errors.push('Quantity must be a valid number');
  } else if (!Number.isInteger(quantity)) {
    errors.push('Quantity must be a whole integer');
  } else if (quantity <= 0) {
    errors.push('Quantity must be greater than zero');
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

  if (data.quantity === undefined || data.quantity === null || isNaN(quantity)) {
    errors.push('Quantity must be a valid number');
  } else if (!Number.isInteger(quantity)) {
    errors.push('Quantity must be a whole integer');
  } else if (quantity <= 0) {
    errors.push('Quantity must be greater than zero');
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

  if (data.newStock === undefined || data.newStock === null || isNaN(newStock)) {
    errors.push('New stock must be a valid number');
  } else if (!Number.isInteger(newStock)) {
    errors.push('New stock must be a whole integer');
  } else if (newStock < 0) {
    errors.push('New stock cannot be negative');
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
