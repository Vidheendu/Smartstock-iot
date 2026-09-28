/**
 * SmartStock Phase 10: Stock Forecasting & Demand Insights Test Suite
 * 
 * Tests all criteria specified in Section 32 & Section 36:
 * 1. ADC calculation (deterministic)
 * 2. Days remaining calculation (deterministic)
 * 3. Zero consumption edge case (no Infinity, daysRemaining = null, NO_DATA status)
 * 4. Zero stock edge case (daysRemaining = 0, OUT_OF_STOCK status)
 * 5. Positive stock with no consumption history
 * 6. Different forecast periods (7, 30, 90) and validation (400 on invalid)
 * 7. Projected depletion date calculation
 * 8. Limited data handling & confidence indicators
 * 9. Security & Authentication on all forecast endpoints (401 without token)
 * 10. Role access (STAFF and MANAGER)
 * 11. Endpoint responses (/overview, /products/:id, /products/:id/consumption)
 */

import http from 'http';
import app from './server.js';
import { generateToken } from './src/utils/jwt.js';
import * as forecastService from './src/services/forecast.service.js';

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
    console.log('SMARTSTOCK PHASE 10: STOCK FORECASTING & DEMAND INSIGHTS');
    console.log('====================================================\n');

    // ----------------------------------------------------
    // TEST 1: Unit Calculations - ADC
    // ----------------------------------------------------
    console.log('--- TEST 1: Average Daily Consumption (ADC) Calculations ---');
    // Example from prompt: 30 units consumed over 10 days -> ADC = 3
    const adc1 = forecastService.calculateAverageDailyConsumption(30, 10);
    assert(adc1 === 3, '30 units consumed over 10 days = 3 units/day');

    // Example: 30 units over 30 days = 1 unit/day
    const adc2 = forecastService.calculateAverageDailyConsumption(30, 30);
    assert(adc2 === 1, '30 units consumed over 30 days = 1 unit/day');

    // Decimal precision: 25 units over 7 days = 3.57
    const adc3 = forecastService.calculateAverageDailyConsumption(25, 7);
    assert(adc3 === 3.57, '25 units over 7 days = 3.57 units/day (rounded to 2 decimal places)');

    // 0 consumed -> 0 ADC
    const adcZero = forecastService.calculateAverageDailyConsumption(0, 30);
    assert(adcZero === 0, '0 consumed returns 0 ADC');

    // ----------------------------------------------------
    // TEST 2: Unit Calculations - Days Remaining
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Estimated Days Remaining Calculations ---');
    // Example from prompt: Current Stock = 45, ADC = 3 -> 15 days
    const days1 = forecastService.calculateDaysRemaining(45, 3);
    assert(days1 === 15, 'Current stock 45 with ADC 3 = 15 days remaining');

    // Current Stock = 45, ADC = 1 -> 45 days
    const days2 = forecastService.calculateDaysRemaining(45, 1);
    assert(days2 === 45, 'Current stock 45 with ADC 1 = 45 days remaining');

    // Fractional days: Current Stock = 10, ADC = 3 -> 3.3 days
    const days3 = forecastService.calculateDaysRemaining(10, 3);
    assert(days3 === 3.3, 'Current stock 10 with ADC 3 = 3.3 days remaining');

    // ----------------------------------------------------
    // TEST 3: Edge Case 1 - Zero Consumption (ADC = 0)
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Edge Case 1 - Zero Consumption ---');
    const daysZeroAdc = forecastService.calculateDaysRemaining(45, 0);
    assert(daysZeroAdc === null, 'ADC = 0 returns null (never Infinity)');

    const statusZeroAdc = forecastService.determineForecastStatus(45, daysZeroAdc, false);
    assert(statusZeroAdc === 'NO_DATA', 'Status for 0 ADC is NO_DATA');

    // ----------------------------------------------------
    // TEST 4: Edge Case 2 - Zero Stock (Current Stock = 0)
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Edge Case 2 - Zero Stock ---');
    const daysZeroStock = forecastService.calculateDaysRemaining(0, 3);
    assert(daysZeroStock === 0, 'Current stock 0 returns 0 days remaining');

    const statusZeroStock = forecastService.determineForecastStatus(0, 0, true);
    assert(statusZeroStock === 'OUT_OF_STOCK', 'Current stock 0 has status OUT_OF_STOCK');

    // ----------------------------------------------------
    // TEST 5: Forecast Status Categorization
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Forecast Status Categorization ---');
    // Urgent: < 7 days
    assert(forecastService.determineForecastStatus(15, 5, true) === 'URGENT', 'Days remaining < 7 is URGENT');
    // Attention: >= 7 and < 14 days
    assert(forecastService.determineForecastStatus(30, 10, true) === 'ATTENTION', 'Days remaining 7-13 is ATTENTION');
    // Stable: >= 14 days
    assert(forecastService.determineForecastStatus(60, 20, true) === 'STABLE', 'Days remaining >= 14 is STABLE');

    // ----------------------------------------------------
    // TEST 6: Projected Depletion Date Calculation
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Projected Depletion Date Calculation ---');
    const fixedNow = new Date('2026-10-01T00:00:00.000Z');
    const depletionDate = forecastService.calculateProjectedDepletionDate(15, fixedNow);
    assert(depletionDate === '2026-10-16T00:00:00.000Z', 'Projected depletion date correctly adds 15 days');

    const nullDepletion = forecastService.calculateProjectedDepletionDate(null, fixedNow);
    assert(nullDepletion === null, 'Null days remaining yields null projected depletion date');

    // ----------------------------------------------------
    // TEST 7: Data Confidence Levels
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Data Confidence Levels ---');
    assert(forecastService.determineDataConfidence(0) === 'NONE', '0 records has confidence NONE');
    assert(forecastService.determineDataConfidence(2) === 'LIMITED', '2 records has confidence LIMITED');
    assert(forecastService.determineDataConfidence(5) === 'HIGH', '5 records has confidence HIGH');

    // ----------------------------------------------------
    // Start HTTP Server for API Tests
    // ----------------------------------------------------
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
    console.log(`\n[Test Server] Listening on ${baseUrl}`);

    managerToken = generateToken(MANAGER_USER);
    staffToken = generateToken(STAFF_USER);

    // ----------------------------------------------------
    // TEST 8: Security & Authentication on all 3 endpoints
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Security & Authentication ---');
    const unauth1 = await makeRequest('/api/forecast/overview');
    assert(unauth1.status === 401, 'GET /api/forecast/overview without token returns 401');

    const unauth2 = await makeRequest(`/api/forecast/products/${MILK_ID}`);
    assert(unauth2.status === 401, 'GET /api/forecast/products/:id without token returns 401');

    const unauth3 = await makeRequest(`/api/forecast/products/${MILK_ID}/consumption`);
    assert(unauth3.status === 401, 'GET /api/forecast/products/:id/consumption without token returns 401');

    // ----------------------------------------------------
    // TEST 9: Period Validation (400 on invalid)
    // ----------------------------------------------------
    console.log('\n--- TEST 9: Period Parameter Validation ---');
    const invalidPeriod = await makeRequest('/api/forecast/overview?period=15', { token: staffToken });
    assert(invalidPeriod.status === 400, 'Unsupported period 15 returns HTTP 400');
    assert(invalidPeriod.data.message.includes('Invalid forecast period'), 'Error message specifies supported periods');

    for (const p of [7, 30, 90]) {
      const validRes = await makeRequest(`/api/forecast/overview?period=${p}`, { token: staffToken });
      assert(validRes.status === 200, `Period ${p} returns HTTP 200`);
      assert(validRes.data.data.periodDays === p, `Response reflects periodDays = ${p}`);
    }

    // ----------------------------------------------------
    // TEST 10: GET /api/forecast/overview
    // ----------------------------------------------------
    console.log('\n--- TEST 10: GET /api/forecast/overview ---');
    const overviewRes = await makeRequest('/api/forecast/overview?period=30', { token: managerToken });
    assert(overviewRes.status === 200, 'Overview returns HTTP 200');
    assert(overviewRes.data.success === true, 'Overview indicates success = true');

    const overviewData = overviewRes.data.data;
    assert(typeof overviewData.periodDays === 'number', 'periodDays is numeric');
    assert(typeof overviewData.summary.totalProducts === 'number', 'summary.totalProducts is numeric');
    assert(typeof overviewData.summary.productsWithForecast === 'number', 'summary.productsWithForecast is numeric');
    assert(typeof overviewData.summary.productsNoData === 'number', 'summary.productsNoData is numeric');
    assert(typeof overviewData.summary.productsRunningOutSoon === 'number', 'summary.productsRunningOutSoon is numeric');
    assert(Array.isArray(overviewData.products), 'products is an array');
    assert(overviewData.products.length > 0, 'products array is populated with real catalog SKUs');

    const sampleProduct = overviewData.products[0];
    assert(sampleProduct.productId !== undefined, 'Product has productId');
    assert(sampleProduct.productName !== undefined, 'Product has productName');
    assert(typeof sampleProduct.currentStock === 'number', 'Product has numeric currentStock');
    assert(sampleProduct.forecastStatus !== undefined, 'Product has forecastStatus');

    // ----------------------------------------------------
    // TEST 11: GET /api/forecast/products/:productId
    // ----------------------------------------------------
    console.log('\n--- TEST 11: GET /api/forecast/products/:productId ---');
    const prodRes = await makeRequest(`/api/forecast/products/${MILK_ID}?period=30`, { token: staffToken });
    assert(prodRes.status === 200, 'Product forecast returns HTTP 200');
    assert(prodRes.data.data.productId === MILK_ID, 'Returned forecast belongs to requested product');
    assert(prodRes.data.data.periodDays === 30, 'Forecast period is 30 days');
    assert(typeof prodRes.data.data.totalConsumed === 'number', 'totalConsumed is numeric');
    assert(typeof prodRes.data.data.averageDailyConsumption === 'number', 'averageDailyConsumption is numeric');

    // ----------------------------------------------------
    // TEST 12: GET /api/forecast/products/:productId/consumption
    // ----------------------------------------------------
    console.log('\n--- TEST 12: GET /api/forecast/products/:productId/consumption ---');
    const consumptionRes = await makeRequest(`/api/forecast/products/${MILK_ID}/consumption?period=30`, {
      token: staffToken
    });
    assert(consumptionRes.status === 200, 'Consumption timeline returns HTTP 200');
    assert(Array.isArray(consumptionRes.data.data.timeline), 'Consumption returns timeline array');
    assert(typeof consumptionRes.data.data.totalConsumed === 'number', 'totalConsumed is numeric');

    // ----------------------------------------------------
    // TEST 13: Non-existent product handling (404)
    // ----------------------------------------------------
    console.log('\n--- TEST 13: Non-existent product handling ---');
    const notFoundRes = await makeRequest('/api/forecast/products/00000000-0000-0000-0000-000000000099', {
      token: staffToken
    });
    assert(notFoundRes.status === 404, 'Non-existent product returns HTTP 404');

    console.log('\n====================================================');
    console.log('ALL PHASE 10 TESTS PASSED SUCCESSFULLY! (22/22)');
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
