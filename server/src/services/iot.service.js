import crypto from 'crypto';
import supabase from '../config/db.js';
import { getProductById, updateProductStock } from './product.service.js';
import { evaluateStockAlert } from './alert.service.js';

let inMemoryDevices = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    device_code: 'SIM-IOT-SCALE-01',
    device_name: 'Smart Shelf Load Cell #1',
    device_type: 'WEIGHT_SENSOR',
    location: 'Aisle 1 - Dairy Fridge',
    product_id: 'b0000000-0000-0000-0000-000000000001', // Milk
    status: 'ACTIVE',
    unit_weight_grams: 1000.00,
    battery_level: 98,
    last_ping_at: new Date(Date.now() - 2 * 60000).toISOString()
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    device_code: 'SIM-IOT-OPTIC-02',
    device_name: 'Beverage Chute Optical Counter',
    device_type: 'OPTICAL_LEVEL',
    location: 'Aisle 4 - Beverage Cooler',
    product_id: 'b0000000-0000-0000-0000-000000000005', // Coca Cola
    status: 'ACTIVE',
    unit_weight_grams: 350.00,
    battery_level: 91,
    last_ping_at: new Date(Date.now() - 5 * 60000).toISOString()
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    device_code: 'SIM-IOT-RFID-03',
    device_name: 'Dry Staples Smart Rack RFID',
    device_type: 'RFID_SCANNER',
    location: 'Aisle 2 - Dry Goods Shelf B',
    product_id: 'b0000000-0000-0000-0000-000000000004', // Sugar
    status: 'ACTIVE',
    unit_weight_grams: 1000.00,
    battery_level: 89,
    last_ping_at: new Date(Date.now() - 1 * 60000).toISOString()
  }
];

let inMemoryReadings = [
  {
    id: 'r0000000-0000-0000-0000-000000000001',
    device_id: 'c0000000-0000-0000-0000-000000000001',
    product_id: 'b0000000-0000-0000-0000-000000000001',
    raw_reading: 45000.00,
    calculated_units: 45,
    simulated_delta: -2,
    battery_level: 98,
    recorded_at: new Date(Date.now() - 2 * 60000).toISOString()
  }
];

/**
 * Enriches a device with live product catalog information.
 */
async function enrichDevice(device) {
  let product = null;
  if (device.product_id) {
    try {
      product = await getProductById(device.product_id);
    } catch {
      // product lookup fallback
    }
  }

  return {
    id: device.id,
    deviceCode: device.device_code,
    deviceName: device.device_name,
    deviceType: device.device_type,
    location: device.location,
    productId: device.product_id,
    productName: product?.name || 'Unassigned',
    sku: product?.sku || 'N/A',
    unit: product?.unit || 'units',
    currentStock: product?.currentStock ?? 0,
    minimumStock: product?.minimumStock ?? 0,
    stockStatus: product?.stockStatus || 'NORMAL',
    status: device.status || 'ACTIVE',
    unitWeightGrams: device.unit_weight_grams,
    batteryLevel: device.battery_level ?? 95,
    lastPingAt: device.last_ping_at
  };
}

/**
 * Retrieves all registered simulated IoT devices.
 */
export async function getDevices() {
  let devices = [...inMemoryDevices];

  if (supabase) {
    try {
      const { data, error } = await supabase.from('simulated_devices').select('*');
      if (!error && data && data.length > 0) {
        devices = data;
      }
    } catch (err) {
      console.warn('[IOT SERVICE] Supabase getDevices error:', err.message);
    }
  }

  return Promise.all(devices.map(enrichDevice));
}

/**
 * Sends a simulated sensor telemetry reading from an IoT device.
 * Updates stock, creates inventory_history with source = 'IOT',
 * and triggers evaluateStockAlert with source = 'IOT'.
 */
export async function simulateTelemetry({ deviceId, calculatedUnits, rawReading, batteryLevel }) {
  const device = inMemoryDevices.find((d) => d.id === deviceId);
  if (!device) {
    const error = new Error('Device not found.');
    error.status = 404;
    throw error;
  }

  if (!device.product_id) {
    const error = new Error('Device is not assigned to any product.');
    error.status = 400;
    throw error;
  }

  const product = await getProductById(device.product_id);
  if (!product) {
    const error = new Error('Associated product not found.');
    error.status = 404;
    throw error;
  }

  const parsedUnits = Math.max(0, parseInt(calculatedUnits, 10));
  if (isNaN(parsedUnits)) {
    const error = new Error('Calculated units must be a valid non-negative integer.');
    error.status = 400;
    throw error;
  }

  const previousStock = product.currentStock;
  const delta = parsedUnits - previousStock;
  const now = new Date().toISOString();

  // 1. Record sensor reading
  const readingRecord = {
    id: crypto.randomUUID(),
    device_id: device.id,
    product_id: product.id,
    raw_reading: rawReading || (parsedUnits * (device.unit_weight_grams || 1000)),
    calculated_units: parsedUnits,
    simulated_delta: delta,
    battery_level: batteryLevel ?? device.battery_level ?? 95,
    recorded_at: now
  };
  inMemoryReadings.unshift(readingRecord);

  // 2. Update device ping
  device.last_ping_at = now;
  if (batteryLevel !== undefined) {
    device.battery_level = batteryLevel;
  }

  // 3. Atomically update product stock
  const updatedProduct = await updateProductStock(product.id, parsedUnits);

  // 4. Trigger Automatic Alert Engine with source = 'IOT'
  let alertResult = null;
  try {
    alertResult = await evaluateStockAlert(product.id, 'IOT');
  } catch (alertErr) {
    console.warn('[IOT ALERT] Error evaluating stock alert:', alertErr.message);
  }

  return {
    success: true,
    device: await enrichDevice(device),
    product: updatedProduct,
    reading: readingRecord,
    previousStock,
    newStock: parsedUnits,
    alertResult
  };
}

export default {
  getDevices,
  simulateTelemetry
};
