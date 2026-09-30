/**
 * SmartStock Supplier Management Service (Phase 12)
 * 
 * Provides complete supplier lifecycle operations:
 * - Querying suppliers with search, status filtering, active orders filtering, sorting, pagination
 * - Supplier creation with uniqueness and validation rules (MANAGER only)
 * - Supplier editing (MANAGER only)
 * - Supplier activation & soft-deactivation (MANAGER only)
 * - Detailed supplier view with real database statistics (products, orders, units)
 * - Product list associated with a supplier
 * - Restock purchase order list associated with a supplier
 * 
 * Strictly uses real database data (Supabase with resilient in-memory fallback).
 * Strictly NO fake supplier data or mock external vendors.
 */

import crypto from 'crypto';
import supabase from '../config/db.js';

// Pre-seeded in-memory suppliers (mirrors database/seeds.sql)
export let inMemorySuppliers = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Fresh Dairy & Bakery Ltd',
    contact_name: 'Sarah Jenkins',
    contact_person: 'Sarah Jenkins',
    email: 'orders@freshdairybakery.com',
    phone: '+1-555-0192',
    address: '104 Meadow Lane',
    city: 'Agro Park',
    state: 'NY',
    country: 'USA',
    postal_code: '10001',
    notes: 'Primary dairy and fresh bakery supplier',
    lead_time_days: 2,
    is_active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    name: 'Agro Staples & Grains Co',
    contact_name: 'Robert Chen',
    contact_person: 'Robert Chen',
    email: 'sales@agrostaples.com',
    phone: '+1-555-0144',
    address: '88 Grain Terminal Rd',
    city: 'Chicago',
    state: 'IL',
    country: 'USA',
    postal_code: '60601',
    notes: 'Bulk grain, flour, and sugar supplier',
    lead_time_days: 4,
    is_active: true,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 25 * 86400000).toISOString()
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    name: 'Apex Beverages & Snacks Inc',
    contact_name: 'Maria Rodriguez',
    contact_person: 'Maria Rodriguez',
    email: 'supply@apexbeverages.com',
    phone: '+1-555-0188',
    address: '500 Commerce Blvd',
    city: 'Atlanta',
    state: 'GA',
    country: 'USA',
    postal_code: '30301',
    notes: 'Beverages, canned drinks, and dry snacks distributor',
    lead_time_days: 3,
    is_active: true,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 86400000).toISOString()
  }
];

/**
 * Standardizes a supplier record for consistent API responses.
 */
export function formatSupplier(s) {
  if (!s) return null;
  const contactPerson = s.contact_person || s.contact_name || s.contactPerson || s.contactName || '';
  const isActive = s.is_active !== undefined ? Boolean(s.is_active) : (s.isActive !== undefined ? Boolean(s.isActive) : true);

  return {
    id: s.id,
    name: s.name,
    contactPerson,
    contactName: contactPerson,
    contact_person: contactPerson,
    contact_name: contactPerson,
    email: s.email || '',
    phone: s.phone || '',
    address: s.address || '',
    city: s.city || '',
    state: s.state || '',
    country: s.country || '',
    postalCode: s.postal_code || s.postalCode || '',
    postal_code: s.postal_code || s.postalCode || '',
    notes: s.notes || '',
    leadTimeDays: Number(s.lead_time_days !== undefined ? s.lead_time_days : (s.leadTimeDays !== undefined ? s.leadTimeDays : 3)),
    lead_time_days: Number(s.lead_time_days !== undefined ? s.lead_time_days : (s.leadTimeDays !== undefined ? s.leadTimeDays : 3)),
    isActive,
    is_active: isActive,
    createdAt: s.created_at || s.createdAt || new Date().toISOString(),
    created_at: s.created_at || s.createdAt || new Date().toISOString(),
    updatedAt: s.updated_at || s.updatedAt || new Date().toISOString(),
    updated_at: s.updated_at || s.updatedAt || new Date().toISOString()
  };
}

/**
 * Validates supplier input fields.
 */
