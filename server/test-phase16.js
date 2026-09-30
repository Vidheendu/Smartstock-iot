/**
 * SmartStock Phase 16: Settings & Profile Management Test Suite
 * 
 * Verifies all 16 required test scenarios:
 * 1. Get profile
 * 2. Update profile
 * 3. Invalid profile data
 * 4. Get preferences
 * 5. Update preferences
 * 6. Default preferences
 * 7. Change password
 * 8. Incorrect current password
 * 9. Password mismatch
 * 10. Password hashing (hashes never returned / plaintext never stored)
 * 11. STAFF profile access
 * 12. MANAGER profile access
 * 13. User cannot update another user's profile
 * 14. User cannot update another user's preferences
 * 15. Notification preference behavior (disabled preferences prevent future notifications)
 * 16. Logout behavior
 */

import http from 'http';
import app from './server.js';
import { generateToken } from './src/utils/jwt.js';
import { _resetInMemoryUsers } from './src/services/auth.service.js';
import { _resetInMemoryPreferences } from './src/services/settings.service.js';
import { _resetInMemoryNotifications, createNotification } from './src/services/notification.service.js';

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
  console.log('SMARTSTOCK PHASE 16: SETTINGS & PROFILE MANAGEMENT');
  console.log('====================================================\n');

  // Reset stores to ensure clean state
  _resetInMemoryUsers();
  _resetInMemoryPreferences();
  _resetInMemoryNotifications();

  // Start test server on dynamic free port
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;
  console.log(`[Test Server] Listening on ${baseUrl}\n`);

  // Generate tokens for test identities
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
    // -------------------------------------------------------------------------
    // TEST 1: Get Profile
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: Get Profile ---');
    const getProfileRes = await makeRequest('/api/auth/me', { token: managerToken });
    assert(getProfileRes.status === 200, 'GET /api/auth/me returns 200');
    assert(getProfileRes.data.success === true, 'Response indicates success = true');
    assert(getProfileRes.data.user.name === 'Alex Morgan', 'Returns user name Alex Morgan');
    assert(getProfileRes.data.user.email === 'manager@smartstock.com', 'Returns correct email');
    assert(getProfileRes.data.user.role === 'MANAGER', 'Returns correct role MANAGER');
    assert(Boolean(getProfileRes.data.user.createdAt || getProfileRes.data.user.created_at), 'Returns account created date');
    assert(getProfileRes.data.user.password_hash === undefined, 'Password hash is NOT exposed');
    console.log('');

    // -------------------------------------------------------------------------
    // TEST 2: Update Profile
    // -------------------------------------------------------------------------
    console.log('--- TEST 2: Update Profile ---');
    const updateRes = await makeRequest('/api/auth/profile', {
      method: 'PUT',
      token: managerToken,
      body: { name: 'Alex Morgan-Smith' }
    });
    assert(updateRes.status === 200, 'PUT /api/auth/profile returns 200');
    assert(updateRes.data.success === true, 'Response indicates success = true');
    assert(updateRes.data.user.name === 'Alex Morgan-Smith', 'Profile name updated to Alex Morgan-Smith');

    // Verify persistence with GET /api/auth/me
    const verifyProfileRes = await makeRequest('/api/auth/me', { token: managerToken });
    assert(verifyProfileRes.data.user.name === 'Alex Morgan-Smith', 'Updated name persisted in database/store');
    console.log('');

    // -------------------------------------------------------------------------
    // TEST 3: Invalid Profile Data
    // -------------------------------------------------------------------------
    console.log('--- TEST 3: Invalid Profile Data ---');
    const emptyNameRes = await makeRequest('/api/auth/profile', {
      method: 'PUT',
      token: managerToken,
      body: { name: '   ' }
    });
    assert(emptyNameRes.status === 400, 'Empty name rejected with 400');
    assert(emptyNameRes.data.success === false, 'Indicates failure');

    const longNameRes = await makeRequest('/api/auth/profile', {
      method: 'PUT',
      token: managerToken,
      body: { name: 'A'.repeat(105) }
    });
    assert(longNameRes.status === 400, 'Overly long name rejected with 400');
    console.log('');

    // -------------------------------------------------------------------------
    // TEST 4: Get Preferences
    // -------------------------------------------------------------------------
    console.log('--- TEST 4: Get Preferences ---');
    const getPrefRes = await makeRequest('/api/settings/preferences', { token: managerToken });
    assert(getPrefRes.status === 200, 'GET /api/settings/preferences returns 200');
    assert(getPrefRes.data.success === true, 'Preferences fetch indicates success');
    assert(typeof getPrefRes.data.preferences.low_stock_enabled === 'boolean', 'Contains low_stock_enabled');
    assert(typeof getPrefRes.data.preferences.critical_stock_enabled === 'boolean', 'Contains critical_stock_enabled');
    assert(typeof getPrefRes.data.preferences.out_of_stock_enabled === 'boolean', 'Contains out_of_stock_enabled');
    assert(typeof getPrefRes.data.preferences.system_notifications_enabled === 'boolean', 'Contains system_notifications_enabled');
    console.log('');

    // -------------------------------------------------------------------------
    // TEST 5: Update Preferences
    // -------------------------------------------------------------------------
    console.log('--- TEST 5: Update Preferences ---');
    const updatePrefRes = await makeRequest('/api/settings/preferences', {
      method: 'PUT',
      token: managerToken,
      body: {
        low_stock_enabled: false,
        critical_stock_enabled: true
      }
    });
    assert(updatePrefRes.status === 200, 'PUT /api/settings/preferences returns 200');
    assert(updatePrefRes.data.preferences.low_stock_enabled === false, 'low_stock_enabled updated to false');

    // Verify persistence
    const verifyPrefRes = await makeRequest('/api/settings/preferences', { token: managerToken });
    assert(verifyPrefRes.data.preferences.low_stock_enabled === false, 'Updated preference persisted');
    assert(verifyPrefRes.data.preferences.critical_stock_enabled === true, 'critical_stock_enabled remains true');
    console.log('');

    // -------------------------------------------------------------------------
    // TEST 6: Default Preferences
    // -------------------------------------------------------------------------
    console.log('--- TEST 6: Default Preferences ---');
    const freshUserId = 'e0000000-0000-0000-0000-999999999999';
    const freshToken = generateToken({
      userId: freshUserId,
      email: 'newuser@smartstock.com',
      role: 'STAFF'
    });
    const defaultPrefRes = await makeRequest('/api/settings/preferences', { token: freshToken });
    assert(defaultPrefRes.status === 200, 'GET /api/settings/preferences for fresh user returns 200');
    assert(defaultPrefRes.data.preferences.low_stock_enabled === true, 'Default low_stock_enabled is true');
    assert(defaultPrefRes.data.preferences.critical_stock_enabled === true, 'Default critical_stock_enabled is true');
    assert(defaultPrefRes.data.preferences.out_of_stock_enabled === true, 'Default out_of_stock_enabled is true');
    assert(defaultPrefRes.data.preferences.system_notifications_enabled === true, 'Default system_notifications_enabled is true');
    console.log('');

    // -------------------------------------------------------------------------
    // TEST 7: Change Password & Login with New Password
    // -------------------------------------------------------------------------
    console.log('--- TEST 7: Change Password ---');
    // Register a dedicated user for password change testing
    const regRes = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Password Tester',
        email: 'tester@smartstock.com',
        password: 'password123',
        role: 'STAFF'
      }
    });
    assert(regRes.status === 201, 'Test user registered');
    const testerId = regRes.data.user.id;
    const testerToken = generateToken({
      userId: testerId,
      email: 'tester@smartstock.com',
      role: 'STAFF'
    });

    const changePwRes = await makeRequest('/api/auth/change-password', {
      method: 'PUT',
      token: testerToken,
      body: {
        currentPassword: 'password123',
        newPassword: 'newsecurepassword99',
        confirmPassword: 'newsecurepassword99'
      }
    });
    assert(changePwRes.status === 200, 'PUT /api/auth/change-password returns 200');
    assert(changePwRes.data.success === true, 'Response indicates password changed successfully');

    // Verify old password fails
    const oldLoginRes = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'tester@smartstock.com', password: 'password123' }
    });
    assert(oldLoginRes.status === 401, 'Old password rejected on login');

    // Verify new password succeeds
    const newLoginRes = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'tester@smartstock.com', password: 'newsecurepassword99' }
    });
    assert(newLoginRes.status === 200, 'New password accepted on login');
    console.log('');

    // -------------------------------------------------------------------------
    // TEST 8: Incorrect Current Password
    // -------------------------------------------------------------------------
    console.log('--- TEST 8: Incorrect Current Password ---');
    const wrongCurrentRes = await makeRequest('/api/auth/change-password', {
      method: 'PUT',
      token: testerToken,
      body: {
        currentPassword: 'wrongpassword',
        newPassword: 'anothernewpassword1',
        confirmPassword: 'anothernewpassword1'
      }
    });
    assert(wrongCurrentRes.status === 400, 'Incorrect current password returns 400');
    assert(wrongCurrentRes.data.message.includes('Current password is incorrect'), 'Error message is clear and safe');
    console.log('');

    // -------------------------------------------------------------------------
    // TEST 9: Password Mismatch & Length Requirements
    // -------------------------------------------------------------------------
    console.log('--- TEST 9: Password Mismatch & Validation ---');
    const mismatchRes = await makeRequest('/api/auth/change-password', {
      method: 'PUT',
      token: testerToken,
      body: {
        currentPassword: 'newsecurepassword99',
        newPassword: 'passwordAlpha1',
        confirmPassword: 'passwordBeta2'
      }
    });
    assert(mismatchRes.status === 400, 'Mismatched passwords rejected with 400');
    assert(mismatchRes.data.message.includes('match'), 'Error message mentions match');

    const shortPwRes = await makeRequest('/api/auth/change-password', {
      method: 'PUT',
      token: testerToken,
      body: {
        currentPassword: 'newsecurepassword99',
        newPassword: 'short',
        confirmPassword: 'short'
      }
    });
    assert(shortPwRes.status === 400, 'Too short password (< 8 chars) rejected with 400');
    console.log('');

    // -------------------------------------------------------------------------
    // TEST 10: Password Hashing & Exposure Prevention
    // -------------------------------------------------------------------------
    console.log('--- TEST 10: Password Hashing & Exposure Prevention ---');
    const authMeRes = await makeRequest('/api/auth/me', { token: testerToken });
    assert(authMeRes.data.user.password_hash === undefined, 'password_hash is undefined in /auth/me');
    assert(authMeRes.data.user.password === undefined, 'plaintext password is not in /auth/me');

    const profileRes = await makeRequest('/api/auth/profile', {
      method: 'PUT',
      token: testerToken,
      body: { name: 'Tester Security Check' }
    });
    assert(profileRes.data.user.password_hash === undefined, 'password_hash is undefined in /auth/profile response');
    assert(profileRes.data.user.password === undefined, 'plaintext password is not in /auth/profile response');
    console.log('');

    // -------------------------------------------------------------------------
    // TEST 11: STAFF Profile Access
    // -------------------------------------------------------------------------
    console.log('--- TEST 11: STAFF Profile Access ---');
    const staffProfileRes = await makeRequest('/api/auth/me', { token: staffToken });
    assert(staffProfileRes.status === 200, 'STAFF can view profile (200)');
    assert(staffProfileRes.data.user.role === 'STAFF', 'Role is STAFF');

    const staffUpdateRes = await makeRequest('/api/auth/profile', {
      method: 'PUT',
      token: staffToken,
      body: { name: 'Taylor Brooks-Updated' }
    });
    assert(staffUpdateRes.status === 200, 'STAFF can update their own name');
    assert(staffUpdateRes.data.user.name === 'Taylor Brooks-Updated', 'Updated name returned for STAFF');
    assert(staffUpdateRes.data.user.role === 'STAFF', 'STAFF role is unchanged');
    console.log('');

    // -------------------------------------------------------------------------
    // TEST 12: MANAGER Profile Access
    // -------------------------------------------------------------------------
    console.log('--- TEST 12: MANAGER Profile Access ---');
    const mgrProfileRes = await makeRequest('/api/auth/me', { token: managerToken });
    assert(mgrProfileRes.status === 200, 'MANAGER can view profile (200)');
    assert(mgrProfileRes.data.user.role === 'MANAGER', 'Role is MANAGER');
    console.log('');

    // -------------------------------------------------------------------------
    // TEST 13: User Cannot Update Another User's Profile
    // -------------------------------------------------------------------------
    console.log('--- TEST 13: User Cannot Update Another User\'s Profile ---');
    // Staff sends a request attempting to hijack Manager's profile via body
    const hijackRes = await makeRequest('/api/auth/profile', {
      method: 'PUT',
      token: staffToken,
      body: {
        userId: MANAGER_USER.id,
        id: MANAGER_USER.id,
        name: 'Hijacked Manager',
        role: 'MANAGER'
      }
    });
    assert(hijackRes.status === 200, 'Request processed for authenticated user only');
    assert(hijackRes.data.user.id === STAFF_USER.id, 'Response user is STAFF user, not MANAGER');
    assert(hijackRes.data.user.role === 'STAFF', 'Role tampering was prevented');

    // Confirm Manager profile was NOT altered
    const verifyMgrRes = await makeRequest('/api/auth/me', { token: managerToken });
    assert(verifyMgrRes.data.user.name !== 'Hijacked Manager', 'Manager name remained unchanged');
    console.log('');

    // -------------------------------------------------------------------------
    // TEST 14: User Cannot Update Another User's Preferences
    // -------------------------------------------------------------------------
    console.log('--- TEST 14: User Cannot Update Another User\'s Preferences ---');
    // Staff sends preference update specifying Manager's userId in body
    await makeRequest('/api/settings/preferences', {
      method: 'PUT',
      token: staffToken,
      body: {
        userId: MANAGER_USER.id,
        user_id: MANAGER_USER.id,
        out_of_stock_enabled: false
      }
    });

    // Verify Manager's out_of_stock_enabled remains TRUE
    const mgrPrefs = await makeRequest('/api/settings/preferences', { token: managerToken });
    assert(mgrPrefs.data.preferences.out_of_stock_enabled === true, 'Manager preferences untouched by staff request');
    console.log('');

    // -------------------------------------------------------------------------
    // TEST 15: Notification Preference Behavior (Suppression of future alerts)
    // -------------------------------------------------------------------------
    console.log('--- TEST 15: Notification Preference Behavior ---');
    // Staff user sets critical_stock_enabled = false
    await makeRequest('/api/settings/preferences', {
      method: 'PUT',
      token: staffToken,
      body: { critical_stock_enabled: false }
    });

    // Attempt to create a CRITICAL_STOCK notification for Staff
    const suppressedNotif = await createNotification({
      userId: STAFF_USER.id,
      productId: 'b0000000-0000-0000-0000-000000000004',
      type: 'CRITICAL_STOCK',
      title: 'Critical Stock Alert',
      message: 'Sugar stock is critical.'
    });
    assert(suppressedNotif === null, 'CRITICAL_STOCK notification suppressed when preference is false');

    // Low stock notification should still succeed since low_stock_enabled is true
    const allowedNotif = await createNotification({
      userId: STAFF_USER.id,
      productId: 'b0000000-0000-0000-0000-000000000002',
      type: 'LOW_STOCK',
      title: 'Low Stock Alert',
      message: 'Bread stock is low.'
    });
    assert(allowedNotif !== null, 'LOW_STOCK notification created when preference is true');
    assert(allowedNotif.type === 'LOW_STOCK', 'Notification type matches LOW_STOCK');

    // Existing notifications must remain intact
    const staffNotifsRes = await makeRequest('/api/notifications', { token: staffToken });
    assert(staffNotifsRes.status === 200, 'GET /api/notifications returns 200');
    assert(staffNotifsRes.data.data.length > 0, 'Existing notifications remain preserved');
    console.log('');

    // -------------------------------------------------------------------------
    // TEST 16: Logout Behavior
    // -------------------------------------------------------------------------
    console.log('--- TEST 16: Logout Behavior ---');
    const logoutRes = await makeRequest('/api/auth/logout', { method: 'POST' });
    assert(logoutRes.status === 200, 'POST /api/auth/logout returns 200');
    assert(logoutRes.data.success === true, 'Logout indicates success');
    console.log('');

    console.log('====================================================');
    console.log('ALL PHASE 16 TESTS PASSED SUCCESSFULLY! (16/16)');
    console.log('====================================================\n');
    process.exit(0);
  } finally {
    // Reset stores after tests
    _resetInMemoryUsers();
    _resetInMemoryPreferences();
    _resetInMemoryNotifications();
    if (server) {
      server.close();
    }
  }
}

runTests().catch((err) => {
  console.error('[FATAL ERROR IN PHASE 16 TESTS]:', err);
  process.exit(1);
});
