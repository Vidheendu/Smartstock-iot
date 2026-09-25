/**
 * Product Request Validators
 * 
 * Validates payload for creating and updating products.
 */

export function validateProductPayload(data, isUpdate = false) {
  const errors = [];

  const name = data.name !== undefined ? String(data.name).trim() : undefined;
  const sku = data.sku !== undefined ? String(data.sku).trim() : undefined;
  const category = data.category !== undefined ? String(data.category).trim() : undefined;
  const unit = data.unit !== undefined ? String(data.unit).trim() : undefined;

  // Name validation
  if (!isUpdate || data.name !== undefined) {
    if (!name) {
      errors.push('Product name is required');
    } else if (name.length > 150) {
      errors.push('Product name must not exceed 150 characters');
    }
  }

  // SKU validation
  if (!isUpdate || data.sku !== undefined) {
    if (!sku) {
      errors.push('SKU is required');
    } else if (sku.length > 50) {
      errors.push('SKU must not exceed 50 characters');
    }
  }

  // Category validation
  if (!isUpdate || data.category !== undefined) {
    if (!category) {
      errors.push('Category is required');
    } else if (category.length > 100) {
      errors.push('Category must not exceed 100 characters');
    }
  }

  // Unit validation
  if (!isUpdate || data.unit !== undefined) {
    if (!unit) {
      errors.push('Unit is required');
    } else if (unit.length > 30) {
      errors.push('Unit must not exceed 30 characters');
    }
  }

  // Current Stock validation
  const currentStock = data.currentStock !== undefined ? data.currentStock : data.current_stock;
  if (!isUpdate || currentStock !== undefined) {
    const parsedStock = Number(currentStock);
    if (currentStock === undefined || currentStock === null || isNaN(parsedStock)) {
      errors.push('Current stock must be a valid number');
    } else if (parsedStock < 0) {
      errors.push('Current stock cannot be negative');
    }
  }

  // Minimum Stock validation
  const minimumStock = data.minimumStock !== undefined ? data.minimumStock : data.minimum_stock;
  if (!isUpdate || minimumStock !== undefined) {
    const parsedMin = Number(minimumStock);
    if (minimumStock === undefined || minimumStock === null || isNaN(parsedMin)) {
      errors.push('Minimum stock must be a valid number');
    } else if (parsedMin < 0) {
      errors.push('Minimum stock cannot be negative');
    }
  }

  // Price validation
  const price = data.price !== undefined ? data.price : (data.unit_price !== undefined ? data.unit_price : undefined);
  if (price !== undefined && price !== null && price !== '') {
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      errors.push('Price cannot be negative');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export const validateProductMiddleware = (req, res, next) => {
  const validation = validateProductPayload(req.body, req.method === 'PUT');
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: validation.errors[0],
      errors: validation.errors
    });
  }
  next();
};