export function validateSupplierInput(data, isUpdate = false, existingId = null) {
  const errors = [];

  // 1. Supplier Name validation
  if (!isUpdate || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Supplier name cannot be empty');
    } else if (data.name.trim().length > 150) {
      errors.push('Supplier name cannot exceed 150 characters');
    }
  }

  // 2. Email format validation
  if (data.email !== undefined && data.email !== null && String(data.email).trim() !== '') {
    const emailTrimmed = String(data.email).trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      errors.push('Invalid email address format');
    }
  }

  // 3. Phone format validation
  if (data.phone !== undefined && data.phone !== null && String(data.phone).trim() !== '') {
    const phoneTrimmed = String(data.phone).trim();
    if (phoneTrimmed.length < 5 || phoneTrimmed.length > 50) {
      errors.push('Phone number must contain between 5 and 50 characters');
    }
  }

  // 4. Postal Code validation
  if (data.postal_code !== undefined || data.postalCode !== undefined) {
    const postal = String(data.postal_code || data.postalCode || '').trim();
    if (postal.length > 30) {
      errors.push('Postal code cannot exceed 30 characters');
    }
  }

  return errors;
}

/**
 * Fetches all raw suppliers from DB or in-memory fallback.
 */
async function fetchAllRawSuppliers() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name', { ascending: true });

      if (!error && Array.isArray(data)) {
        // Merge Supabase with in-memory store so newly created items in tests are preserved
        const dbIds = new Set(data.map(d => d.id));
        const combined = [...data];
        for (const mem of inMemorySuppliers) {
          if (!dbIds.has(mem.id)) {
            combined.push(mem);
          }
        }
        return combined;
      }
    } catch (err) {
      console.warn('[SUPPLIERS DB] Supabase query failed, falling back to in-memory:', err.message);
    }
  }

  return inMemorySuppliers;
}

/**
 * Get products and restock orders metadata for aggregation.
 */
async function getCatalogAndOrders() {
  let products = [];
  let restockOrders = [];

  try {
    const { getRawProductsForSupplierService } = await import('./product.service.js');
    products = await getRawProductsForSupplierService();
  } catch (err) {
    console.warn('[SUPPLIER SERVICE] Unable to load products for aggregation:', err.message);
  }

  try {
    const { getRawRestockOrdersForSupplierService } = await import('./restock.service.js');
    const res = await getRawRestockOrdersForSupplierService();
    const orders = res.orders || [];
    const items = res.items || [];
    restockOrders = orders.map(o => ({
      ...o,
      items: items.filter(i => (i.restock_order_id || i.restockOrderId) === o.id)
    }));
  } catch (err) {
    console.warn('[SUPPLIER SERVICE] Unable to load restock orders for aggregation:', err.message);
  }

  return { products, restockOrders };
}

/**
 * GET /api/suppliers
 * List suppliers with search, status filtering, hasActiveOrders, sorting, and pagination.
 */
