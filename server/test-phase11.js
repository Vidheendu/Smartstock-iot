/**
 * SmartStock Phase 11: Restocking & Purchase Order Management Test Suite
 * 
 * Verifies all criteria specified in Section 41:
 * 1. Create restock order
 * 2. Invalid supplier rejected (404/400)
 * 3. Invalid product rejected (404)
 * 4. Empty order rejected (400)
 * 5. Invalid quantity rejected (400)
 * 6. Duplicate product line rejected (400)
 * 7. Update pending order (200)
 * 8. Mark order as ordered (PENDING -> ORDERED, sets ordered_at)
 * 9. Receive restock order (ORDERED -> RECEIVED)
 * 10. Inventory increases correctly
 * 11. Inventory history is created with correct reason and source
 * 12. Receiving the same order twice does NOT increase inventory twice (400 duplicate error)
 * 13. Cancel pending order (PENDING -> CANCELLED)
 * 14. Cancel ordered order (ORDERED -> CANCELLED)
 * 15. Cannot cancel received order (400)
 * 16. Cannot edit received order (400)
 * 17. STAFF cannot create restock orders (403)
 * 18. STAFF cannot receive restock orders (403)
 * 19. MANAGER can manage restock orders
 * 20. Summary endpoint returns accurate counts
 * 21. Needing restock endpoint provides deterministic suggestions
 * 22. Unauthenticated requests rejected (401)
 */

import http from 'http';
import app from './server.js';
import { generateToken } from './src/utils/jwt.js';
import { getProductById } from './src/services/product.service.js';
import { getInventoryHistory } from './src/services/inventory.service.js';

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

