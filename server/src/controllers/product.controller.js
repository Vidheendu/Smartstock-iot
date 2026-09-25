import productService from '../services/product.service.js';

/**
 * Controller to list all products.
 */
export async function getProducts(req, res, next) {
  try {
    const { search, category, status, isActive } = req.query;
    const products = await productService.getAllProducts({
      search,
      category,
      status,
      isActive
    });

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to fetch a single product by ID.
 */
export async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to create a new product.
 */
export async function createProduct(req, res, next) {
  try {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    if (error.status === 409) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
}

/**
 * Controller to update an existing product.
 */
export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    if (error.status === 409) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
}

/**
 * Controller to delete (soft delete/deactivate) a product.
 * Enforces: only MANAGER can delete. STAFF gets 403.
 */
export async function deleteProduct(req, res, next) {
  try {
    if (req.user?.role !== 'MANAGER') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete products.'
      });
    }

    const { id } = req.params;
    const result = await productService.deleteProduct(id, true);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: result
    });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    next(error);
  }
}

/**
 * Controller to fetch suppliers for the product form.
 */
export async function getSuppliers(req, res, next) {
  try {
    const suppliers = await productService.getSuppliers();
    res.status(200).json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to fetch dashboard product statistics from database.
 */
export async function getDashboardStats(req, res, next) {
  try {
    const stats = await productService.getProductStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
}