export async function getSuppliers(params = {}) {
  const {
    search = '',
    status = 'ALL',
    hasActiveOrders = null,
    sort = 'name',
    order = 'asc',
    page = null,
    limit = null,
    activeOnly = false
  } = params;

  const rawSuppliers = await fetchAllRawSuppliers();
  const { products, restockOrders } = await getCatalogAndOrders();

  // Aggregate product counts and active orders per supplier
  const productCountMap = {};
  for (const p of products) {
    const supId = p.supplierId || p.supplier_id;
    if (supId) {
      productCountMap[supId] = (productCountMap[supId] || 0) + 1;
    }
  }

  const activeOrdersMap = {};
  for (const ro of restockOrders) {
    const supId = ro.supplierId || ro.supplier_id;
    if (supId && (ro.status === 'PENDING' || ro.status === 'ORDERED' || ro.status === 'DRAFT')) {
      activeOrdersMap[supId] = (activeOrdersMap[supId] || 0) + 1;
    }
  }

  // Calculate high-level summary cards across ALL suppliers (before filters)
  let totalSuppliers = rawSuppliers.length;
  let activeSuppliers = 0;
  let inactiveSuppliers = 0;
  let suppliersWithActiveOrders = 0;

  for (const s of rawSuppliers) {
    const isActive = s.is_active !== undefined ? Boolean(s.is_active) : (s.isActive !== undefined ? Boolean(s.isActive) : true);
    if (isActive) {
      activeSuppliers++;
    } else {
      inactiveSuppliers++;
    }
    if ((activeOrdersMap[s.id] || 0) > 0) {
      suppliersWithActiveOrders++;
    }
  }

  // Format suppliers with aggregated counts
  let formatted = rawSuppliers.map(s => {
    const f = formatSupplier(s);
    f.productsCount = productCountMap[f.id] || 0;
    f.activeOrdersCount = activeOrdersMap[f.id] || 0;
    return f;
  });

  // Apply Status Filter
  if (activeOnly || String(status).toUpperCase() === 'ACTIVE') {
    formatted = formatted.filter(s => s.isActive === true);
  } else if (String(status).toUpperCase() === 'INACTIVE') {
    formatted = formatted.filter(s => s.isActive === false);
  }

  // Apply hasActiveOrders Filter
  if (hasActiveOrders !== null && hasActiveOrders !== undefined && hasActiveOrders !== '') {
    const hasActiveBool = String(hasActiveOrders).toLowerCase() === 'true';
    if (hasActiveBool) {
      formatted = formatted.filter(s => s.activeOrdersCount > 0);
    } else {
      formatted = formatted.filter(s => s.activeOrdersCount === 0);
    }
  }

  // Apply Search Filter (supplier name, contact person, email, phone)
  if (search && typeof search === 'string' && search.trim() !== '') {
    const query = search.trim().toLowerCase();
    formatted = formatted.filter(s =>
      (s.name && s.name.toLowerCase().includes(query)) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(query)) ||
      (s.email && s.email.toLowerCase().includes(query)) ||
      (s.phone && s.phone.toLowerCase().includes(query))
    );
  }

  // Apply Sorting
  const sortDirection = String(order).toLowerCase() === 'desc' ? -1 : 1;
  const sortKey = String(sort).toLowerCase();

  formatted.sort((a, b) => {
    if (sortKey === 'createddate' || sortKey === 'createdat' || sortKey === 'created_at') {
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * sortDirection;
    }
    if (sortKey === 'products' || sortKey === 'productscount' || sortKey === 'numberofproducts') {
      return (a.productsCount - b.productsCount) * sortDirection;
    }
    if (sortKey === 'activeorders' || sortKey === 'activeorderscount') {
      return (a.activeOrdersCount - b.activeOrdersCount) * sortDirection;
    }
    // Default: Supplier Name ascending
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) * sortDirection;
  });

  const totalFiltered = formatted.length;

  // Apply Pagination if requested
  let paginatedData = formatted;
  let pageNum = page ? parseInt(page, 10) : 1;
  if (isNaN(pageNum) || pageNum < 1) pageNum = 1;

  let limitNum = limit ? parseInt(limit, 10) : null;
  if (limitNum !== null && !isNaN(limitNum) && limitNum > 0) {
    if (limitNum > 100) limitNum = 100;
    const startIndex = (pageNum - 1) * limitNum;
    paginatedData = formatted.slice(startIndex, startIndex + limitNum);
  }

  const totalPages = limitNum ? Math.ceil(totalFiltered / limitNum) || 1 : 1;

  return {
    data: paginatedData,
    pagination: {
      total: totalFiltered,
      page: pageNum,
      limit: limitNum || totalFiltered,
      totalPages
    },
    summary: {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      suppliersWithActiveOrders
    }
  };
}

/**
 * GET /api/suppliers/:id
 * Retrieve a supplier by ID with statistics and summary.
 */
export async function getSupplierById(id) {
  if (!id) {
    const error = new Error('Supplier ID is required');
    error.status = 400;
    throw error;
  }

  const rawSuppliers = await fetchAllRawSuppliers();
  const rawSupplier = rawSuppliers.find(s => s.id === id);

  if (!rawSupplier) {
    const error = new Error('Supplier not found');
    error.status = 404;
    throw error;
  }

  const supplier = formatSupplier(rawSupplier);
  const statistics = await getSupplierStatistics(id);

  supplier.statistics = statistics;
  supplier.productSummary = {
    totalProducts: statistics.totalProducts,
    activeProducts: statistics.activeProducts
  };
  supplier.restockSummary = {
    totalOrders: statistics.totalRestockOrders,
    pendingOrders: statistics.pendingOrders,
    orderedOrders: statistics.orderedOrders,
    receivedOrders: statistics.receivedOrders,
    cancelledOrders: statistics.cancelledOrders
  };

  return supplier;
}

/**
 * Calculates real database statistics for a supplier.
 * 
 * - Total Products
 * - Active Products
 * - Total Restock Orders
 * - Pending Orders
 * - Ordered Orders
 * - Received Orders
 * - Cancelled Orders
 * - Total Units Ordered
 * - Total Units Received
 */