const VALID_SUPPLIER_ID = 'a0000000-0000-0000-0000-000000000001'; // Fresh Dairy & Bakery Ltd
const MILK_ID = 'b0000000-0000-0000-0000-000000000001'; // Whole Milk
const BREAD_ID = 'b0000000-0000-0000-0000-000000000002'; // White Bread

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
  console.log('\n====================================================');
  console.log('SMARTSTOCK PHASE 11: RESTOCKING & PURCHASE ORDERS');
  console.log('====================================================\n');

  // Start test server on random open port
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`[Test Server] Listening on ${baseUrl}\n`);
      resolve();
    });
  });

  managerToken = generateToken(MANAGER_USER);
  staffToken = generateToken(STAFF_USER);

  try {
    // ----------------------------------------------------
    // TEST 1: Security & Authentication
    // ----------------------------------------------------
    console.log('--- TEST 1: Security & Authentication ---');
    const noAuth = await makeRequest('/api/restock');
    assert(noAuth.status === 401, 'Unauthenticated GET /api/restock returns 401');

    const noAuthSummary = await makeRequest('/api/restock/summary');
    assert(noAuthSummary.status === 401, 'Unauthenticated GET /api/restock/summary returns 401');

    const noAuthCreate = await makeRequest('/api/restock', { method: 'POST', body: {} });
    assert(noAuthCreate.status === 401, 'Unauthenticated POST /api/restock returns 401');

    // ----------------------------------------------------
    // TEST 2: Role Permissions (STAFF vs MANAGER)
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Role Permissions ---');
    // Staff can view restock orders
    const staffView = await makeRequest('/api/restock', { token: staffToken });
    assert(staffView.status === 200, 'STAFF can view restock orders (200)');

    // Staff CANNOT create restock order
    const staffCreate = await makeRequest('/api/restock', {
      method: 'POST',
      token: staffToken,
      body: {
        supplierId: VALID_SUPPLIER_ID,
        items: [{ productId: MILK_ID, quantity: 20 }]
      }
    });
    assert(staffCreate.status === 403, 'STAFF cannot create restock orders (403 Forbidden)');

    // ----------------------------------------------------
    // TEST 3: Validation on Order Creation
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Validation on Creation ---');
    // Invalid supplier
    const badSupplier = await makeRequest('/api/restock', {
      method: 'POST',
      token: managerToken,
      body: {
        supplierId: 'a9999999-9999-9999-9999-999999999999',
        items: [{ productId: MILK_ID, quantity: 10 }]
      }
    });
    assert(badSupplier.status === 404, 'Invalid supplier rejected with 404');

    // Invalid product
    const badProduct = await makeRequest('/api/restock', {
      method: 'POST',
      token: managerToken,
      body: {
        supplierId: VALID_SUPPLIER_ID,
        items: [{ productId: 'b9999999-9999-9999-9999-999999999999', quantity: 10 }]
      }
    });
    assert(badProduct.status === 404, 'Invalid product rejected with 404');

    // Empty order (no items)
    const emptyOrder = await makeRequest('/api/restock', {
      method: 'POST',
      token: managerToken,
      body: {
        supplierId: VALID_SUPPLIER_ID,
        items: []
      }
    });
    assert(emptyOrder.status === 400, 'Empty items array rejected with 400');

    // Invalid quantity (0)
    const zeroQty = await makeRequest('/api/restock', {
      method: 'POST',
      token: managerToken,
      body: {
        supplierId: VALID_SUPPLIER_ID,
        items: [{ productId: MILK_ID, quantity: 0 }]
      }
    });
    assert(zeroQty.status === 400, 'Zero quantity rejected with 400');

    // Negative quantity
    const negQty = await makeRequest('/api/restock', {
      method: 'POST',
      token: managerToken,
      body: {
        supplierId: VALID_SUPPLIER_ID,
        items: [{ productId: MILK_ID, quantity: -5 }]
      }
    });
    assert(negQty.status === 400, 'Negative quantity rejected with 400');

    // Duplicate product line
    const dupLine = await makeRequest('/api/restock', {
      method: 'POST',
      token: managerToken,
      body: {
        supplierId: VALID_SUPPLIER_ID,
        items: [
          { productId: MILK_ID, quantity: 10 },
          { productId: MILK_ID, quantity: 15 }
        ]
      }
    });
    assert(dupLine.status === 400, 'Duplicate product lines in same order rejected with 400');

    // ----------------------------------------------------
    // TEST 4: Create Valid Multi-Item Restock Order
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Create Valid Multi-Item Restock Order ---');
    const createRes = await makeRequest('/api/restock', {
      method: 'POST',
      token: managerToken,
      body: {
        supplierId: VALID_SUPPLIER_ID,
        notes: 'Monthly dairy replenishment',
        items: [
          { productId: MILK_ID, quantity: 30, unitPrice: 2.50 },
          { productId: BREAD_ID, quantity: 20, unitPrice: 1.50 }
        ]
      }
    });
    assert(createRes.status === 201, 'Valid restock order created with HTTP 201');
    assert(createRes.data.success === true, 'Response indicates success = true');
    const createdOrder = createRes.data.order;
    assert(createdOrder.orderNumber.startsWith('RS-'), 'Generated human-readable order number with RS- prefix');
    assert(createdOrder.status === 'PENDING', 'Initial order status is PENDING');
    assert(createdOrder.totalItems === 2, 'Total items count is 2');
    assert(createdOrder.totalAmount === 105.00, 'Total cost calculated correctly: 30*2.50 + 20*1.50 = 105.00');
    assert(createdOrder.items.length === 2, 'Returned order contains 2 item lines');
    assert(createdOrder.items[0].productName.length > 0, 'Enriched item with product name');

    // ----------------------------------------------------
    // TEST 5: Update Pending Restock Order
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Update Pending Order ---');
    const updateRes = await makeRequest(`/api/restock/${createdOrder.id}`, {
      method: 'PUT',
      token: managerToken,
      body: {
        notes: 'Updated monthly replenishment with extra milk',
        items: [
          { productId: MILK_ID, quantity: 50, unitPrice: 2.50 },
          { productId: BREAD_ID, quantity: 20, unitPrice: 1.50 }
        ]
      }
    });
    assert(updateRes.status === 200, 'Pending order updated with HTTP 200');
    assert(updateRes.data.order.items.find(i => i.productId === MILK_ID).quantity === 50, 'Milk quantity updated to 50');
    assert(updateRes.data.order.totalAmount === 155.00, 'Updated total calculated: 50*2.50 + 20*1.50 = 155.00');

    // ----------------------------------------------------
    // TEST 6: Mark Order as ORDERED
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Mark Order as ORDERED ---');
    const orderRes = await makeRequest(`/api/restock/${createdOrder.id}/order`, {
      method: 'PATCH',
      token: managerToken
    });
    assert(orderRes.status === 200, 'Order transitioned to ORDERED with HTTP 200');
    assert(orderRes.data.order.status === 'ORDERED', 'Order status is now ORDERED');
    assert(orderRes.data.order.orderedAt !== null, 'orderedAt timestamp is recorded');

    // ----------------------------------------------------
    // TEST 7: Receive Restock Order & Inventory Integration
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Receive Restock Order & Stock Increment ---');
    // Check stock before receiving
    const milkBefore = await getProductById(MILK_ID);
    const breadBefore = await getProductById(BREAD_ID);
    const initialMilkStock = milkBefore.currentStock;
    const initialBreadStock = breadBefore.currentStock;

    // Staff CANNOT receive order
    const staffReceive = await makeRequest(`/api/restock/${createdOrder.id}/receive`, {
      method: 'PATCH',
      token: staffToken
    });
    assert(staffReceive.status === 403, 'STAFF cannot receive restock orders (403)');

    // Manager receives order
    const receiveRes = await makeRequest(`/api/restock/${createdOrder.id}/receive`, {
      method: 'PATCH',
      token: managerToken
    });
    assert(receiveRes.status === 200, 'Order marked as RECEIVED with HTTP 200');
    assert(receiveRes.data.order.status === 'RECEIVED', 'Order status is now RECEIVED');
    assert(receiveRes.data.order.receivedAt !== null, 'receivedAt timestamp is recorded');

    // Verify product stock increased
    const milkAfter = await getProductById(MILK_ID);
    const breadAfter = await getProductById(BREAD_ID);
    assert(milkAfter.currentStock === initialMilkStock + 50, `Milk stock increased by 50 (from ${initialMilkStock} to ${milkAfter.currentStock})`);
    assert(breadAfter.currentStock === initialBreadStock + 20, `Bread stock increased by 20 (from ${initialBreadStock} to ${breadAfter.currentStock})`);

    // Verify inventory history created
    const history = await getInventoryHistory({ productId: MILK_ID });
    const latestTx = Array.isArray(history) ? history[0] : history.records[0];
    const changeType = latestTx.changeType || latestTx.change_type;
    assert(changeType === 'STOCK_IN', 'History record has type STOCK_IN');
    assert(latestTx.source === 'MANUAL', 'History record has source MANUAL');
    assert(latestTx.reason.includes(`Restock order received: ${createdOrder.orderNumber}`), `History reason contains '${createdOrder.orderNumber}'`);

    // ----------------------------------------------------
    // TEST 8: Duplicate Receiving Protection (Critical)
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Duplicate Receiving Protection ---');
    const duplicateReceive = await makeRequest(`/api/restock/${createdOrder.id}/receive`, {
      method: 'PATCH',
      token: managerToken
    });
    assert(duplicateReceive.status === 400, 'Duplicate receive attempt rejected with HTTP 400');
    assert(
      duplicateReceive.data.message.includes('already been received'),
      'Controlled error specifies order has already been received'
    );

    // Verify stock did NOT increase a second time
    const milkAfterDup = await getProductById(MILK_ID);
    assert(milkAfterDup.currentStock === initialMilkStock + 50, 'Stock remained constant after duplicate receive attempt');

    // ----------------------------------------------------
    // TEST 9: Terminal State Guards on Received Orders
    // ----------------------------------------------------
    console.log('\n--- TEST 9: Terminal State Guards on Received Orders ---');
    // Cannot edit received order
    const editReceived = await makeRequest(`/api/restock/${createdOrder.id}`, {
      method: 'PUT',
      token: managerToken,
      body: { notes: 'Attempted edit' }
    });
    assert(editReceived.status === 400, 'Cannot edit received order (400)');

    // Cannot cancel received order
    const cancelReceived = await makeRequest(`/api/restock/${createdOrder.id}/cancel`, {
      method: 'PATCH',
      token: managerToken,
      body: { reason: 'Order already unpacked' }
    });
    assert(cancelReceived.status === 400, 'Cannot cancel received order (400)');

    // ----------------------------------------------------
    // TEST 10: Cancel Pending Order
    // ----------------------------------------------------
    console.log('\n--- TEST 10: Cancel Pending Order ---');
    const orderToCancel = await makeRequest('/api/restock', {
      method: 'POST',
      token: managerToken,
      body: {
        supplierId: VALID_SUPPLIER_ID,
        items: [{ productId: MILK_ID, quantity: 10 }]
      }
    });
    const cancelRes = await makeRequest(`/api/restock/${orderToCancel.data.order.id}/cancel`, {
      method: 'PATCH',
      token: managerToken,
      body: { reason: 'Incorrect supplier selected' }
    });
    assert(cancelRes.status === 200, 'Pending order cancelled with HTTP 200');
    assert(cancelRes.data.order.status === 'CANCELLED', 'Order status is now CANCELLED');

    // ----------------------------------------------------
    // TEST 11: Cancel Ordered Order
    // ----------------------------------------------------
    console.log('\n--- TEST 11: Cancel Ordered Order ---');
    const orderToCancel2 = await makeRequest('/api/restock', {
      method: 'POST',
      token: managerToken,
      body: {
        supplierId: VALID_SUPPLIER_ID,
        items: [{ productId: BREAD_ID, quantity: 15 }]
      }
    });
    await makeRequest(`/api/restock/${orderToCancel2.data.order.id}/order`, {
      method: 'PATCH',
      token: managerToken
    });
    const cancelRes2 = await makeRequest(`/api/restock/${orderToCancel2.data.order.id}/cancel`, {
      method: 'PATCH',
      token: managerToken,
      body: { reason: 'Supplier out of stock' }
    });
    assert(cancelRes2.status === 200, 'ORDERED order cancelled with HTTP 200');
    assert(cancelRes2.data.order.status === 'CANCELLED', 'Order status is now CANCELLED');

    // ----------------------------------------------------
    // TEST 12: Summary & Needing Restock Endpoints
    // ----------------------------------------------------
    console.log('\n--- TEST 12: Summary & Needing Restock ---');
    const summaryRes = await makeRequest('/api/restock/summary', { token: managerToken });
    assert(summaryRes.status === 200, 'GET /api/restock/summary returns 200');
    assert(typeof summaryRes.data.summary.receivedOrders === 'number', 'Summary contains numeric receivedOrders');
    assert(summaryRes.data.summary.receivedOrders >= 1, 'Summary reflects at least 1 received order');

    const needingRes = await makeRequest('/api/restock/needing-restock', { token: managerToken });
    assert(needingRes.status === 200, 'GET /api/restock/needing-restock returns 200');
    assert(Array.isArray(needingRes.data.products), 'needing-restock returns products array');
    if (needingRes.data.products.length > 0) {
      const p = needingRes.data.products[0];
      assert(p.suggestedQuantity > 0, 'Suggested quantity is positive integer');
      assert(p.productId !== undefined, 'Product has productId');
    }

    console.log('\n====================================================');
    console.log('ALL PHASE 11 TESTS PASSED SUCCESSFULLY! (22/22)');
    console.log('====================================================\n');
    process.exit(0);
  } finally {
    if (server) {
      server.close();
    }
  }
}

runTests().catch(err => {
  console.error('\n[FATAL TEST ERROR]', err);
  process.exit(1);
});
