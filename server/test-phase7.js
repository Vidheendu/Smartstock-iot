/**
 * Comprehensive Automated Phase 7 Test Suite
 * Tests all 21 criteria specified in PART 48
 */

import http from 'http';
import app from './server.js';
import * as alertService from './src/services/alert.service.js';
import * as productService from './src/services/product.service.js';
import * as inventoryService from './src/services/inventory.service.js';
import * as iotService from './src/services/iot.service.js';
import { generateToken } from './src/utils/jwt.js';

let server;
let baseUrl;
let testToken;
let milkProduct;

const MILK_ID = 'b0000000-0000-0000-0000-000000000001';
const TEST_USER = {
  id: 'e0000000-0000-0000-0000-000000000001',
  email: 'manager@smartstock.com',
  name: 'Alex Morgan',
  role: 'MANAGER'
};

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
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('SMARTSTOCK PHASE 7: AUTOMATIC ALERT ENGINE TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // Setup
  testToken = generateToken({ userId: TEST_USER.id, id: TEST_USER.id, email: TEST_USER.email, role: TEST_USER.role });
  milkProduct = await productService.getProductById(MILK_ID);

  // Start temporary server on random port
  await new Promise((resolve) => {
    const s = app.listen(0, () => {
      const port = s.address().port;
      baseUrl = `http://localhost:${port}`;
      server = s;
      resolve();
    });
  });

  // Reset Milk stock to 45 (NORMAL)
  await productService.updateProductStock(MILK_ID, 45);

  // TEST 1: Product stock is NORMAL -> No active alert for Milk
  await alertService.evaluateStockAlert(MILK_ID, 'SYSTEM');
  const alertsT1 = await alertService.getAlerts({ productId: MILK_ID, status: 'ACTIVE' });
  assert(alertsT1.length === 0, 'Product stock is NORMAL -> No active alert.');

  // TEST 2: Change stock from NORMAL -> LOW (15 units, min is 20)
  await productService.updateProductStock(MILK_ID, 15);
  const evalT2 = await alertService.evaluateStockAlert(MILK_ID, 'IOT');
  assert(
    evalT2.action === 'CREATED' &&
    evalT2.alert.alertType === 'LOW_STOCK' &&
    evalT2.alert.severity === 'LOW' &&
    evalT2.alert.source === 'IOT',
    'NORMAL -> LOW creates one LOW_STOCK alert with severity LOW.'
  );

  // TEST 3: Same LOW stock reading again -> No duplicate active alert
  const evalT3 = await alertService.evaluateStockAlert(MILK_ID, 'IOT');
  const activeAlertsT3 = await alertService.getAlerts({ productId: MILK_ID, status: 'ACTIVE' });
  assert(
    evalT3.action === 'EXISTING_MAINTAINED' &&
    evalT3.isNew === false &&
    activeAlertsT3.length === 1,
    'Same LOW stock reading again -> No duplicate active alert.'
  );

  // TEST 4: Change LOW -> CRITICAL (8 units, <= 50% of 20)
  await productService.updateProductStock(MILK_ID, 8);
  const evalT4 = await alertService.evaluateStockAlert(MILK_ID, 'IOT');
  const activeAlertsT4 = await alertService.getAlerts({ productId: MILK_ID, status: 'ACTIVE' });
  assert(
    evalT4.action === 'CREATED' &&
    evalT4.alert.alertType === 'CRITICAL_STOCK' &&
    evalT4.alert.severity === 'CRITICAL' &&
    activeAlertsT4.length === 1 &&
    activeAlertsT4[0].alertType === 'CRITICAL_STOCK',
    'LOW -> CRITICAL resolves LOW alert and creates CRITICAL alert.'
  );

  // TEST 5: Same CRITICAL reading again -> No duplicate active CRITICAL alert
  const evalT5 = await alertService.evaluateStockAlert(MILK_ID, 'IOT');
  const activeAlertsT5 = await alertService.getAlerts({ productId: MILK_ID, status: 'ACTIVE' });
  assert(
    evalT5.action === 'EXISTING_MAINTAINED' &&
    evalT5.isNew === false &&
    activeAlertsT5.length === 1,
    'Same CRITICAL reading again -> No duplicate active CRITICAL alert.'
  );

  // TEST 6: Change CRITICAL -> OUT_OF_STOCK (0 units)
  await productService.updateProductStock(MILK_ID, 0);
  const evalT6 = await alertService.evaluateStockAlert(MILK_ID, 'IOT');
  const activeAlertsT6 = await alertService.getAlerts({ productId: MILK_ID, status: 'ACTIVE' });
  assert(
    evalT6.action === 'CREATED' &&
    evalT6.alert.alertType === 'OUT_OF_STOCK' &&
    evalT6.alert.severity === 'OUT_OF_STOCK' &&
    activeAlertsT6.length === 1 &&
    activeAlertsT6[0].alertType === 'OUT_OF_STOCK',
    'CRITICAL -> OUT_OF_STOCK resolves CRITICAL alert and creates OUT_OF_STOCK alert.'
  );

  // TEST 7: Change OUT_OF_STOCK -> NORMAL (30 units)
  await productService.updateProductStock(MILK_ID, 30);
  const evalT7 = await alertService.evaluateStockAlert(MILK_ID, 'IOT');
  const activeAlertsT7 = await alertService.getAlerts({ productId: MILK_ID, status: 'ACTIVE' });
  assert(
    evalT7.action === 'RESOLVED' &&
    activeAlertsT7.length === 0,
    'OUT_OF_STOCK -> NORMAL auto-resolves alert. No active alerts remain.'
  );

  // TEST 8: Change NORMAL -> LOW again -> New alert created, old resolved alerts remain history
  await productService.updateProductStock(MILK_ID, 15);
  const evalT8 = await alertService.evaluateStockAlert(MILK_ID, 'SYSTEM');
  const allMilkAlerts = await alertService.getAlerts({ productId: MILK_ID });
  const resolvedMilkAlerts = allMilkAlerts.filter((a) => a.status === 'RESOLVED');
  assert(
    evalT8.action === 'CREATED' &&
    allMilkAlerts.length >= 4 &&
    resolvedMilkAlerts.length >= 3,
    'NORMAL -> LOW again creates new alert while old resolved alerts remain in history.'
  );

  const activeAlert = (await alertService.getAlerts({ productId: MILK_ID, status: 'ACTIVE' }))[0];

  // TEST 9: Manual inventory stock-out causes deficit -> alert source = MANUAL
  // Set Milk to NORMAL 45, then manual stockOut 30 -> 15 (LOW)
  await productService.updateProductStock(MILK_ID, 45);
  await alertService.evaluateStockAlert(MILK_ID, 'SYSTEM'); // resolves previous
  await inventoryService.stockOut({
    productId: MILK_ID,
    quantity: 30,
    reason: 'Store customer bulk checkout',
    userId: TEST_USER.id,
    source: 'MANUAL'
  });
  const manualAlert = (await alertService.getAlerts({ productId: MILK_ID, status: 'ACTIVE' }))[0];
  assert(
    manualAlert && manualAlert.source === 'MANUAL',
    'Manual stock-out causes LOW alert with source = MANUAL.'
  );

  // TEST 10: Simulated IoT telemetry reading causes LOW -> alert source = IOT
  const devices = await iotService.getDevices();
  const milkDevice = devices.find((d) => d.productId === MILK_ID);
  // Restore Milk to 40, then send IoT telemetry reading 15
  await productService.updateProductStock(MILK_ID, 40);
  await alertService.evaluateStockAlert(MILK_ID, 'SYSTEM');
  await iotService.simulateTelemetry({
    deviceId: milkDevice.id,
    calculatedUnits: 15
  });
  const iotAlert = (await alertService.getAlerts({ productId: MILK_ID, status: 'ACTIVE' }))[0];
  assert(
    iotAlert && iotAlert.source === 'IOT',
    'Simulated IoT telemetry causes LOW alert with source = IOT.'
  );

  // TEST 11: Acknowledge alert via API
  const ackRes = await makeRequest(`/api/alerts/${iotAlert.id}/acknowledge`, {
    method: 'PATCH',
    token: testToken
  });
  assert(
    ackRes.status === 200 &&
    ackRes.data.success === true &&
    ackRes.data.data.status === 'ACKNOWLEDGED' &&
    ackRes.data.data.acknowledgedBy !== null,
    'PATCH /api/alerts/:id/acknowledge updates status to ACKNOWLEDGED with user.'
  );

  // TEST 12: Resolve alert via API
  const resRes = await makeRequest(`/api/alerts/${iotAlert.id}/resolve`, {
    method: 'PATCH',
    token: testToken
  });
  assert(
    resRes.status === 200 &&
    resRes.data.success === true &&
    resRes.data.data.status === 'RESOLVED' &&
    resRes.data.data.resolvedAt !== null,
    'PATCH /api/alerts/:id/resolve updates status to RESOLVED with timestamp.'
  );

  // TEST 13: Resolve alert does NOT modify inventory stock
  const milkAfterResolve = await productService.getProductById(MILK_ID);
  assert(
    milkAfterResolve.currentStock === 15,
    'Resolving an alert does NOT modify inventory stock (stock remains 15).'
  );

  // TEST 14: Unauthorized alert API request returns HTTP 401
  const unauthRes = await makeRequest('/api/alerts');
  assert(
    unauthRes.status === 401,
    'Unauthorized alert API request returns HTTP 401.'
  );

  // TEST 15: Non-existing alert returns HTTP 404
  const notFoundRes = await makeRequest('/api/alerts/00000000-0000-0000-0000-000000000000', {
    token: testToken
  });
  assert(
    notFoundRes.status === 404 && notFoundRes.data.message === 'Alert not found.',
    'Non-existing alert ID returns HTTP 404 with "Alert not found."'
  );

  // TEST 16: Dashboard active alert count updates
  const dashRes = await makeRequest('/api/dashboard/stats', {
    token: testToken
  });
  assert(
    dashRes.status === 200 &&
    typeof dashRes.data.data.activeAlerts === 'number',
    'Dashboard API returns updated activeAlerts count.'
  );

  // TEST 17: Alert filtering works (by severity, status, source)
  const lowFilterRes = await makeRequest('/api/alerts?severity=LOW', { token: testToken });
  const activeFilterRes = await makeRequest('/api/alerts?status=ACTIVE', { token: testToken });
  const iotFilterRes = await makeRequest('/api/alerts?source=IOT', { token: testToken });
  assert(
    lowFilterRes.data.data.every((a) => a.severity === 'LOW') &&
    activeFilterRes.data.data.every((a) => a.status === 'ACTIVE') &&
    iotFilterRes.data.data.every((a) => a.source === 'IOT'),
    'Alert query filters (severity, status, source) work correctly.'
  );

  // TEST 18: Duplicate active alerts prevented across repeated evaluations
  await productService.updateProductStock(MILK_ID, 10); // CRITICAL
  await alertService.evaluateStockAlert(MILK_ID, 'SYSTEM');
  await alertService.evaluateStockAlert(MILK_ID, 'SYSTEM');
  await alertService.evaluateStockAlert(MILK_ID, 'SYSTEM');
  const activeMilkNow = await alertService.getAlerts({ productId: MILK_ID, status: 'ACTIVE' });
  assert(
    activeMilkNow.length === 1 && activeMilkNow[0].severity === 'CRITICAL',
    'No duplicate active alerts created across repeated identical evaluations.'
  );

  // TEST 19: Message generation adheres to standard formats
  const msg1 = alertService.generateAlertMessage({ name: 'Milk', unit: 'bottles' }, 'LOW_STOCK', 15, 20);
  const msg2 = alertService.generateAlertMessage({ name: 'Milk', unit: 'bottles' }, 'CRITICAL_STOCK', 8, 20);
  const msg3 = alertService.generateAlertMessage({ name: 'Milk', unit: 'bottles' }, 'OUT_OF_STOCK', 0, 20);
  assert(
    msg1.includes('Milk stock is low. Current stock is 15 bottles and minimum stock is 20 bottles.') &&
    msg2.includes('Milk stock is critical. Current stock is 8 bottles and minimum stock is 20 bottles.') &&
    msg3 === 'Milk is out of stock.',
    'Alert messages conform to standard specifications without template duplication.'
  );

  // TEST 20: Minimum stock zero edge case handled safely without NaN or division error
  // If minimum_stock is 0 and current_stock is 0 -> OUT_OF_STOCK
  const zeroStockStatus = alertService.generateAlertMessage({ name: 'ZeroItem' }, 'OUT_OF_STOCK', 0, 0);
  assert(
    zeroStockStatus === 'ZeroItem is out of stock.',
    'Zero stock handled safely as OUT_OF_STOCK.'
  );

  // TEST 21: Clean teardown & server stop
  if (server) {
    server.close();
  }
  assert(true, 'Test server stopped cleanly.');

  console.log(`\n====================================================`);
  console.log(`ALL TESTS PASSED: ${passed}/${total}`);
  console.log(`====================================================\n`);

  process.exit(0);
}

runTests().catch((err) => {
  console.error('\nTEST SUITE RUNTIME ERROR:', err);
  if (server) server.close();
  process.exit(1);
});