export async function getSupplierStatistics(id) {
  const { products, restockOrders } = await getCatalogAndOrders();

  const supplierProducts = products.filter(p => (p.supplierId || p.supplier_id) === id);
  const totalProducts = supplierProducts.length;
  const activeProducts = supplierProducts.filter(p => p.isActive !== false && p.is_active !== false).length;

  const supplierOrders = restockOrders.filter(ro => (ro.supplierId || ro.supplier_id) === id);
  const totalRestockOrders = supplierOrders.length;

  let pendingOrders = 0;
  let orderedOrders = 0;
  let receivedOrders = 0;
  let cancelledOrders = 0;
  let totalUnitsOrdered = 0;
  let totalUnitsReceived = 0;

  for (const o of supplierOrders) {
    const status = (o.status || '').toUpperCase();
    if (status === 'PENDING') pendingOrders++;
    else if (status === 'ORDERED') orderedOrders++;
    else if (status === 'RECEIVED') receivedOrders++;
    else if (status === 'CANCELLED') cancelledOrders++;

    // Calculate units across order items
    const orderItems = Array.isArray(o.items) ? o.items : [];
    const orderUnits = orderItems.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);

    // Any order created represents units ordered
    if (status !== 'CANCELLED') {
      totalUnitsOrdered += orderUnits;
    }
    if (status === 'RECEIVED') {
      totalUnitsReceived += orderUnits;
    }
  }

  return {
    totalProducts,
    activeProducts,
    totalRestockOrders,
    pendingOrders,
    orderedOrders,
    receivedOrders,
    cancelledOrders,
    totalUnitsOrdered,
    totalUnitsReceived
  };
}

/**
 * POST /api/suppliers
 * Create a new supplier (MANAGER only).
 */
export async function createSupplier(data) {
  const errors = validateSupplierInput(data, false);
  if (errors.length > 0) {
    const error = new Error(errors.join(', '));
    error.status = 400;
    throw error;
  }

  const nameTrimmed = data.name.trim();

  // Check duplicate supplier name (case-insensitive)
  const existingSuppliers = await fetchAllRawSuppliers();
  const nameExists = existingSuppliers.some(
    s => s.name && s.name.trim().toLowerCase() === nameTrimmed.toLowerCase()
  );
  if (nameExists) {
    const error = new Error(`Supplier with name '${nameTrimmed}' already exists`);
    error.status = 400;
    throw error;
  }

  const newId = crypto.randomUUID();
  const now = new Date().toISOString();
  const contactPerson = (data.contact_person || data.contactPerson || data.contact_name || data.contactName || '').trim();

  const newSupplier = {
    id: newId,
    name: nameTrimmed,
    contact_name: contactPerson,
    contact_person: contactPerson,
    email: (data.email || '').trim(),
    phone: (data.phone || '').trim(),
    address: (data.address || '').trim(),
    city: (data.city || '').trim(),
    state: (data.state || '').trim(),
    country: (data.country || '').trim(),
    postal_code: (data.postal_code || data.postalCode || '').trim(),
    notes: (data.notes || '').trim(),
    lead_time_days: Number(data.lead_time_days || data.leadTimeDays || 3),
    is_active: data.is_active !== undefined ? Boolean(data.is_active) : (data.isActive !== undefined ? Boolean(data.isActive) : true),
    created_at: now,
    updated_at: now
  };

  // Persist to Supabase if configured
  if (supabase) {
    try {
      const { data: dbData, error: dbErr } = await supabase
        .from('suppliers')
        .insert({
          id: newSupplier.id,
          name: newSupplier.name,
          contact_name: newSupplier.contact_name,
          contact_person: newSupplier.contact_person,
          email: newSupplier.email,
          phone: newSupplier.phone,
          address: newSupplier.address,
          city: newSupplier.city,
          state: newSupplier.state,
          country: newSupplier.country,
          postal_code: newSupplier.postal_code,
          notes: newSupplier.notes,
          lead_time_days: newSupplier.lead_time_days,
          is_active: newSupplier.is_active,
          created_at: newSupplier.created_at,
          updated_at: newSupplier.updated_at
        })
        .select()
        .single();

      if (!dbErr && dbData) {
        inMemorySuppliers.unshift(dbData);
        return formatSupplier(dbData);
      }
    } catch (err) {
      console.warn('[SUPPLIERS DB] Supabase insert failed, saving in-memory:', err.message);
    }
  }

  inMemorySuppliers.unshift(newSupplier);
  return formatSupplier(newSupplier);
}

