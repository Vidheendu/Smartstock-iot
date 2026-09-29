/**
 * SmartStock Phase 12: Supplier Management Test Suite
 * 
 * Verifies all 20 required criteria specified in Section 45:
 * 1. Get suppliers
 * 2. Search suppliers
 * 3. Filter active suppliers
 * 4. Filter inactive suppliers
 * 5. Create supplier
 * 6. Invalid supplier data
 * 7. Duplicate supplier name
 * 8. Update supplier
 * 9. Activate supplier
 * 10. Deactivate supplier
 * 11. Get supplier details
 * 12. Get supplier products
 * 13. Get supplier restock orders
 * 14. Supplier statistics
 * 15. STAFF cannot create supplier
 * 16. STAFF cannot update supplier
 * 17. STAFF cannot change supplier status
 * 18. MANAGER can perform supplier management
 * 19. Inactive supplier cannot be selected for a new restock order
 * 20. Historical restock orders still display inactive suppliers
 */

import http from 'http';
import app from './server.js';
import { generateToken } from './src/utils/jwt.js';

let server;
let baseUrl;
let managerToken;
let staffToken;

const MANAGER_USER = {
  id: 'e0000000-0000-0000-0000-000000000001',
  email: 'manager@smartstock.com',
  name: 'Alex Morgan',
  role: 'MANAGER'
};

const STAFF_USER = {
  id: 'e0000000-0000-0000-0000-000000000002',
  email: 'staff@smartstock.com',
  name: 'Taylor Brooks',
  role: 'STAFF'
};

const SEED_SUPPLIER_1_ID = 'a0000000-0000-0000-0000-000000000001'; // Fresh Dairy & Bakery Ltd
const SEED_SUPPLIER_3_ID = 'a0000000-0000-0000-0000-000000000003'; // Apex Beverages & Snacks Inc
const MILK_ID = 'b0000000-0000-0000-0000-000000000001';

