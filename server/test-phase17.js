/**
 * SmartStock Phase 17: Security & Production Hardening Test Suite
 * 
 * Verifies all 21 required security scenarios:
 * 1. Missing JWT
 * 2. Invalid JWT
 * 3. Expired JWT
 * 4. STAFF accessing MANAGER endpoint
 * 5. User accessing another user's notification
 * 6. User modifying another user's preferences
 * 7. User modifying another user's profile
 * 8. Invalid product ID
 * 9. Invalid supplier ID
 * 10. Invalid quantity
 * 11. Negative quantity
 * 12. Invalid price
 * 13. Invalid pagination
 * 14. Excessive pagination limit
 * 15. Invalid sort field
 * 16. Invalid filter
 * 17. Invalid date range
 * 18. Invalid IoT battery
 * 19. Invalid IoT quantity
 * 20. Duplicate restock receiving
 * 21. Missing required environment variable behavior
 * (Plus Bonus 22 & 23: Security Headers and Rate Limiting)
 */

import http from 'http';
import jwt from 'jsonwebtoken';
import app from './server.js';
import config, { validateEnv } from './src/config/env.js';
import { generateToken } from './src/utils/jwt.js';
import { _resetInMemoryUsers, getCurrentUser } from './src/services/auth.service.js';
import { _resetInMemoryPreferences, getUserPreferences } from './src/services/settings.service.js';
import { _resetInMemoryNotifications, createNotification } from './src/services/notification.service.js';
import { _resetRateLimits } from './src/middleware/rateLimit.middleware.js';
import { createRestockOrder } from './src/services/restock.service.js';

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
  console.log('SMARTSTOCK PHASE 17: SECURITY & PRODUCTION HARDENING');
  console.log('====================================================\n');

  // Setup server on ephemeral port
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`[TEST SERVER] Running on port ${port}`);
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

  // ----------------------------------------------------
  // TEST 1: Missing JWT
  // ----------------------------------------------------
  console.log('Test 1: Missing JWT authentication check');
  const res1 = await makeRequest('/api/products');
  assert(res1.status === 401, 'Request without JWT returns HTTP 401 Unauthorized');
  assert(res1.data.success === false, 'Error response returns success: false');

  // ----------------------------------------------------
  // TEST 2: Invalid JWT
  // ----------------------------------------------------
  console.log('\nTest 2: Invalid / malformed JWT check');
  const res2 = await makeRequest('/api/products', { token: 'invalid.token.payload.signature' });
  assert(res2.status === 401, 'Request with invalid JWT returns HTTP 401 Unauthorized');

  // ----------------------------------------------------
  // TEST 3: Expired JWT
  // ----------------------------------------------------
  console.log('\nTest 3: Expired JWT check');
  const expiredToken = jwt.sign(
    { userId: MANAGER_USER.id, email: MANAGER_USER.email, role: 'MANAGER' },
    config.jwt.secret,
    { expiresIn: '-10s' }
  );
  const res3 = await makeRequest('/api/products', { token: expiredToken });
  assert(res3.status === 401, 'Request with expired JWT returns HTTP 401 Unauthorized');

  // ----------------------------------------------------
  // TEST 4: STAFF accessing MANAGER endpoint
  // ----------------------------------------------------
  console.log('\nTest 4: Role-Based Access Control — STAFF blocked from MANAGER endpoints');
  const res4Supplier = await makeRequest('/api/suppliers', {
    method: 'POST',
    token: staffToken,
    body: { name: 'Unauthorized Supplier Co' }
  });
  assert(res4Supplier.status === 403, 'STAFF cannot create supplier (HTTP 403)');

  const res4Product = await makeRequest('/api/products', {
    method: 'POST',
    token: staffToken,
    body: { name: 'Unauthorized Product' }
  });
  assert(res4Product.status === 403, 'STAFF cannot create product (HTTP 403)');

  const res4Adjust = await makeRequest('/api/inventory/adjust', {
    method: 'POST',
    token: staffToken,
    body: { productId: 'b0000000-0000-0000-0000-000000000001', newStock: 50, reason: 'Unauthorized' }
  });
  assert(res4Adjust.status === 403, 'STAFF cannot adjust inventory stock (HTTP 403)');

  // ----------------------------------------------------
  // TEST 5: User accessing another user's notification
  // ----------------------------------------------------
  console.log("\nTest 5: IDOR Defense — User accessing another user's notification");
  const managerNotif = await createNotification({
    userId: MANAGER_USER.id,
    title: 'Secret Manager Notification',
    message: 'Strictly confidential'
  });

  const res5Read = await makeRequest(`/api/notifications/${managerNotif.id}`, {
    token: staffToken
  });
  assert(res5Read.status === 404, "STAFF cannot view MANAGER's notification (returns 404 to avoid leaking existence)");

  const res5Patch = await makeRequest(`/api/notifications/${managerNotif.id}/read`, {
    method: 'PATCH',
    token: staffToken
  });
  assert(res5Patch.status === 404, "STAFF cannot mark MANAGER's notification as read (returns 404)");

  // ----------------------------------------------------
  // TEST 6: User modifying another user's preferences
  // ----------------------------------------------------
  console.log("\nTest 6: IDOR Defense — User modifying another user's preferences");
  _resetInMemoryPreferences();
  const res6 = await makeRequest('/api/settings/preferences', {
    method: 'PUT',
    token: staffToken,
    body: {
      userId: MANAGER_USER.id, // Maliciously injected target user ID
      lowStockEnabled: false
    }
  });
  assert(res6.status === 200, 'Preference update request handled successfully');
  const managerPrefs = await getUserPreferences(MANAGER_USER.id);
  assert(managerPrefs.low_stock_enabled === true, "Manager's preferences were not modified by Staff request");
  const staffPrefs = await getUserPreferences(STAFF_USER.id);
  assert(staffPrefs.low_stock_enabled === false, "Only requesting Staff user's preferences were updated");

  // ----------------------------------------------------
  // TEST 7: User modifying another user's profile
  // ----------------------------------------------------
  console.log("\nTest 7: Mass Assignment / IDOR — User modifying another user's profile");
  _resetInMemoryUsers();
  const res7 = await makeRequest('/api/auth/profile', {
    method: 'PUT',
    token: staffToken,
    body: {
      userId: MANAGER_USER.id, // Injected userId
      role: 'MANAGER',         // Injected role privilege escalation
      name: 'Taylor Brooks Updated'
    }
  });
  assert(res7.status === 200, 'Profile update request processed');
  const managerProfile = await getCurrentUser(MANAGER_USER.id);
  assert(managerProfile.name === 'Alex Morgan', "Manager's name remains untouched");
  assert(res7.data.user.role === 'STAFF', 'Role escalation was ignored and staff role retained');

  // ----------------------------------------------------
  // TEST 8: Invalid product ID
  // ----------------------------------------------------
  console.log('\nTest 8: Invalid product ID lookup returns 404 cleanly');
  const res8 = await makeRequest('/api/products/00000000-0000-0000-0000-000000000000', {
    token: managerToken
  });
  assert(res8.status === 404, 'Non-existent product returns HTTP 404 without crashing');

  // ----------------------------------------------------
  // TEST 9: Invalid supplier ID
  // ----------------------------------------------------
  console.log('\nTest 9: Invalid supplier ID lookup returns 404 cleanly');
  const res9 = await makeRequest('/api/suppliers/00000000-0000-0000-0000-000000000000', {
    token: managerToken
  });
  assert(res9.status === 404, 'Non-existent supplier returns HTTP 404 without crashing');

  // ----------------------------------------------------
  // TEST 10: Invalid quantity
  // ----------------------------------------------------
  console.log('\nTest 10: Invalid quantity (NaN, string, zero) rejected');
  const res10String = await makeRequest('/api/inventory/stock-in', {
    method: 'POST',
    token: managerToken,
    body: {
      productId: 'b0000000-0000-0000-0000-000000000001',
      quantity: 'not-a-number',
      reason: 'Invalid quantity test'
    }
  });
  assert(res10String.status === 400, 'Non-numeric quantity returns HTTP 400');

  const res10Zero = await makeRequest('/api/inventory/stock-in', {
    method: 'POST',
    token: managerToken,
    body: {
      productId: 'b0000000-0000-0000-0000-000000000001',
      quantity: 0,
      reason: 'Zero quantity test'
    }
  });
  assert(res10Zero.status === 400, 'Zero quantity returns HTTP 400');

  // ----------------------------------------------------
  // TEST 11: Negative quantity
  // ----------------------------------------------------
  console.log('\nTest 11: Negative quantity rejected');
  const res11 = await makeRequest('/api/inventory/stock-in', {
    method: 'POST',
    token: managerToken,
    body: {
      productId: 'b0000000-0000-0000-0000-000000000001',
      quantity: -50,
      reason: 'Negative quantity attack'
    }
  });
  assert(res11.status === 400, 'Negative quantity returns HTTP 400');

  // ----------------------------------------------------
  // TEST 12: Invalid price
  // ----------------------------------------------------
  console.log('\nTest 12: Negative or invalid price rejected');
  const res12Negative = await makeRequest('/api/products', {
    method: 'POST',
    token: managerToken,
    body: {
      sku: 'SKU-NEG-PRICE',
      name: 'Negative Price Item',
      category: 'Test',
      unit: 'pcs',
      price: -15.50
    }
  });
  assert(res12Negative.status === 400, 'Negative price returns HTTP 400');

  // ----------------------------------------------------
  // TEST 13: Invalid pagination
  // ----------------------------------------------------
  console.log('\nTest 13: Invalid pagination rejected or sanitized');
  const res13 = await makeRequest('/api/products?page=-1', {
    token: managerToken
  });
  assert(res13.status === 400, 'Negative page parameter rejected with HTTP 400');

  // ----------------------------------------------------
  // TEST 14: Excessive pagination limit capped
  // ----------------------------------------------------
  console.log('\nTest 14: Excessive pagination limit (limit=999999999) capped to 100');
  const res14 = await makeRequest('/api/suppliers?limit=999999999', {
    token: managerToken
  });
  assert(res14.status === 200, 'Excessive limit request handled successfully');
  assert(res14.data.pagination.limit <= 100, `Pagination limit was safely capped at ${res14.data.pagination.limit} (<= 100)`);

  // ----------------------------------------------------
  // TEST 15: Invalid sort field fallback
  // ----------------------------------------------------
  console.log('\nTest 15: Invalid sort field safely rejected or fallen back to allowlist');
  const res15 = await makeRequest('/api/products?sort=malicious_col;DROP%20TABLE', {
    token: managerToken
  });
  assert(res15.status === 200, 'Malicious sort field did not cause SQL injection or crash');

  // ----------------------------------------------------
  // TEST 16: Invalid filter rejected
  // ----------------------------------------------------
  console.log('\nTest 16: Invalid filter values rejected');
  const res16Alert = await makeRequest('/api/alerts?severity=EXTREME_HACK', {
    token: managerToken
  });
  assert(res16Alert.status === 400, 'Invalid alert severity filter returns HTTP 400');

  const res16Product = await makeRequest('/api/products?status=INVALID_STATUS', {
    token: managerToken
  });
  assert(res16Product.status === 400, 'Invalid product status filter returns HTTP 400');

  // ----------------------------------------------------
  // TEST 17: Invalid date range
  // ----------------------------------------------------
  console.log('\nTest 17: Invalid date range (startDate > endDate) rejected');
  const res17 = await makeRequest('/api/inventory/history?startDate=2026-10-30&endDate=2026-10-01', {
    token: managerToken
  });
  assert(res17.status === 400, 'Invalid inverted date range returns HTTP 400');

  // ----------------------------------------------------
  // TEST 18: Invalid IoT battery level
  // ----------------------------------------------------
  console.log('\nTest 18: Invalid IoT battery level rejected');
  const res18Over = await makeRequest('/api/iot/simulate', {
    method: 'POST',
    token: managerToken,
    body: {
      deviceId: 'd0000000-0000-0000-0000-000000000001',
      calculatedUnits: 10,
      batteryLevel: 250 // Exceeds 100
    }
  });
  assert(res18Over.status === 400, 'Battery level > 100 returns HTTP 400');

  const res18Neg = await makeRequest('/api/iot/simulate', {
    method: 'POST',
    token: managerToken,
    body: {
      deviceId: 'd0000000-0000-0000-0000-000000000001',
      calculatedUnits: 10,
      batteryLevel: -10 // Below 0
    }
  });
  assert(res18Neg.status === 400, 'Negative battery level returns HTTP 400');

  // ----------------------------------------------------
  // TEST 19: Invalid IoT quantity
  // ----------------------------------------------------
  console.log('\nTest 19: Negative or invalid IoT quantity rejected');
  const res19 = await makeRequest('/api/iot/simulate', {
    method: 'POST',
    token: managerToken,
    body: {
      deviceId: 'd0000000-0000-0000-0000-000000000001',
      calculatedUnits: -25 // Negative stock manipulation
    }
  });
  assert(res19.status === 400, 'Negative simulated quantity returns HTTP 400');

  // ----------------------------------------------------
  // TEST 20: Duplicate restock receiving
  // ----------------------------------------------------
  console.log('\nTest 20: Duplicate restock order receiving strictly rejected');
  const newOrder = await createRestockOrder({
    supplierId: 'a0000000-0000-0000-0000-000000000001',
    items: [{ productId: 'b0000000-0000-0000-0000-000000000001', quantity: 5, unitPrice: 3.50 }],
    userId: MANAGER_USER.id
  });

  // First receive: Success
  const res20First = await makeRequest(`/api/restock/${newOrder.id}/receive`, {
    method: 'PATCH',
    token: managerToken
  });
  assert(res20First.status === 200, 'Initial restock receive succeeds (HTTP 200)');

  // Second receive attempt: Duplicate error
  const res20Second = await makeRequest(`/api/restock/${newOrder.id}/receive`, {
    method: 'PATCH',
    token: managerToken
  });
  assert(res20Second.status === 400, 'Duplicate restock receive strictly rejected (HTTP 400)');
  assert(
    res20Second.data.message?.toLowerCase().includes('already been received'),
    'Duplicate receive returned expected guard message'
  );

  // ----------------------------------------------------
  // TEST 21: Missing required environment variable behavior
  // ----------------------------------------------------
  console.log('\nTest 21: Server startup environment validation behavior');
  const originalEnv = process.env.NODE_ENV;
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    process.env.NODE_ENV = 'production';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    let threw = false;
    try {
      validateEnv();
    } catch (envErr) {
      threw = true;
      assert(
        envErr.message.includes('SUPABASE_SERVICE_ROLE_KEY'),
        'Production validation throws clear configuration error for missing secrets'
      );
    }
    assert(threw, 'validateEnv() threw in production when required variables are missing');
  } finally {
    process.env.NODE_ENV = originalEnv;
    if (originalKey) {
      process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
    }
  }

  // ----------------------------------------------------
  // TEST 22: Security Headers Verification
  // ----------------------------------------------------
  console.log('\nTest 22: HTTP Security Headers verification');
  const res22 = await makeRequest('/api/health');
  assert(res22.headers['x-content-type-options'] === 'nosniff', 'X-Content-Type-Options: nosniff is set');
  assert(res22.headers['x-frame-options'] === 'DENY', 'X-Frame-Options: DENY is set');
  assert(!res22.headers['x-powered-by'], 'X-Powered-By fingerprint is stripped');

  // ----------------------------------------------------
  // TEST 23: Rate Limiting Verification
  // ----------------------------------------------------
  console.log('\nTest 23: Rate limiting functionality');
  _resetRateLimits();
  let rateLimited = false;
  // Trigger auth rate limiter threshold (60 requests)
  for (let i = 0; i < 65; i++) {
    const resAuth = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'bad@user.com', password: 'badpassword' }
    });
    if (resAuth.status === 429) {
      rateLimited = true;
      assert(resAuth.headers['retry-after'] !== undefined, 'Retry-After header is present on HTTP 429');
      break;
    }
  }
  assert(rateLimited, 'Rate limiter triggers HTTP 429 Too Many Requests after threshold');
  _resetRateLimits();

  // Close server
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log('\n====================================================');
  console.log('ALL PHASE 17 SECURITY TESTS PASSED SUCCESSFULLY! (23/23)');
  console.log('====================================================\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('[FATAL ERROR IN SECURITY TESTS]:', err);
  if (server) server.close();
  process.exit(1);
});
