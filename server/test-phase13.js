/**
 * SmartStock Phase 13: Product Details & Advanced Inventory Views Test Suite
 * 
 * Verifies all 18 required criteria specified in Section 45:
 * 1. Get product details
 * 2. Product not found
 * 3. Product inventory summary
 * 4. Inventory history
 * 5. History filtering
 * 6. Stock movement calculation
 * 7. Forecast integration
 * 8. No forecast data
 * 9. IoT device information
 * 10. IoT telemetry
 * 11. Product alerts
 * 12. Product restock orders
 * 13. Product activity
 * 14. Stock-in from product page
 * 15. Stock-out from product page
 * 16. Negative stock prevention
 * 17. MANAGER permissions
 * 18. STAFF permissions
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

const MILK_ID = 'b0000000-0000-0000-0000-000000000001'; // Milk (has IoT scale, supplier 1)
const BREAD_ID = 'b0000000-0000-0000-0000-000000000002'; // Bread
const COKE_ID = 'b0000000-0000-0000-0000-000000000005'; // Coca Cola (Out of stock, has restock order RS-0001)
const NON_EXISTENT_ID = '00000000-0000-0000-0000-000000000000';

async function makeRequest(path, options = {}) {
  const url = new URL(path, baseUrl);
  const headers = options.headers || {};
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  return new Promise((resolve, reject) => {
    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(body);
          } catch {
            parsed = body;
          }
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        });
      }
    );

    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  } else {
    console.log(`[PASS] ${message}`);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('SMARTSTOCK PHASE 13: PRODUCT DETAILS & ADVANCED VIEWS');
  console.log('====================================================\n');

  // Start ephemeral server
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;
  console.log(`[Test Server] Listening on ${baseUrl}\n`);

  managerToken = generateToken(MANAGER_USER);
  staffToken = generateToken(STAFF_USER);

  try {
    // ----------------------------------------------------
    // TEST 1: Get product details
    // ----------------------------------------------------
    console.log('--- TEST 1: Get Product Details ---');
    const resDetails = await makeRequest(`/api/products/${MILK_ID}/details`, {
      token: managerToken
    });
    assert(resDetails.status === 200, 'GET /api/products/:id/details returns HTTP 200');
    assert(resDetails.data.success === true, 'Response indicates success = true');
    assert(Boolean(resDetails.data.data.product), 'Returns product object');
    assert(resDetails.data.data.product.name === 'Milk', 'Product name matches Milk');
    assert(Boolean(resDetails.data.data.inventory), 'Returns inventory object');
    assert(Boolean(resDetails.data.data.stockMovement), 'Returns stockMovement array');
    assert(Boolean(resDetails.data.data.activityTimeline), 'Returns activityTimeline array');

    // ----------------------------------------------------
    // TEST 2: Product not found
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Product Not Found ---');
    const resNotFound = await makeRequest(`/api/products/${NON_EXISTENT_ID}/details`, {
      token: managerToken
    });
    assert(resNotFound.status === 404, 'Non-existent product details returns HTTP 404');
    assert(resNotFound.data.success === false, 'Response indicates success = false');
    assert(resNotFound.data.message.toLowerCase().includes('not found'), 'Message indicates "Product not found"');

    // ----------------------------------------------------
    // TEST 3: Product inventory summary
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Product Inventory Summary ---');
    const inventory = resDetails.data.data.inventory;
    assert(typeof inventory.currentStock === 'number', 'Inventory summary has numeric currentStock');
    assert(typeof inventory.minimumStock === 'number', 'Inventory summary has numeric minimumStock');
    assert(Boolean(inventory.unit), 'Inventory summary has unit');
    assert(Boolean(inventory.stockStatus), 'Inventory summary has stockStatus');
    assert(['NORMAL', 'LOW', 'CRITICAL', 'OUT_OF_STOCK'].includes(inventory.stockStatus), 'Stock status is valid enum');

    // ----------------------------------------------------
    // TEST 4: Inventory history
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Inventory History ---');
    const resHistory = await makeRequest(`/api/inventory/${MILK_ID}/history`, {
      token: managerToken
    });
    assert(resHistory.status === 200, 'GET /api/inventory/:id/history returns HTTP 200');
    assert(resHistory.data.success === true, 'History response indicates success = true');
    assert(Array.isArray(resHistory.data.data), 'History data is returned as an array');
    assert(resHistory.data.data.length > 0, 'History contains at least 1 record for Milk');
    const firstHist = resHistory.data.data[0];
    assert(Boolean(firstHist.changeType), 'History record contains changeType');
    assert(Boolean(firstHist.source), 'History record contains source');
    assert(firstHist.previousStock !== undefined, 'History record contains previousStock');
    assert(firstHist.newStock !== undefined, 'History record contains newStock');

    // ----------------------------------------------------
    // TEST 5: History filtering
    // ----------------------------------------------------
    console.log('\n--- TEST 5: History Filtering ---');
    const resFilteredType = await makeRequest(`/api/inventory/${MILK_ID}/history?changeType=STOCK_OUT`, {
      token: managerToken
    });
    assert(resFilteredType.status === 200, 'Filtered by changeType returns HTTP 200');
    assert(
      resFilteredType.data.data.every((r) => r.changeType === 'STOCK_OUT'),
      'All returned records have changeType === STOCK_OUT'
    );

    const resFilteredSource = await makeRequest(`/api/inventory/${MILK_ID}/history?source=MANUAL`, {
      token: managerToken
    });
    assert(resFilteredSource.status === 200, 'Filtered by source returns HTTP 200');
    assert(
      resFilteredSource.data.data.every((r) => r.source === 'MANUAL'),
      'All returned records have source === MANUAL'
    );

    const resPaginated = await makeRequest(`/api/inventory/${MILK_ID}/history?page=1&limit=2`, {
      token: managerToken
    });
    assert(resPaginated.status === 200, 'Paginated history returns HTTP 200');
    assert(resPaginated.data.page === 1, 'Pagination response has page === 1');
    assert(resPaginated.data.limit === 2, 'Pagination response has limit === 2');
    assert(resPaginated.data.data.length <= 2, 'Paginated items capped at limit');

    // ----------------------------------------------------
    // TEST 6: Stock movement calculation
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Stock Movement Calculation ---');
    const movement = resDetails.data.data.stockMovement;
    assert(Array.isArray(movement), 'stockMovement is an array');
    assert(movement.length > 0, 'stockMovement has data points derived from history');
    assert(typeof movement[0].stock === 'number', 'Movement point has numeric stock');
    assert(Boolean(movement[0].date), 'Movement point has date/timestamp');

    // ----------------------------------------------------
    // TEST 7: Forecast integration
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Forecast Integration ---');
    const forecast = resDetails.data.data.forecast;
    assert(Boolean(forecast), 'Forecast object is present in product details');
    assert(typeof forecast.averageDailyConsumption === 'number', 'Forecast has numeric averageDailyConsumption');
    assert(forecast.forecastPeriod === 30, 'Forecast period is 30 days');
    assert(Boolean(forecast.periods), 'Forecast includes period breakdown (7, 30, 90)');
    assert(forecast.periods['7'] !== undefined, '7-day consumption period present');
    assert(forecast.periods['30'] !== undefined, '30-day consumption period present');
    assert(forecast.periods['90'] !== undefined, '90-day consumption period present');

    // ----------------------------------------------------
    // TEST 8: No forecast data / Out of stock edge case
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Forecast Edge Cases ---');
    const resCokeDetails = await makeRequest(`/api/products/${COKE_ID}/details`, {
      token: managerToken
    });
    assert(resCokeDetails.status === 200, 'Coke details returns HTTP 200');
    const cokeForecast = resCokeDetails.data.data.forecast;
    assert(Boolean(cokeForecast), 'Coke forecast object is returned');
    assert(cokeForecast.status === 'DEPLETED' || resCokeDetails.data.data.product.currentStock === 0, 'Handles 0 stock depleted condition');
    assert(cokeForecast.estimatedDaysRemaining === 0, 'Days remaining is 0 for depleted stock');

    // ----------------------------------------------------
    // TEST 9: IoT device information
    // ----------------------------------------------------
    console.log('\n--- TEST 9: IoT Device Information ---');
    const iotDevice = resDetails.data.data.iotDevice;
    assert(Boolean(iotDevice), 'Milk has assigned simulated IoT device');
    assert(Boolean(iotDevice.deviceName), 'IoT device has deviceName');
    assert(Boolean(iotDevice.deviceCode), 'IoT device has deviceCode');
    assert(Boolean(iotDevice.deviceType), 'IoT device has deviceType');
    assert(iotDevice.simulationStatus === 'SIMULATED IoT DEVICE', 'Device clearly specifies SIMULATED IoT DEVICE');
    assert(['ONLINE', 'OFFLINE'].includes(iotDevice.status), 'Device status is ONLINE or OFFLINE');
    assert(typeof iotDevice.battery === 'number', 'Device has numeric battery level');

    // ----------------------------------------------------
    // TEST 10: IoT telemetry
    // ----------------------------------------------------
    console.log('\n--- TEST 10: IoT Telemetry ---');
    const telemetry = resDetails.data.data.telemetry;
    assert(Array.isArray(telemetry), 'Telemetry is returned as an array');
    assert(telemetry.length <= 10, 'Telemetry returns at most 10 recent readings');
    if (telemetry.length > 0) {
      assert(Boolean(telemetry[0].timestamp), 'Reading has timestamp');
      assert(telemetry[0].rawReading !== undefined, 'Reading has rawReading');
      assert(telemetry[0].calculatedQuantity !== undefined, 'Reading has calculatedQuantity');
      assert(telemetry[0].readingType === 'SIMULATED', 'Reading type is SIMULATED');
    }

    // ----------------------------------------------------
    // TEST 11: Product alerts
    // ----------------------------------------------------
    console.log('\n--- TEST 11: Product Alerts ---');
    const cokeAlerts = resCokeDetails.data.data.alerts;
    assert(Array.isArray(cokeAlerts), 'Alerts is returned as an array');
    assert(cokeAlerts.length > 0, 'Coke has at least 1 active/resolved stock alert');
    const alertItem = cokeAlerts[0];
    assert(Boolean(alertItem.alertType), 'Alert has alertType');
    assert(Boolean(alertItem.severity), 'Alert has severity');
    assert(['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'].includes(alertItem.status), 'Alert status is valid enum');
    assert(Boolean(alertItem.createdAt), 'Alert has createdAt timestamp');

    // ----------------------------------------------------
    // TEST 12: Product restock orders
    // ----------------------------------------------------
    console.log('\n--- TEST 12: Product Restock Orders ---');
    const cokeRestocks = resCokeDetails.data.data.restockOrders;
    assert(Array.isArray(cokeRestocks), 'Restock orders is returned as an array');
    assert(cokeRestocks.length > 0, 'Coke has at least 1 associated restock order (RS-0001)');
    const restockItem = cokeRestocks[0];
    assert(Boolean(restockItem.orderNumber), 'Restock order has orderNumber');
    assert(Boolean(restockItem.supplier), 'Restock order has supplier name');
    assert(typeof restockItem.quantity === 'number', 'Restock order has item quantity');
    assert(Boolean(restockItem.status), 'Restock order has status');

    // ----------------------------------------------------
    // TEST 13: Product activity timeline
    // ----------------------------------------------------
    console.log('\n--- TEST 13: Product Activity Timeline ---');
    const activity = resDetails.data.data.activityTimeline;
    assert(Array.isArray(activity), 'activityTimeline is an array');
    assert(activity.length <= 10, 'Activity timeline initially limited to top 10 events');
    if (activity.length >= 2) {
      const isNewestFirst = new Date(activity[0].timestamp).getTime() >= new Date(activity[1].timestamp).getTime();
      assert(isNewestFirst, 'Activity timeline is sorted newest first');
    }

    // ----------------------------------------------------
    // TEST 14: Stock-in from product page
    // ----------------------------------------------------
    console.log('\n--- TEST 14: Stock-In from Product Page ---');
    const beforeStockIn = await makeRequest(`/api/products/${BREAD_ID}/details`, { token: managerToken });
    const currentBreadStock = beforeStockIn.data.data.product.currentStock;

    const resStockIn = await makeRequest('/api/inventory/stock-in', {
      method: 'POST',
      token: staffToken,
      body: {
        productId: BREAD_ID,
        quantity: 10,
        reason: 'Restock delivered from bakery storage'
      }
    });
    assert(resStockIn.status === 200, 'POST /api/inventory/stock-in returns HTTP 200');
    assert(resStockIn.data.success === true, 'Stock in indicates success = true');
    assert(resStockIn.data.data.inventory.currentStock === currentBreadStock + 10, 'Bread stock increased by 10');

    // Verify product details immediately reflects the update
    const afterStockIn = await makeRequest(`/api/products/${BREAD_ID}/details`, { token: managerToken });
    assert(afterStockIn.data.data.product.currentStock === currentBreadStock + 10, 'Product details shows updated stock level');
    assert(afterStockIn.data.data.inventory.currentStock === currentBreadStock + 10, 'Product details inventory summary matches');

    // ----------------------------------------------------
    // TEST 15: Stock-out from product page
    // ----------------------------------------------------
    console.log('\n--- TEST 15: Stock-Out from Product Page ---');
    const resStockOut = await makeRequest('/api/inventory/stock-out', {
      method: 'POST',
      token: staffToken,
      body: {
        productId: BREAD_ID,
        quantity: 5,
        reason: 'Counter sales checkout bulk'
      }
    });
    assert(resStockOut.status === 200, 'POST /api/inventory/stock-out returns HTTP 200');
    assert(resStockOut.data.success === true, 'Stock out indicates success = true');
    assert(resStockOut.data.data.inventory.currentStock === currentBreadStock + 5, 'Bread stock reduced by 5');

    // ----------------------------------------------------
    // TEST 16: Negative stock prevention
    // ----------------------------------------------------
    console.log('\n--- TEST 16: Negative Stock Prevention ---');
    const currentStockLevel = resStockOut.data.data.inventory.currentStock;
    const resNegative = await makeRequest('/api/inventory/stock-out', {
      method: 'POST',
      token: staffToken,
      body: {
        productId: BREAD_ID,
        quantity: currentStockLevel + 1000,
        reason: 'Impossible excess deduction'
      }
    });
    assert(resNegative.status === 400, 'Excess stock-out rejected with HTTP 400');
    assert(resNegative.data.success === false, 'Response indicates success = false');

    // Zero quantity prevention
    const resZero = await makeRequest('/api/inventory/stock-in', {
      method: 'POST',
      token: staffToken,
      body: {
        productId: BREAD_ID,
        quantity: 0,
        reason: 'Zero quantity test'
      }
    });
    assert(resZero.status === 400, 'Zero quantity rejected with HTTP 400');

    // ----------------------------------------------------
    // TEST 17: MANAGER permissions
    // ----------------------------------------------------
    console.log('\n--- TEST 17: MANAGER Permissions ---');
    // MANAGER can access product details
    const mgrDetails = await makeRequest(`/api/products/${MILK_ID}/details`, { token: managerToken });
    assert(mgrDetails.status === 200, 'MANAGER can view product details (200)');

    // MANAGER can update product
    const mgrUpdate = await makeRequest(`/api/products/${MILK_ID}`, {
      method: 'PUT',
      token: managerToken,
      body: {
        name: 'Milk'
      }
    });
    assert(mgrUpdate.status === 200, 'MANAGER can edit product (200)');

    // ----------------------------------------------------
    // TEST 18: STAFF permissions
    // ----------------------------------------------------
    console.log('\n--- TEST 18: STAFF Permissions ---');
    // STAFF can access product details
    const staffDetails = await makeRequest(`/api/products/${MILK_ID}/details`, { token: staffToken });
    assert(staffDetails.status === 200, 'STAFF can view product details (200)');

    // STAFF can stock-in
    const staffStockIn = await makeRequest('/api/inventory/stock-in', {
      method: 'POST',
      token: staffToken,
      body: {
        productId: MILK_ID,
        quantity: 1,
        reason: 'Staff stock in test'
      }
    });
    assert(staffStockIn.status === 200, 'STAFF can perform stock-in (200)');

    // STAFF cannot update product (MANAGER only)
    const staffUpdate = await makeRequest(`/api/products/${MILK_ID}`, {
      method: 'PUT',
      token: staffToken,
      body: {
        name: 'Staff Unauthorized Edit'
      }
    });
    assert(staffUpdate.status === 403, 'STAFF cannot edit product (403 Forbidden)');

    // STAFF cannot delete product (MANAGER only)
    const staffDelete = await makeRequest(`/api/products/${MILK_ID}`, {
      method: 'DELETE',
      token: staffToken
    });
    assert(staffDelete.status === 403, 'STAFF cannot delete/deactivate product (403 Forbidden)');

    console.log('\n====================================================');
    console.log('ALL PHASE 13 TESTS PASSED SUCCESSFULLY! (18/18)');
    console.log('====================================================\n');
    process.exit(0);
  } finally {
    if (server) {
      server.close();
    }
  }
}

runTests().catch((err) => {
  console.error('[UNHANDLED TEST ERROR]:', err);
  if (server) server.close();
  process.exit(1);
});
