/**
 * Comprehensive Automated Phase 8 Test Suite
 * Tests all criteria specified in PART 45
 */

import http from 'http';
import app from './server.js';
import * as alertService from './src/services/alert.service.js';
import * as productService from './src/services/product.service.js';
import * as notificationService from './src/services/notification.service.js';
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

async function runTests() {
  console.log('====================================================');
  console.log('SMARTSTOCK PHASE 8: NOTIFICATIONS & NOTIFICATION CENTER TEST SUITE');
  console.log('====================================================\n');

  // Start temporary server on dynamic free port
  await new Promise((resolve) => {
    const s = app.listen(0, () => {
      const port = s.address().port;
      baseUrl = `http://localhost:${port}`;
      server = s;
      console.log(`[Test Server] Listening on ${baseUrl}`);
      resolve();
    });
  });

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

  try {
    // Reset test repositories
    notificationService._resetInMemoryNotifications();

    // Reset Milk product stock to NORMAL (50) and clear alerts for Milk
    await productService.updateProductStock(MILK_ID, 50);
    await alertService.evaluateStockAlert(MILK_ID, 'SYSTEM');

    // Initial Unread Count check
    const initialUnread = await makeRequest('/api/notifications/unread-count', { token: managerToken });
    assert(initialUnread.status === 200, 'TEST: Initial GET /api/notifications/unread-count returns 200');
    assert(typeof initialUnread.data.count === 'number', 'TEST: Unread count returns numeric value');

    // ----------------------------------------------------
    // TEST 1: Create a LOW alert -> Notification created.
    // ----------------------------------------------------
    console.log('\n--- TEST 1: Create a LOW alert -> Notification created ---');
    await productService.updateProductStock(MILK_ID, 15); // min is 20 -> LOW
    const lowEval = await alertService.evaluateStockAlert(MILK_ID, 'IOT');
    assert(lowEval.action === 'CREATED', 'Test 1.1: Alert Engine creates NEW LOW_STOCK alert');
    const lowAlertId = lowEval.alert.id;

    // Check manager's notifications
    const resT1 = await makeRequest('/api/notifications', { token: managerToken });
    assert(resT1.status === 200, 'Test 1.2: GET /api/notifications returns 200');
    const lowNotif = resT1.data.data.find((n) => n.alertId === lowAlertId);
    assert(lowNotif !== undefined, 'Test 1.3: Notification was automatically created for new LOW alert');
    assert(lowNotif.type === 'LOW_STOCK', 'Test 1.4: Notification type is LOW_STOCK');
    assert(lowNotif.title === 'Low Stock Alert', 'Test 1.5: Notification title is "Low Stock Alert"');
    assert(lowNotif.isRead === false, 'Test 1.6: New notification is unread');
    assert(lowNotif.productName === 'Milk', 'Test 1.7: Notification contains product name "Milk"');

    // ----------------------------------------------------
    // TEST 2: Same active alert evaluated again -> No duplicate notification.
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Same active alert evaluated again -> No duplicate notification ---');
    const countBeforeT2 = resT1.data.data.length;
    const sameEval = await alertService.evaluateStockAlert(MILK_ID, 'IOT');
    assert(sameEval.action === 'EXISTING_MAINTAINED', 'Test 2.1: Alert engine maintains existing alert without creating new one');

    const resT2 = await makeRequest('/api/notifications', { token: managerToken });
    assert(resT2.data.data.length === countBeforeT2, 'Test 2.2: Notification count did not increase on identical evaluation');
    const lowNotifs = resT2.data.data.filter((n) => n.alertId === lowAlertId);
    assert(lowNotifs.length === 1, 'Test 2.3: Exactly one notification exists for this alert and user');

    // ----------------------------------------------------
    // TEST 3: Create CRITICAL alert -> Critical notification created.
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Create CRITICAL alert -> Critical notification created ---');
    await productService.updateProductStock(MILK_ID, 8); // 8 <= 10 (50% of 20) -> CRITICAL
    const critEval = await alertService.evaluateStockAlert(MILK_ID, 'IOT');
    assert(critEval.action === 'CREATED', 'Test 3.1: Alert Engine creates NEW CRITICAL alert');

    const resT3 = await makeRequest('/api/notifications', { token: managerToken });
    const critNotif = resT3.data.data.find((n) => n.alertId === critEval.alert.id);
    assert(critNotif !== undefined, 'Test 3.2: Critical notification created for new critical alert');
    assert(critNotif.type === 'CRITICAL_STOCK', 'Test 3.3: Notification type is CRITICAL_STOCK');
    assert(critNotif.title === 'Critical Stock Alert', 'Test 3.4: Notification title is "Critical Stock Alert"');

    // ----------------------------------------------------
    // TEST 4: Create OUT_OF_STOCK alert -> Out-of-stock notification created.
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Create OUT_OF_STOCK alert -> Out-of-stock notification created ---');
    await productService.updateProductStock(MILK_ID, 0); // 0 -> OUT_OF_STOCK
    const oosEval = await alertService.evaluateStockAlert(MILK_ID, 'IOT');
    assert(oosEval.action === 'CREATED', 'Test 4.1: Alert Engine creates NEW OUT_OF_STOCK alert');

    const resT4 = await makeRequest('/api/notifications', { token: managerToken });
    const oosNotif = resT4.data.data.find((n) => n.alertId === oosEval.alert.id);
    assert(oosNotif !== undefined, 'Test 4.2: Out-of-stock notification created');
    assert(oosNotif.type === 'OUT_OF_STOCK', 'Test 4.3: Notification type is OUT_OF_STOCK');
    assert(oosNotif.title === 'Out of Stock Alert', 'Test 4.4: Notification title is "Out of Stock Alert"');

    // ----------------------------------------------------
    // TEST 5: User opens notification -> Mark as read works.
    // ----------------------------------------------------
    console.log('\n--- TEST 5: User marks notification as read ---');
    const targetNotifId = lowNotif.id;
    const readRes = await makeRequest(`/api/notifications/${targetNotifId}/read`, {
      method: 'PATCH',
      token: managerToken
    });
    assert(readRes.status === 200, 'Test 5.1: PATCH /api/notifications/:id/read returns 200');
    assert(readRes.data.data.isRead === true, 'Test 5.2: isRead is true after marking as read');
    assert(readRes.data.data.readAt !== null, 'Test 5.3: readAt timestamp is populated');

    // Verify GET single returns read state
    const singleRes = await makeRequest(`/api/notifications/${targetNotifId}`, { token: managerToken });
    assert(singleRes.data.data.isRead === true, 'Test 5.4: GET /api/notifications/:id reflects isRead = true');

    // ----------------------------------------------------
    // TEST 6: Mark notification as unread -> Unread count increases.
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Mark notification as unread ---');
    const unreadCountBefore = (await makeRequest('/api/notifications/unread-count', { token: managerToken })).data.count;

    const unreadRes = await makeRequest(`/api/notifications/${targetNotifId}/unread`, {
      method: 'PATCH',
      token: managerToken
    });
    assert(unreadRes.status === 200, 'Test 6.1: PATCH /api/notifications/:id/unread returns 200');
    assert(unreadRes.data.data.isRead === false, 'Test 6.2: isRead is false');
    assert(unreadRes.data.data.readAt === null, 'Test 6.3: readAt is cleared to null');

    const unreadCountAfter = (await makeRequest('/api/notifications/unread-count', { token: managerToken })).data.count;
    assert(unreadCountAfter === unreadCountBefore + 1, 'Test 6.4: Unread count increased by 1');

    // ----------------------------------------------------
    // TEST 7: Mark all as read.
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Mark all notifications as read ---');
    const markAllRes = await makeRequest('/api/notifications/read-all', {
      method: 'PATCH',
      token: managerToken
    });
    assert(markAllRes.status === 200, 'Test 7.1: PATCH /api/notifications/read-all returns 200');
    assert(markAllRes.data.message === 'All notifications marked as read', 'Test 7.2: Returns expected success message');

    const unreadCountZero = (await makeRequest('/api/notifications/unread-count', { token: managerToken })).data.count;
    assert(unreadCountZero === 0, 'Test 7.3: Manager unread notification count is now 0');

    // ----------------------------------------------------
    // TEST 8: Delete notification -> Only notification deleted, alert remains.
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Delete notification ---');
    const delRes = await makeRequest(`/api/notifications/${targetNotifId}`, {
      method: 'DELETE',
      token: managerToken
    });
    assert(delRes.status === 200, 'Test 8.1: DELETE /api/notifications/:id returns 200');

    const getDeleted = await makeRequest(`/api/notifications/${targetNotifId}`, { token: managerToken });
    assert(getDeleted.status === 404, 'Test 8.2: Deleted notification cannot be retrieved (404)');

    // Verify related alert still exists in alertService
    const alertStillExists = await alertService.getAlertById(lowAlertId);
    assert(alertStillExists !== null && alertStillExists.id === lowAlertId, 'Test 8.3: Related alert remains intact in database');

    // ----------------------------------------------------
    // TEST 9: Resolve alert -> Notification remains.
    // ----------------------------------------------------
    console.log('\n--- TEST 9: Resolve alert -> Notification remains ---');
    // We have critNotif still associated with critEval.alert.id
    const critAlertId = critEval.alert.id;
    await alertService.resolveAlert(critAlertId);

    const getCritNotif = await makeRequest(`/api/notifications/${critNotif.id}`, { token: managerToken });
    assert(getCritNotif.status === 200, 'Test 9.1: Notification still exists after its alert is resolved');
    assert(getCritNotif.data.data.id === critNotif.id, 'Test 9.2: Notification preserves full historical record');

    // ----------------------------------------------------
    // TEST 10: Another user attempts to access notification -> Access denied (404).
    // ----------------------------------------------------
    console.log('\n--- TEST 10: Another user attempts to access notification -> Access denied ---');
    // critNotif belongs to Manager. Taylor Brooks (Staff) attempts to access it:
    const forbiddenRes = await makeRequest(`/api/notifications/${critNotif.id}`, { token: staffToken });
    assert(forbiddenRes.status === 404, 'Test 10.1: User cannot access another user notification (returns 404)');

    const forbiddenPatch = await makeRequest(`/api/notifications/${critNotif.id}/read`, {
      method: 'PATCH',
      token: staffToken
    });
    assert(forbiddenPatch.status === 404, 'Test 10.2: User cannot mark another user notification as read');

    const forbiddenDelete = await makeRequest(`/api/notifications/${critNotif.id}`, {
      method: 'DELETE',
      token: staffToken
    });
    assert(forbiddenDelete.status === 404, 'Test 10.3: User cannot delete another user notification');

    // ----------------------------------------------------
    // TEST 11 & 12: Unread count endpoint and badge behavior
    // ----------------------------------------------------
    console.log('\n--- TEST 11 & 12: Unread count endpoint ---');
    // Staff has seeded notifications that are unread
    const staffUnread = await makeRequest('/api/notifications/unread-count', { token: staffToken });
    assert(staffUnread.status === 200, 'Test 11.1: Staff unread-count returns 200');
    assert(staffUnread.data.count > 0, 'Test 11.2: Staff has positive unread count');

    // ----------------------------------------------------
    // TEST 15 & 16: Notification filtering and search
    // ----------------------------------------------------
    console.log('\n--- TEST 15 & 16: Filters and Search ---');
    // Filter by type
    const filterRes = await makeRequest('/api/notifications?type=OUT_OF_STOCK', { token: staffToken });
    assert(filterRes.status === 200, 'Test 15.1: GET /api/notifications?type=OUT_OF_STOCK returns 200');
    const allOos = filterRes.data.data.every((n) => n.type === 'OUT_OF_STOCK');
    assert(allOos === true, 'Test 15.2: All returned notifications have type OUT_OF_STOCK');

    // Search by product name "Sugar"
    const searchRes = await makeRequest('/api/notifications?search=Sugar', { token: staffToken });
    assert(searchRes.status === 200, 'Test 16.1: Search by "Sugar" returns 200');
    assert(searchRes.data.data.length > 0, 'Test 16.2: Found notifications matching "Sugar"');
    const matchesSugar = searchRes.data.data.every(
      (n) => n.productName?.includes('Sugar') || n.title?.includes('Sugar') || n.message?.includes('Sugar')
    );
    assert(matchesSugar === true, 'Test 16.3: All search results contain the search term');

    // ----------------------------------------------------
    // TEST 17: Pagination/limit
    // ----------------------------------------------------
    console.log('\n--- TEST 17: Pagination / Limit ---');
    const pageRes = await makeRequest('/api/notifications?limit=1&offset=0', { token: staffToken });
    assert(pageRes.status === 200, 'Test 17.1: Pagination query returns 200');
    assert(pageRes.data.data.length === 1, 'Test 17.2: Exactly 1 record returned when limit=1');
    assert(pageRes.data.pagination.limit === 1, 'Test 17.3: Pagination metadata matches requested limit');

    // ----------------------------------------------------
    // TEST 19: Unauthorized requests blocked
    // ----------------------------------------------------
    console.log('\n--- TEST 19: Security & Authorization ---');
    const unauthGet = await makeRequest('/api/notifications');
    assert(unauthGet.status === 401, 'Test 19.1: Unauthenticated request rejected with 401');

    const unauthCount = await makeRequest('/api/notifications/unread-count');
    assert(unauthCount.status === 401, 'Test 19.2: Unauthenticated unread-count rejected with 401');

    console.log('\n====================================================');
    console.log('ALL PHASE 8 TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');
    if (server) {
      server.close();
    }
    process.exit(0);
  } catch (err) {
    console.error('[UNEXPECTED TEST ERROR]:', err);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
  }
}

runTests();
