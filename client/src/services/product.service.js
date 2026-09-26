import api from '../api/axios.js';

/**
 * Fetch all products with optional filters.
 * 
 * @param {Object} [params] - { search, category, status, isActive }
 * @returns {Promise<Array>} List of products
 */
export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data?.data || [];
};

/**
 * Fetch a single product by ID.
 * 
 * @param {string} id - Product UUID
 * @returns {Promise<Object>} Product details
 */
export const getProduct = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data?.data;
};

/**
 * Create a new product.
 * 
 * @param {Object} productData - New product payload
 * @returns {Promise<Object>} Created product
 */
export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data?.data;
};

/**
 * Update an existing product.
 * 
 * @param {string} id - Product UUID
 * @param {Object} productData - Updated product payload
 * @returns {Promise<Object>} Updated product
 */
export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data?.data;
};

/**
 * Delete (soft delete / deactivate) a product.
 * 
 * @param {string} id - Product UUID
 * @returns {Promise<Object>} Operation result
 */
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

/**
 * Fetch available suppliers for product assignment.
 * 
 * @returns {Promise<Array>} List of suppliers
 */
export const getSuppliers = async () => {
  const response = await api.get('/suppliers');
  return response.data?.data || [];
};

export const getAllProducts = getProducts;

export default {
  getProducts,
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getSuppliers
};
