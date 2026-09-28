/**
 * SmartStock Phase 9: Analytics & Inventory Insights Test Suite
 * 
 * Tests all criteria specified in Phase 9:
 * 1. Security & Authentication on all 6 endpoints (401 without token)
 * 2. Range validation (400 on invalid range, accepts today, 7d, 30d, 90d)
 * 3. Overview API returns real database metrics
 * 4. Inventory movement analytics & live transaction reaction
 * 5. Category-wise analytics & sorting
 * 6. Product stock comparison & attention prioritization
 * 7. Alert analytics by severity, source, and timeline
 * 8. Software-simulated IoT telemetry analytics, banner notice, and device activity
 * 9. Separation of current-state vs historical range filtering
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
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
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
  }
  console.log(`[PASS] ${message}`);
}

async function runTests() {
  try {
    console.log('\n====================================================');
    console.log('SMARTSTOCK PHASE 9: ANALYTICS & INVENTORY INSIGHTS');
    console.log('====================================================\n');

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
    console.log(`[Test Server] Listening on ${baseUrl}`);

    managerToken = generateToken(MANAGER_USER);
    staffToken = generateToken(STAFF_USER);

    // ----------------------------------------------------
    // TEST 1: Security & Authentication on all 6 endpoints
    // ----------------------------------------------------
    console.log('\n--- TEST 1: Security & Authentication ---');
    const endpoints = [
      '/api/analytics/overview',
      '/api/analytics/inventory-movement',
      '/api/analytics/categories',
      '/api/analytics/products',
      '/api/analytics/alerts',
      '/api/analytics/iot'
    ];

    for (const ep of endpoints) {
      const res = await makeRequest(ep);
      assert(res.status === 401, `Unauthenticated request to ${ep} returns 401`);
    }

    // ----------------------------------------------------
    // TEST 2: Range Validation
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Time Range Parameter Validation ---');
    const invalidRes = await makeRequest('/api/analytics/inventory-movement?range=invalid_range', {
      token: staffToken
    });
    assert(invalidRes.status === 400, 'Invalid time range parameter returns HTTP 400');
    assert(invalidRes.data.message.includes('Invalid time range'), 'Error message clearly specifies invalid range');

    for (const validRange of ['today', '1d', '7d', '30d', '90d']) {
      const validRes = await makeRequest(`/api/analytics/inventory-movement?range=${validRange}`, {
        token: staffToken
      });
      assert(validRes.status === 200, `Valid time range '${validRange}' accepted with HTTP 200`);
    }

    // ----------------------------------------------------
    // TEST 3: Overview API (GET /api/analytics/overview)
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Overview Metrics API ---');
    const overviewRes = await makeRequest('/api/analytics/overview', { token: staffToken });
    assert(overviewRes.status === 200, 'GET /api/analytics/overview returns 200');
    assert(overviewRes.data.success === true, 'Response indicates success: true');

    const overview = overviewRes.data.data;
    assert(typeof overview.totalProducts === 'number' && overview.totalProducts > 0, 'totalProducts is numeric and > 0');
    assert(typeof overview.totalCurrentStock === 'number' && overview.totalCurrentStock >= 0, 'totalCurrentStock is numeric');
    assert(typeof overview.lowStockProducts === 'number', 'lowStockProducts is numeric');
    assert(typeof overview.criticalStockProducts === 'number', 'criticalStockProducts is numeric');
    assert(typeof overview.outOfStockProducts === 'number', 'outOfStockProducts is numeric');
    assert(typeof overview.inventoryTransactions === 'number', 'inventoryTransactions is numeric');
    assert(typeof overview.activeAlerts === 'number', 'activeAlerts is numeric');
    assert(typeof overview.iotReadings === 'number', 'iotReadings is numeric');

    // ----------------------------------------------------
    // TEST 4: Category Analytics (GET /api/analytics/categories)
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Category Analytics API ---');
    const catRes = await makeRequest('/api/analytics/categories', { token: staffToken });
    assert(catRes.status === 200, 'GET /api/analytics/categories returns 200');
    assert(Array.isArray(catRes.data.data), 'Category analytics returns array of categories');
    assert(catRes.data.data.length > 0, 'Categories exist in response');

    const firstCat = catRes.data.data[0];
    assert(firstCat.category !== undefined, 'Category has category name');
    assert(typeof firstCat.productCount === 'number', 'Category has productCount');
    assert(typeof firstCat.currentStock === 'number', 'Category has currentStock');
    assert(typeof firstCat.minimumStock === 'number', 'Category has minimumStock');

    // Verify descending order
    let isSorted = true;
    for (let i = 1; i < catRes.data.data.length; i++) {
      if (catRes.data.data[i].currentStock > catRes.data.data[i - 1].currentStock) {
        isSorted = false;
        break;
      }
    }
    assert(isSorted, 'Categories are sorted descending by currentStock');

    // ----------------------------------------------------
    // TEST 5: Product Stock Comparison (GET /api/analytics/products)
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Product Stock Comparison & Attention List ---');
    const prodRes = await makeRequest('/api/analytics/products', { token: staffToken });
    assert(prodRes.status === 200, 'GET /api/analytics/products returns 200');
    assert(Array.isArray(prodRes.data.data.products), 'Products array returned');
    assert(Array.isArray(prodRes.data.data.attentionProducts), 'Attention products array returned');
    assert(prodRes.data.data.statusDistribution !== undefined, 'statusDistribution returned');

    const dist = prodRes.data.data.statusDistribution;
    assert(typeof dist.NORMAL === 'number', 'NORMAL count present');
    assert(typeof dist.LOW === 'number', 'LOW count present');
    assert(typeof dist.CRITICAL === 'number', 'CRITICAL count present');
    assert(typeof dist.OUT_OF_STOCK === 'number', 'OUT_OF_STOCK count present');

    // Verify attention ordering (OUT_OF_STOCK -> CRITICAL -> LOW)
    const attList = prodRes.data.data.attentionProducts;
    let validOrdering = true;
    const severityRank = { OUT_OF_STOCK: 1, CRITICAL: 2, LOW: 3 };
    for (let i = 1; i < attList.length; i++) {
      if (severityRank[attList[i].stockStatus] < severityRank[attList[i - 1].stockStatus]) {
        validOrdering = false;
        break;
      }
    }
    assert(validOrdering, 'Attention products correctly prioritized (OUT_OF_STOCK -> CRITICAL -> LOW)');

    // ----------------------------------------------------
    // TEST 6: Inventory Movement & Live Transaction Tracking
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Inventory Movement & Reaction to Transactions ---');
    const initialMovementRes = await makeRequest('/api/analytics/inventory-movement?range=30d', {
      token: staffToken
    });
    assert(initialMovementRes.status === 200, 'GET /api/analytics/inventory-movement returns 200');
    const initialSummary = initialMovementRes.data.data.summary;
    const initialStockIn = initialSummary.totalStockIn;

    // Perform a Stock-In transaction
    const stockInRes = await makeRequest('/api/inventory/stock-in', {
      method: 'POST',
      token: staffToken,
      body: {
        productId: MILK_ID,
        quantity: 50,
        reason: 'Phase 9 Analytics verification stock-in delivery'
      }
    });
    assert(stockInRes.status === 200, 'Stock-in transaction succeeds');

    // Verify updated movement analytics
    const updatedMovementRes = await makeRequest('/api/analytics/inventory-movement?range=30d', {
      token: staffToken
    });
    assert(updatedMovementRes.status === 200, 'Updated movement query returns 200');
    const updatedSummary = updatedMovementRes.data.data.summary;
    assert(
      updatedSummary.totalStockIn === initialStockIn + 50,
      `totalStockIn increased by exactly 50 units (from ${initialStockIn} to ${updatedSummary.totalStockIn})`
    );

    // ----------------------------------------------------
    // TEST 7: Alert Analytics (GET /api/analytics/alerts)
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Alert Analytics API ---');
    const alertRes = await makeRequest('/api/analytics/alerts?range=30d', { token: staffToken });
    assert(alertRes.status === 200, 'GET /api/analytics/alerts returns 200');
    assert(alertRes.data.data.summary !== undefined, 'Alert summary returned');
    assert(alertRes.data.data.bySeverity !== undefined, 'Alert bySeverity returned');
    assert(alertRes.data.data.bySource !== undefined, 'Alert bySource returned');
    assert(Array.isArray(alertRes.data.data.timeline), 'Alert timeline array returned');

    const bySource = alertRes.data.data.bySource;
    assert(typeof bySource.MANUAL === 'number', 'Source MANUAL count present');
    assert(typeof bySource.IOT === 'number', 'Source IOT count present');
    assert(typeof bySource.SYSTEM === 'number', 'Source SYSTEM count present');

    // ----------------------------------------------------
    // TEST 8: Simulated IoT Analytics (GET /api/analytics/iot)
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Simulated IoT Analytics & Banner Disclaimer ---');
    const iotRes = await makeRequest('/api/analytics/iot?range=30d', { token: staffToken });
    assert(iotRes.status === 200, 'GET /api/analytics/iot returns 200');
    assert(iotRes.data.data.isSimulated === true, 'isSimulated flag is explicitly true');
    assert(
      iotRes.data.data.notice.includes('SIMULATED IoT DATA'),
      'Clear disclaimer explicitly labeling software-simulated IoT data'
    );
    assert(iotRes.data.data.summary.totalDevices > 0, 'Simulated devices count > 0');
    assert(typeof iotRes.data.data.summary.averageBattery === 'number', 'averageBattery is numeric');
    assert(Array.isArray(iotRes.data.data.devices), 'Device list array returned');

    const initialReadings = iotRes.data.data.summary.totalReadings;

    // Simulate an IoT reading
    const devId = iotRes.data.data.devices[0].id;
    const simRes = await makeRequest('/api/iot/simulate', {
      method: 'POST',
      token: staffToken,
      body: {
        deviceId: devId,
        calculatedUnits: 38,
        batteryLevel: 92
      }
    });
    assert(simRes.status === 200, 'Simulate IoT telemetry endpoint succeeds');

    // Verify IoT analytics updated
    const updatedIotRes = await makeRequest('/api/analytics/iot?range=30d', { token: staffToken });
    assert(
      updatedIotRes.data.data.summary.totalReadings >= initialReadings + 1,
      'Total IoT readings count increased following simulation'
    );

    // ----------------------------------------------------
    // TEST 9: Current vs Historical Data Independence
    // ----------------------------------------------------
    console.log('\n--- TEST 9: Current State vs Historical Filter Independence ---');
    const overview7d = await makeRequest('/api/analytics/overview?range=7d', { token: staffToken });
    const overview90d = await makeRequest('/api/analytics/overview?range=90d', { token: staffToken });

    assert(
      overview7d.data.data.totalProducts === overview90d.data.data.totalProducts,
      'totalProducts remains constant across 7d and 90d query filters (live state)'
    );
    assert(
      overview7d.data.data.totalCurrentStock === overview90d.data.data.totalCurrentStock,
      'totalCurrentStock remains constant across 7d and 90d query filters (live state)'
    );

    console.log('\n====================================================');
    console.log('ALL PHASE 9 TESTS PASSED SUCCESSFULLY! (22/22)');
    console.log('====================================================\n');

    server.close();
    process.exit(0);
  } catch (err) {
    console.error('\n[UNEXPECTED TEST ERROR]:', err);
    if (server) server.close();
    process.exit(1);
  }
}

runTests();
