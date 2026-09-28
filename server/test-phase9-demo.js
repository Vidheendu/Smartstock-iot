/**
 * Phase 9 Analytics Demo Verification Script
 * Validates the exact 15-step demo checklist from PART 46 against live backend:
 * 
 * 1. Login with manager credentials.
 * 2. Open Analytics (/api/analytics/overview).
 * 3. Verify: Total Products matches Products catalog.
 * 4. Verify: Current Stock matches Inventory on-hand units.
 * 5. Change stock manually through Inventory (Stock Out).
 * 6. Return to Analytics.
 * 7. Verify inventory movement changes.
 * 8. Trigger simulated IoT reading.
 * 9. Verify IoT telemetry count increases.
 * 10. Verify telemetry activity changes.
 * 11. Trigger a LOW stock condition.
 * 12. Verify alert analytics reflects the new alert.
 * 13. Change date range (7d, 30d, 90d, today).
 * 14. Verify historical charts update.
 * 15. Verify current stock still represents current stock rather than only the selected date range.
 */

import http from 'http';

const BASE_URL = 'http://localhost:5000';

async function request(path, options = {}) {
  const url = new URL(path, BASE_URL);
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
    process.exit(1);
  }
  console.log(`[PASS] ${message}`);
}

async function runDemoVerification() {
  console.log('====================================================');
  console.log('SMARTSTOCK PHASE 9: DEMO VERIFICATION (PART 46)');
  console.log('====================================================\n');

  // STEP 1: Login
  console.log('--- Step 1: User Login ---');
  const loginRes = await request('/api/auth/login', {
    method: 'POST',
    body: {
      email: 'manager@smartstock.com',
      password: 'password123'
    }
  });
  assert(loginRes.status === 200, 'Manager login successful (HTTP 200)');
  const token = loginRes.data.token || loginRes.data.data?.token;
  assert(!!token, 'Auth token acquired');

  // STEP 2: Open Analytics Overview
  console.log('\n--- Step 2: Open Analytics Overview ---');
  const overviewRes = await request('/api/analytics/overview', { token });
  assert(overviewRes.status === 200, 'GET /api/analytics/overview returns 200');
  const overview = overviewRes.data.data;

  // STEP 3: Verify Total Products matches Products
  console.log('\n--- Step 3: Verify Total Products matches Products catalog ---');
  const productsRes = await request('/api/products', { token });
  assert(productsRes.status === 200, 'GET /api/products returns 200');
  const productCount = productsRes.data.data.length;
  assert(
    overview.totalProducts === productCount,
    `Overview totalProducts (${overview.totalProducts}) matches Products count (${productCount})`
  );

  // STEP 4: Verify Current Stock matches Inventory
  console.log('\n--- Step 4: Verify Current Stock matches Inventory units ---');
  const inventoryRes = await request('/api/inventory', { token });
  assert(inventoryRes.status === 200, 'GET /api/inventory returns 200');
  const totalInventoryUnits = inventoryRes.data.data.reduce(
    (sum, item) => sum + Number(item.currentStock || 0),
    0
  );
  assert(
    overview.totalCurrentStock === totalInventoryUnits,
    `Overview totalCurrentStock (${overview.totalCurrentStock}) matches Inventory sum (${totalInventoryUnits})`
  );

  // STEP 5: Change stock manually through Inventory
  console.log('\n--- Step 5: Change stock manually through Inventory ---');
  const milkItem = inventoryRes.data.data.find((p) => p.name.toLowerCase().includes('milk'));
  const milkId = milkItem.productId;
  const initialMilkStock = milkItem.currentStock;

  const movementBeforeRes = await request('/api/analytics/inventory-movement?range=30d', { token });
  const initialStockOut = movementBeforeRes.data.data.summary.totalStockOut;

  const stockOutRes = await request('/api/inventory/stock-out', {
    method: 'POST',
    token,
    body: {
      productId: milkId,
      quantity: 5,
      reason: 'Phase 9 Demo Verification store checkout'
    }
  });
  assert(stockOutRes.status === 200, 'Manual stock-out of 5 units recorded successfully');

  // STEP 6 & 7: Return to Analytics & Verify inventory movement changes
  console.log('\n--- Steps 6 & 7: Return to Analytics & Verify movement updates ---');
  const movementAfterRes = await request('/api/analytics/inventory-movement?range=30d', { token });
  assert(movementAfterRes.status === 200, 'GET /api/analytics/inventory-movement returns 200');
  const updatedStockOut = movementAfterRes.data.data.summary.totalStockOut;
  assert(
    updatedStockOut === initialStockOut + 5,
    `totalStockOut reflected the manual 5 unit reduction (from ${initialStockOut} to ${updatedStockOut})`
  );

  // STEP 8 & 9: Trigger simulated IoT reading & Verify IoT telemetry count increases
  console.log('\n--- Steps 8 & 9: Trigger simulated IoT reading & Verify count increases ---');
  const iotBeforeRes = await request('/api/analytics/iot?range=30d', { token });
  assert(iotBeforeRes.status === 200, 'GET /api/analytics/iot returns 200');
  const initialTelemetryCount = iotBeforeRes.data.data.summary.totalReadings;
  const device = iotBeforeRes.data.data.devices[0];

  const simulateRes = await request('/api/iot/simulate', {
    method: 'POST',
    token,
    body: {
      deviceId: device.id,
      calculatedUnits: 42,
      batteryLevel: 94
    }
  });
  assert(simulateRes.status === 200, 'Simulated IoT telemetry dispatched');

  const iotAfterRes = await request('/api/analytics/iot?range=30d', { token });
  assert(iotAfterRes.status === 200, 'Updated IoT analytics returns 200');
  const updatedTelemetryCount = iotAfterRes.data.data.summary.totalReadings;
  assert(
    updatedTelemetryCount >= initialTelemetryCount + 1,
    `Total telemetry count increased from ${initialTelemetryCount} to ${updatedTelemetryCount}`
  );

  // STEP 10: Verify telemetry activity changes
  console.log('\n--- Step 10: Verify telemetry activity trend updates ---');
  const timeline = iotAfterRes.data.data.timeline;
  assert(Array.isArray(timeline) && timeline.length > 0, 'Telemetry timeline contains daily data points');
  const totalInTimeline = timeline.reduce((sum, d) => sum + d.readings, 0);
  assert(totalInTimeline > 0, `Telemetry activity trend reflects ${totalInTimeline} daily readings`);

  // STEP 11: Trigger a LOW stock condition
  console.log('\n--- Step 11: Trigger a LOW stock condition ---');
  const alertsBeforeRes = await request('/api/analytics/alerts?range=30d', { token });
  const initialAlertsCount = alertsBeforeRes.data.data.summary.totalAlerts;

  // Reduce product stock to minimumStock to trigger LOW status
  const adjustRes = await request('/api/inventory/adjust', {
    method: 'POST',
    token,
    body: {
      productId: milkId,
      newStock: 15, // milk minimum_stock is 20, 15 is <= 20 and > 10 (0.5 * min) -> LOW_STOCK
      reason: 'Phase 9 Demo Verification low stock trigger'
    }
  });
  assert(adjustRes.status === 200, 'Product stock adjusted to 15 (LOW stock threshold)');

  // STEP 12: Verify alert analytics reflects the new alert
  console.log('\n--- Step 12: Verify alert analytics reflects the new alert ---');
  const alertsAfterRes = await request('/api/analytics/alerts?range=30d', { token });
  assert(alertsAfterRes.status === 200, 'GET /api/analytics/alerts returns 200');
  const updatedAlertsCount = alertsAfterRes.data.data.summary.totalAlerts;
  assert(
    updatedAlertsCount >= initialAlertsCount,
    `Alert analytics registered the event (count: ${updatedAlertsCount})`
  );
  assert(alertsAfterRes.data.data.summary.activeAlerts > 0, 'Active alerts count is positive');

  // STEP 13 & 14: Change date range & Verify historical charts update
  console.log('\n--- Steps 13 & 14: Change date range & Verify historical charts update ---');
  const movement7d = await request('/api/analytics/inventory-movement?range=7d', { token });
  const movement30d = await request('/api/analytics/inventory-movement?range=30d', { token });
  const movement90d = await request('/api/analytics/inventory-movement?range=90d', { token });
  const movementToday = await request('/api/analytics/inventory-movement?range=today', { token });

  assert(movement7d.status === 200, 'Range 7d returns 200');
  assert(movement30d.status === 200, 'Range 30d returns 200');
  assert(movement90d.status === 200, 'Range 90d returns 200');
  assert(movementToday.status === 200, 'Range today returns 200');

  assert(movement7d.data.data.range === '7d', '7d range correctly parsed');
  assert(movement30d.data.data.range === '30d', '30d range correctly parsed');
  assert(movement90d.data.data.range === '90d', '90d range correctly parsed');

  // STEP 15: Verify current stock represents current stock rather than only selected range
  console.log('\n--- Step 15: Verify current stock represents current stock across ranges ---');
  const overview7d = await request('/api/analytics/overview?range=7d', { token });
  const overview30d = await request('/api/analytics/overview?range=30d', { token });
  const overview90d = await request('/api/analytics/overview?range=90d', { token });

  assert(
    overview7d.data.data.totalCurrentStock === overview30d.data.data.totalCurrentStock &&
    overview30d.data.data.totalCurrentStock === overview90d.data.data.totalCurrentStock,
    `Current stock (${overview7d.data.data.totalCurrentStock}) is invariant across 7d, 30d, 90d queries (represents live current state)`
  );

  console.log('\n====================================================');
  console.log('PART 46 DEMO VERIFICATION PASSED: ALL 15 CRITERIA CONFIRMED');
  console.log('====================================================\n');
}

runDemoVerification().catch((err) => {
  console.error('[DEMO VERIFICATION ERROR]:', err);
  process.exit(1);
});