async function makeRequest(path, options = {}) {
  const url = new URL(path, baseUrl);
  const headers = options.headers || {};
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const reqOptions = {
    method: options.method || 'GET',
    headers
  };

  return new Promise((resolve, reject) => {
    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = null;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
          raw: data
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`[PASS] ${message}`);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('SMARTSTOCK PHASE 12: SUPPLIER MANAGEMENT TEST SUITE');
  console.log('====================================================\n');

  // Start test server on ephemeral port
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`[Test Server] Listening on ${baseUrl}\n`);
      resolve();
    });
  });

  // Generate tokens
  managerToken = generateToken({
    userId: MANAGER_USER.id,
    email: MANAGER_USER.email,
    role: MANAGER_USER.role
  });

  staffToken = generateToken({
    userId: STAFF_USER.id,
    email: STAFF_USER.email,
    role: STAFF_USER.role
  });

  let createdSupplierId = null;

  try {
    // --- TEST 1: Get suppliers ---
    console.log('--- TEST 1: Get Suppliers ---');
    const getRes = await makeRequest('/api/suppliers', { token: staffToken });
    assert(getRes.status === 200, 'GET /api/suppliers returns HTTP 200');
    assert(getRes.data.success === true, 'Response indicates success = true');
    assert(Array.isArray(getRes.data.data), 'Returns data as an array of suppliers');
    assert(getRes.data.data.length >= 3, 'Pre-seeded suppliers list contains at least 3 suppliers');
    assert(getRes.data.summary !== undefined, 'Summary object included with KPI metrics');
    assert(getRes.data.summary.totalSuppliers >= 3, 'Summary reflects accurate total suppliers count');

    // --- TEST 2: Search suppliers ---
    console.log('\n--- TEST 2: Search Suppliers ---');
    const searchRes = await makeRequest('/api/suppliers?search=Dairy', { token: staffToken });
    assert(searchRes.status === 200, 'Search query returns HTTP 200');
    assert(searchRes.data.data.length >= 1, 'Search finds at least 1 supplier for "Dairy"');
    assert(
      searchRes.data.data.some(s => s.name.includes('Dairy')),
      'Result contains "Fresh Dairy & Bakery Ltd"'
    );

    const contactSearch = await makeRequest('/api/suppliers?search=Sarah', { token: staffToken });
    assert(contactSearch.status === 200, 'Contact person search returns HTTP 200');
    assert(
      contactSearch.data.data.some(s => s.name.includes('Dairy')),
      'Search matches contact person Sarah Jenkins'
    );

    // --- TEST 3: Filter active suppliers ---
    console.log('\n--- TEST 3: Filter Active Suppliers ---');
    const activeRes = await makeRequest('/api/suppliers?status=ACTIVE', { token: staffToken });
    assert(activeRes.status === 200, 'GET /api/suppliers?status=ACTIVE returns 200');
    assert(
      activeRes.data.data.every(s => s.isActive === true),
      'All returned suppliers have isActive = true'
    );

    // --- TEST 4: Filter inactive suppliers ---
    console.log('\n--- TEST 4: Filter Inactive Suppliers ---');
    const inactiveRes = await makeRequest('/api/suppliers?status=INACTIVE', { token: staffToken });
    assert(inactiveRes.status === 200, 'GET /api/suppliers?status=INACTIVE returns 200');
    assert(
      inactiveRes.data.data.every(s => s.isActive === false),
      'All returned suppliers have isActive = false'
    );

    // --- TEST 5: Create supplier (MANAGER) ---
    console.log('\n--- TEST 5: Create Supplier ---');
    const newSupplierPayload = {
      name: 'Pacific Organics & Produce Co',
      contact_person: 'Elena Vance',
      email: 'orders@pacificorganics.com',
      phone: '+1-555-0987',
      address: '772 Harbor View Way',
      city: 'Seattle',
      state: 'WA',
      country: 'USA',
      postal_code: '98101',
      notes: 'Certified organic fresh produce wholesaler',
      lead_time_days: 3
    };

    const createRes = await makeRequest('/api/suppliers', {
      method: 'POST',
      token: managerToken,
      body: newSupplierPayload
    });

    assert(createRes.status === 201, 'POST /api/suppliers returns HTTP 201 Created');
    assert(createRes.data.success === true, 'Supplier creation success = true');
    assert(createRes.data.supplier.name === 'Pacific Organics & Produce Co', 'Supplier name matches payload');
    assert(createRes.data.supplier.isActive === true, 'Newly created supplier defaults to isActive = true');
    createdSupplierId = createRes.data.supplier.id;
    assert(Boolean(createdSupplierId), 'Created supplier assigned valid UUID ID');

    // --- TEST 6: Invalid supplier data ---
    console.log('\n--- TEST 6: Invalid Supplier Data ---');
    const emptyNameRes = await makeRequest('/api/suppliers', {
      method: 'POST',
      token: managerToken,
      body: { name: '   ' }
    });
    assert(emptyNameRes.status === 400, 'Empty supplier name rejected with HTTP 400');

    const invalidEmailRes = await makeRequest('/api/suppliers', {
      method: 'POST',
      token: managerToken,
      body: { name: 'Valid Name Ltd', email: 'not-an-email' }
    });
    assert(invalidEmailRes.status === 400, 'Invalid email format rejected with HTTP 400');

    const shortPhoneRes = await makeRequest('/api/suppliers', {
      method: 'POST',
      token: managerToken,
      body: { name: 'Valid Name Ltd', phone: '12' }
    });
    assert(shortPhoneRes.status === 400, 'Invalid short phone number rejected with HTTP 400');

    // --- TEST 7: Duplicate supplier name ---
    console.log('\n--- TEST 7: Duplicate Supplier Name ---');
    const dupRes = await makeRequest('/api/suppliers', {
      method: 'POST',
      token: managerToken,
      body: { name: 'Pacific Organics & Produce Co' }
    });
    assert(dupRes.status === 400, 'Duplicate supplier name rejected with HTTP 400');

    // --- TEST 8: Update supplier (MANAGER) ---
    console.log('\n--- TEST 8: Update Supplier ---');
    const updateRes = await makeRequest(`/api/suppliers/${createdSupplierId}`, {
      method: 'PUT',
      token: managerToken,
      body: {
        name: 'Pacific Organics & Produce Logistics',
        contact_person: 'Elena Vance-Smith',
        city: 'Tacoma',
        notes: 'Updated delivery schedules to Mondays and Thursdays'
      }
    });

    assert(updateRes.status === 200, 'PUT /api/suppliers/:id returns HTTP 200');
    assert(
      updateRes.data.supplier.name === 'Pacific Organics & Produce Logistics',
      'Supplier name updated successfully'
    );
    assert(
      updateRes.data.supplier.contactPerson === 'Elena Vance-Smith',
      'Contact person updated successfully'
    );
    assert(updateRes.data.supplier.city === 'Tacoma', 'City updated successfully');
    assert(updateRes.data.supplier.id === createdSupplierId, 'Supplier ID remained unchanged');

    // --- TEST 9: Deactivate supplier ---
    console.log('\n--- TEST 9: Deactivate Supplier (Soft Deactivation) ---');
    const deactRes = await makeRequest(`/api/suppliers/${createdSupplierId}/status`, {
      method: 'PATCH',
      token: managerToken,
      body: { is_active: false }
    });

    assert(deactRes.status === 200, 'PATCH /api/suppliers/:id/status (deactivate) returns 200');
    assert(deactRes.data.supplier.isActive === false, 'Supplier is now isActive = false');

    // Verify still exists in DB/list (not deleted)
    const checkList = await makeRequest(`/api/suppliers/${createdSupplierId}`, { token: staffToken });
    assert(checkList.status === 200, 'Deactivated supplier still exists and is retrievable');
    assert(checkList.data.supplier.isActive === false, 'Deactivated status confirmed in details');

    // --- TEST 10: Activate supplier ---
    console.log('\n--- TEST 10: Activate Supplier ---');
    const actRes = await makeRequest(`/api/suppliers/${createdSupplierId}/status`, {
      method: 'PATCH',
      token: managerToken,
      body: { is_active: true }
    });

    assert(actRes.status === 200, 'PATCH /api/suppliers/:id/status (activate) returns 200');
    assert(actRes.data.supplier.isActive === true, 'Supplier is now isActive = true');

    // --- TEST 11: Get supplier details ---
    console.log('\n--- TEST 11: Get Supplier Details ---');
    const detailsRes = await makeRequest(`/api/suppliers/${SEED_SUPPLIER_1_ID}`, { token: staffToken });
    assert(detailsRes.status === 200, 'GET /api/suppliers/:id returns HTTP 200');
    assert(detailsRes.data.supplier.name === 'Fresh Dairy & Bakery Ltd', 'Returns correct supplier name');
    assert(detailsRes.data.supplier.statistics !== undefined, 'Returns statistics object');
    assert(detailsRes.data.supplier.productSummary !== undefined, 'Returns productSummary object');
    assert(detailsRes.data.supplier.restockSummary !== undefined, 'Returns restockSummary object');

    // --- TEST 12: Get supplier products ---
    console.log('\n--- TEST 12: Get Supplier Products ---');
    const productsRes = await makeRequest(`/api/suppliers/${SEED_SUPPLIER_1_ID}/products`, { token: staffToken });
    assert(productsRes.status === 200, 'GET /api/suppliers/:id/products returns HTTP 200');
    assert(Array.isArray(productsRes.data.data), 'Returns products array');
    assert(productsRes.data.data.length >= 2, 'Fresh Dairy has at least 2 products (Milk, Bread)');
    const milk = productsRes.data.data.find(p => p.sku === 'SKU-MILK-001');
    assert(Boolean(milk), 'Products list contains SKU-MILK-001');
    assert(milk.stockStatus !== undefined, 'Product has stockStatus');

    // --- TEST 13: Get supplier restock orders ---
    console.log('\n--- TEST 13: Get Supplier Restock Orders ---');
    const ordersRes = await makeRequest(`/api/suppliers/${SEED_SUPPLIER_3_ID}/restock-orders`, { token: staffToken });
    assert(ordersRes.status === 200, 'GET /api/suppliers/:id/restock-orders returns HTTP 200');
    assert(Array.isArray(ordersRes.data.data), 'Returns orders array');
    assert(ordersRes.data.data.length >= 1, 'Supplier 3 has at least 1 order (RS-0001)');
    const order1 = ordersRes.data.data[0];
    assert(order1.orderNumber !== undefined, 'Order has orderNumber');
    assert(order1.totalQuantity !== undefined, 'Order has totalQuantity');

    // --- TEST 14: Supplier statistics ---
    console.log('\n--- TEST 14: Supplier Statistics ---');
    const stats = detailsRes.data.supplier.statistics;
    assert(typeof stats.totalProducts === 'number', 'Statistics contains numeric totalProducts');
    assert(typeof stats.activeProducts === 'number', 'Statistics contains numeric activeProducts');
    assert(typeof stats.totalRestockOrders === 'number', 'Statistics contains numeric totalRestockOrders');
    assert(typeof stats.totalUnitsOrdered === 'number', 'Statistics contains numeric totalUnitsOrdered');
    assert(typeof stats.totalUnitsReceived === 'number', 'Statistics contains numeric totalUnitsReceived');

    // --- TEST 15: STAFF cannot create supplier ---
    console.log('\n--- TEST 15: STAFF Cannot Create Supplier ---');
    const staffCreateRes = await makeRequest('/api/suppliers', {
      method: 'POST',
      token: staffToken,
      body: { name: 'Unauthorized Vendor Inc' }
    });
    assert(staffCreateRes.status === 403, 'STAFF POST /api/suppliers rejected with HTTP 403 Forbidden');

    // --- TEST 16: STAFF cannot update supplier ---
    console.log('\n--- TEST 16: STAFF Cannot Update Supplier ---');
    const staffUpdateRes = await makeRequest(`/api/suppliers/${createdSupplierId}`, {
      method: 'PUT',
      token: staffToken,
      body: { name: 'Hacked Name' }
    });
    assert(staffUpdateRes.status === 403, 'STAFF PUT /api/suppliers/:id rejected with HTTP 403 Forbidden');

    // --- TEST 17: STAFF cannot change supplier status ---
    console.log('\n--- TEST 17: STAFF Cannot Change Supplier Status ---');
    const staffStatusRes = await makeRequest(`/api/suppliers/${createdSupplierId}/status`, {
      method: 'PATCH',
      token: staffToken,
      body: { is_active: false }
    });
    assert(staffStatusRes.status === 403, 'STAFF PATCH /api/suppliers/:id/status rejected with HTTP 403');

    // --- TEST 18: MANAGER can perform supplier management ---
    console.log('\n--- TEST 18: MANAGER Can Perform Supplier Management ---');
    assert(createRes.status === 201, 'MANAGER was permitted to create supplier');
    assert(updateRes.status === 200, 'MANAGER was permitted to update supplier');
    assert(deactRes.status === 200, 'MANAGER was permitted to toggle status');

    // --- TEST 19: Inactive supplier cannot be selected for a new restock order ---
    console.log('\n--- TEST 19: Inactive Supplier Cannot Be Selected For A New Restock Order ---');
    // First deactivate createdSupplierId
    await makeRequest(`/api/suppliers/${createdSupplierId}/status`, {
      method: 'PATCH',
      token: managerToken,
      body: { is_active: false }
    });

    // Try to create restock order with deactivated supplier
    const restockWithInactive = await makeRequest('/api/restock', {
      method: 'POST',
      token: managerToken,
      body: {
        supplierId: createdSupplierId,
        items: [{ productId: MILK_ID, quantity: 10, unitPrice: 2.50 }]
      }
    });

    assert(
      restockWithInactive.status === 400,
      'Creating restock order with inactive supplier rejected with HTTP 400'
    );
    assert(
      restockWithInactive.data.message.toLowerCase().includes('inactive'),
      'Controlled error message mentions inactive supplier'
    );

    // --- TEST 20: Historical restock orders still display inactive suppliers ---
    console.log('\n--- TEST 20: Historical Restock Orders Still Display Inactive Suppliers ---');
    // Deactivate supplier 3 who has an existing historical order (RS-0001)
    await makeRequest(`/api/suppliers/${SEED_SUPPLIER_3_ID}/status`, {
      method: 'PATCH',
      token: managerToken,
      body: { is_active: false }
    });

    // Fetch restock orders list
    const historicalRes = await makeRequest('/api/restock', { token: staffToken });
    assert(historicalRes.status === 200, 'GET /api/restock returns 200');
    const rs0001 = historicalRes.data.orders.find(o => o.orderNumber === 'RS-0001');
    assert(Boolean(rs0001), 'Historical restock order RS-0001 exists');
    assert(rs0001.supplier !== null, 'Historical order continues to link and display supplier object');
    assert(
      rs0001.supplier.name === 'Apex Beverages & Snacks Inc',
      'Historical order displays correct supplier name despite being inactive'
    );

    // Reactivate supplier 3 to leave repository clean
    await makeRequest(`/api/suppliers/${SEED_SUPPLIER_3_ID}/status`, {
      method: 'PATCH',
      token: managerToken,
      body: { is_active: true }
    });

    console.log('\n====================================================');
    console.log('ALL PHASE 12 TESTS PASSED SUCCESSFULLY! (20/20)');
    console.log('====================================================\n');
    process.exit(0);
  } finally {
    if (server) {
      server.close();
    }
  }
}

runTests().catch(err => {
  console.error('\n[FATAL ERROR IN PHASE 12 TEST SUITE]:', err);
  if (server) server.close();
  process.exit(1);
});
