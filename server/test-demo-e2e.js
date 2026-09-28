/**
 * Phase 8 End-to-End Demo Verification Script
 * Validates all steps of PART 46:
 * 1. User login & token retrieval
 * 2. IoT simulated reading (Milk: 50 -> 15 L)
 * 3. Inventory update (50 -> 15)
 * 4. Stock status (LOW)
 * 5. Alert created (LOW_STOCK)
 * 6. Notification created (Low Stock Alert)
 * 7. Topbar unread count reflection
 * 8. Notification read & alert linking
 * 9. Critical condition telemetry (Milk -> 8 L)
 * 10. Critical notification creation
 * 11. Mark all as read -> Unread count = 0
 * 12. Deletion without affecting alert
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
      req.write(JSON.stringify(options.body));
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

async function runDemo() {
  console.log('====================================================');
  console.log('SMARTSTOCK PHASE 8: DEMO VERIFICATION (PART 46)');
  console.log('====================================================\n');

  // STEP 1: Login as Manager
  console.log('--- Step 1: Login as user ---');
  const loginRes = await request('/api/auth/login', {
    method: 'POST',
    body: {
      email: 'manager@smartstock.com',
      password: 'password123'
    }
  });
  assert(loginRes.status === 200 && loginRes.data.token, 'Step 1: Successfully logged in as Alex Morgan (MANAGER)');
  const token = loginRes.data.token;
  const user = loginRes.data.user;
  console.log(`Logged in as: ${user.name} (${user.email}, ${user.role})`);

  // Initial setup: Set Milk to 50 L (NORMAL)
  const MILK_ID = 'b0000000-0000-0000-0000-000000000001';
  const MILK_DEVICE_ID = 'c0000000-0000-0000-0000-000000000001';

  // Ensure Milk is at 50 L (NORMAL)
  await request('/api/iot/simulate', {
    method: 'POST',
    token,
    body: {
      deviceId: MILK_DEVICE_ID,
      calculatedUnits: 50,
      rawReading: 50000,
      batteryLevel: 98
    }
  });

  // STEP 2 & 3: Open IoT Monitor & Select Milk simulated device
  console.log('\n--- Step 2-4: IoT Monitor & Milk Device Initial State ---');
  const initialStockRes = await request(`/api/products/${MILK_ID}`, { token });
  assert(initialStockRes.status === 200, 'Step 2: Retrieved Milk product details');
  console.log(`Milk initial stock: ${initialStockRes.data.data.currentStock} ${initialStockRes.data.data.unit}`);

  const initialUnreadRes = await request('/api/notifications/unread-count', { token });
  const initialUnreadCount = initialUnreadRes.data.count;
  console.log(`Initial unread notification count: ${initialUnreadCount}`);

  // STEP 5: Send simulated IoT reading: 15 L
  console.log('\n--- Step 5-9: Send simulated reading: 15 L ---');
  const telemetryRes = await request('/api/iot/simulate', {
    method: 'POST',
    token,
    body: {
      deviceId: MILK_DEVICE_ID,
      calculatedUnits: 15,
      rawReading: 15000,
      batteryLevel: 95
    }
  });
  assert(telemetryRes.status === 200, 'Step 5: Successfully ingested simulated IoT telemetry (15 units)');

  // STEP 6: Verify Inventory 50 -> 15
  const updatedProductRes = await request(`/api/products/${MILK_ID}`, { token });
  const updatedStock = updatedProductRes.data.data.currentStock;
  assert(updatedStock === 15, `Step 6: Verified Inventory stock updated to 15 (was ${initialStockRes.data.data.currentStock})`);

  // STEP 7: Verify Stock Status: LOW
  const stockStatus = updatedProductRes.data.data.stockStatus;
  assert(stockStatus === 'LOW', `Step 7: Verified Stock Status is LOW (minimum threshold: 20)`);

  // STEP 8: Verify Alert: LOW_STOCK
  const alertsRes = await request('/api/alerts?status=ACTIVE', { token });
  const milkAlert = alertsRes.data.data.find((a) => a.productId === MILK_ID && a.status === 'ACTIVE');
  assert(milkAlert !== undefined, 'Step 8: Verified active alert exists for Milk');
  assert(milkAlert.alertType === 'LOW_STOCK', 'Step 8.1: Verified alert type is LOW_STOCK');
  assert(milkAlert.severity === 'LOW', 'Step 8.2: Verified alert severity is LOW');
  console.log(`Alert message: "${milkAlert.message}"`);

  // STEP 9: Verify Notification: Low Stock Alert
  const notifsRes = await request('/api/notifications', { token });
  const milkNotification = notifsRes.data.data.find((n) => n.alertId === milkAlert.id);
  assert(milkNotification !== undefined, 'Step 9: Verified Notification automatically created for new LOW alert');
  assert(milkNotification.type === 'LOW_STOCK', 'Step 9.1: Notification type is LOW_STOCK');
  assert(milkNotification.title === 'Low Stock Alert', 'Step 9.2: Notification title is "Low Stock Alert"');
  assert(milkNotification.productName === 'Milk', 'Step 9.3: Notification references product "Milk"');
  assert(milkNotification.isRead === false, 'Step 9.4: Notification is initially unread');

  // STEP 10: Look at the Topbar -> Bell with unread count
  console.log('\n--- Step 10: Topbar Unread Count ---');
  const updatedUnreadRes = await request('/api/notifications/unread-count', { token });
  assert(updatedUnreadRes.data.count >= initialUnreadCount + 1, 'Step 10: Topbar unread count increased with new notification');
  console.log(`Current Topbar Bell unread badge count: ${updatedUnreadRes.data.count}`);

  // STEP 11 & 12: Click Bell -> Notification appears -> Click notification -> Marked read & alert opens
  console.log('\n--- Step 11-12: Click Notification -> Mark as Read & Open Alert ---');
  const readRes = await request(`/api/notifications/${milkNotification.id}/read`, {
    method: 'PATCH',
    token
  });
  assert(readRes.status === 200, 'Step 11: Notification marked as read');
  assert(readRes.data.data.isRead === true, 'Step 11.1: isRead is true');
  assert(readRes.data.data.readAt !== null, 'Step 11.2: readAt timestamp recorded');

  // Navigate to alert (verify alert lookup by alertId works)
  const alertDetailRes = await request(`/api/alerts/${milkNotification.alertId}`, { token });
  assert(alertDetailRes.status === 200, 'Step 12: Successfully navigated to and loaded related alert details');
  assert(alertDetailRes.data.data.id === milkAlert.id, 'Step 12.1: Alert ID matches notification alertId');

  // STEP 13 & 14: Return to notification center & verify unread count changed
  console.log('\n--- Step 13-14: Notification Center State Check ---');
  const postReadCountRes = await request('/api/notifications/unread-count', { token });
  assert(postReadCountRes.data.count === updatedUnreadRes.data.count - 1, 'Step 14: Unread count decremented by 1 after reading notification');

  // STEP 15 & 16: Create another critical condition -> 8 L
  console.log('\n--- Step 15-16: Create CRITICAL condition (8 L) ---');
  const criticalTelemetry = await request('/api/iot/simulate', {
    method: 'POST',
    token,
    body: {
      deviceId: MILK_DEVICE_ID,
      calculatedUnits: 8, // 8 units <= 10 (50% min) -> CRITICAL
      rawReading: 8000,
      batteryLevel: 94
    }
  });
  assert(criticalTelemetry.status === 200, 'Step 15: Sent critical telemetry (8 units)');

  const critNotifsRes = await request('/api/notifications', { token });
  const critNotification = critNotifsRes.data.data.find(
    (n) => n.productName === 'Milk' && n.type === 'CRITICAL_STOCK'
  );
  assert(critNotification !== undefined, 'Step 16: Verified Critical Stock Alert notification appeared');
  assert(critNotification.title === 'Critical Stock Alert', 'Step 16.1: Notification title is "Critical Stock Alert"');

  // STEP 17 & 18: Mark all as read -> Unread count = 0
  console.log('\n--- Step 17-18: Mark all as read ---');
  const markAllRes = await request('/api/notifications/read-all', {
    method: 'PATCH',
    token
  });
  assert(markAllRes.status === 200, 'Step 17: Mark all notifications as read succeeded');

  const finalUnreadRes = await request('/api/notifications/unread-count', { token });
  assert(finalUnreadRes.data.count === 0, 'Step 18: Verified Unread count is exactly 0. Topbar badge will be hidden.');

  // Delete test
  console.log('\n--- Additional Verification: Delete notification without deleting alert ---');
  const deleteRes = await request(`/api/notifications/${critNotification.id}`, {
    method: 'DELETE',
    token
  });
  assert(deleteRes.status === 200, 'Deleted critical notification');

  // Check alert is still active
  const checkAlertRes = await request(`/api/alerts/${critNotification.alertId}`, { token });
  assert(checkAlertRes.status === 200 && checkAlertRes.data.data.id === critNotification.alertId, 'Verified Alert remains intact after notification deletion');

  console.log('\n====================================================');
  console.log('DEMO VERIFICATION COMPLETE & ALL 18 STEPS PASSED!');
  console.log('====================================================');
  process.exit(0);
}

runDemo().catch((err) => {
  console.error('[DEMO FAILED]:', err);
  process.exit(1);
});