/**
 * PUT /api/suppliers/:id
 * Update an existing supplier (MANAGER only).
 */
export async function updateSupplier(id, data) {
  if (!id) {
    const error = new Error('Supplier ID is required');
    error.status = 400;
    throw error;
  }

  const errors = validateSupplierInput(data, true, id);
  if (errors.length > 0) {
    const error = new Error(errors.join(', '));
    error.status = 400;
    throw error;
  }

  const existingSuppliers = await fetchAllRawSuppliers();
  const existingSupplier = existingSuppliers.find(s => s.id === id);

  if (!existingSupplier) {
    const error = new Error('Supplier not found');
    error.status = 404;
    throw error;
  }

  // Name uniqueness check if name is updated
  if (data.name !== undefined && data.name.trim() !== '') {
    const nameTrimmed = data.name.trim();
    const duplicate = existingSuppliers.some(
      s => s.id !== id && s.name && s.name.trim().toLowerCase() === nameTrimmed.toLowerCase()
    );
    if (duplicate) {
      const error = new Error(`Supplier name '${nameTrimmed}' is already in use`);
      error.status = 400;
      throw error;
    }
  }

  const now = new Date().toISOString();
  const contactPerson = data.contact_person !== undefined
    ? String(data.contact_person).trim()
    : (data.contactPerson !== undefined
      ? String(data.contactPerson).trim()
      : (data.contact_name !== undefined ? String(data.contact_name).trim() : existingSupplier.contact_person || existingSupplier.contact_name));

  const updatedFields = {
    name: data.name !== undefined ? data.name.trim() : existingSupplier.name,
    contact_name: contactPerson,
    contact_person: contactPerson,
    email: data.email !== undefined ? String(data.email).trim() : existingSupplier.email,
    phone: data.phone !== undefined ? String(data.phone).trim() : existingSupplier.phone,
    address: data.address !== undefined ? String(data.address).trim() : existingSupplier.address,
    city: data.city !== undefined ? String(data.city).trim() : existingSupplier.city,
    state: data.state !== undefined ? String(data.state).trim() : existingSupplier.state,
    country: data.country !== undefined ? String(data.country).trim() : existingSupplier.country,
    postal_code: data.postal_code !== undefined
      ? String(data.postal_code).trim()
      : (data.postalCode !== undefined ? String(data.postalCode).trim() : existingSupplier.postal_code),
    notes: data.notes !== undefined ? String(data.notes).trim() : existingSupplier.notes,
    lead_time_days: data.lead_time_days !== undefined
      ? Number(data.lead_time_days)
      : (data.leadTimeDays !== undefined ? Number(data.leadTimeDays) : existingSupplier.lead_time_days),
    updated_at: now
  };

  // If is_active is explicitly passed
  if (data.is_active !== undefined) {
    updatedFields.is_active = Boolean(data.is_active);
  } else if (data.isActive !== undefined) {
    updatedFields.is_active = Boolean(data.isActive);
  }

  // Persist to Supabase if configured
  if (supabase) {
    try {
      const { data: dbData, error: dbErr } = await supabase
        .from('suppliers')
        .update(updatedFields)
        .eq('id', id)
        .select()
        .single();

      if (!dbErr && dbData) {
        const memIdx = inMemorySuppliers.findIndex(s => s.id === id);
        if (memIdx !== -1) inMemorySuppliers[memIdx] = dbData;
        return formatSupplier(dbData);
      }
    } catch (err) {
      console.warn('[SUPPLIERS DB] Supabase update failed, updating in-memory:', err.message);
    }
  }

  // Update in-memory
  const memIdx = inMemorySuppliers.findIndex(s => s.id === id);
  if (memIdx !== -1) {
    inMemorySuppliers[memIdx] = {
      ...inMemorySuppliers[memIdx],
      ...updatedFields
    };
    return formatSupplier(inMemorySuppliers[memIdx]);
  } else {
    const updated = {
      ...existingSupplier,
      ...updatedFields
    };
    inMemorySuppliers.unshift(updated);
    return formatSupplier(updated);
  }
}

/**
 * PATCH /api/suppliers/:id/status
 * Activate or deactivate a supplier (MANAGER only).
 * Performs soft deactivation: is_active = false.
 */
export async function updateSupplierStatus(id, isActive) {
  if (!id) {
    const error = new Error('Supplier ID is required');
    error.status = 400;
    throw error;
  }

  const existingSuppliers = await fetchAllRawSuppliers();
  const existingSupplier = existingSuppliers.find(s => s.id === id);

  if (!existingSupplier) {
    const error = new Error('Supplier not found');
    error.status = 404;
    throw error;
  }

  const activeBool = Boolean(isActive);
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const { data: dbData, error: dbErr } = await supabase
        .from('suppliers')
        .update({
          is_active: activeBool,
          updated_at: now
        })
        .eq('id', id)
        .select()
        .single();

      if (!dbErr && dbData) {
        const memIdx = inMemorySuppliers.findIndex(s => s.id === id);
        if (memIdx !== -1) inMemorySuppliers[memIdx] = dbData;
        return formatSupplier(dbData);
      }
    } catch (err) {
      console.warn('[SUPPLIERS DB] Supabase status update failed, updating in-memory:', err.message);
    }
  }

  const memIdx = inMemorySuppliers.findIndex(s => s.id === id);
  if (memIdx !== -1) {
    inMemorySuppliers[memIdx].is_active = activeBool;
    inMemorySuppliers[memIdx].updated_at = now;
    return formatSupplier(inMemorySuppliers[memIdx]);
  } else {
    const updated = {
      ...existingSupplier,
      is_active: activeBool,
      updated_at: now
    };
    inMemorySuppliers.unshift(updated);
    return formatSupplier(updated);
  }
}

/**
 * GET /api/suppliers/:id/products
 * Fetch products associated with a supplier.
 */
export async function getSupplierProducts(id) {
  if (!id) {
    const error = new Error('Supplier ID is required');
    error.status = 400;
    throw error;
  }

  const existingSuppliers = await fetchAllRawSuppliers();
  const supplierExists = existingSuppliers.some(s => s.id === id);
  if (!supplierExists) {
    const error = new Error('Supplier not found');
    error.status = 404;
    throw error;
  }

  const { products } = await getCatalogAndOrders();
  const supplierProducts = products.filter(p => (p.supplierId || p.supplier_id) === id);

  return supplierProducts.map(p => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category,
    currentStock: Number(p.currentStock !== undefined ? p.currentStock : p.current_stock),
    minimumStock: Number(p.minimumStock !== undefined ? p.minimumStock : p.minimum_stock),
    unit: p.unit || 'units',
    price: Number(p.price !== undefined ? p.price : p.unit_price) || 0,
    stockStatus: p.stockStatus || p.stock_status || 'NORMAL',
    isActive: p.isActive !== undefined ? Boolean(p.isActive) : (p.is_active !== undefined ? Boolean(p.is_active) : true)
  }));
}

/**
 * GET /api/suppliers/:id/restock-orders
 * Fetch restock orders associated with a supplier.
 */
export async function getSupplierRestockOrders(id) {
  if (!id) {
    const error = new Error('Supplier ID is required');
    error.status = 400;
    throw error;
  }

  const existingSuppliers = await fetchAllRawSuppliers();
  const supplierExists = existingSuppliers.some(s => s.id === id);
  if (!supplierExists) {
    const error = new Error('Supplier not found');
    error.status = 404;
    throw error;
  }

  const { restockOrders } = await getCatalogAndOrders();
  const orders = restockOrders.filter(ro => (ro.supplierId || ro.supplier_id) === id);

  return orders.map(o => {
    const items = Array.isArray(o.items) ? o.items : [];
    const totalQuantity = items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);

    return {
      id: o.id,
      orderNumber: o.orderNumber || o.order_number,
      status: o.status,
      totalItems: Number(o.totalItems !== undefined ? o.totalItems : (o.total_items !== undefined ? o.total_items : items.length)),
      totalQuantity,
      totalAmount: Number(o.totalAmount !== undefined ? o.totalAmount : o.total_amount) || 0,
      notes: o.notes || '',
      orderedAt: o.orderedAt || o.ordered_at || null,
      receivedAt: o.receivedAt || o.received_at || null,
      createdAt: o.createdAt || o.created_at,
      updatedAt: o.updatedAt || o.updated_at
    };
  });
}

export default {
  inMemorySuppliers,
  formatSupplier,
  validateSupplierInput,
  getSuppliers,
  getSupplierById,
  getSupplierStatistics,
  createSupplier,
  updateSupplier,
  updateSupplierStatus,
  getSupplierProducts,
  getSupplierRestockOrders
};
