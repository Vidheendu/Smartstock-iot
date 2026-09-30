import * as iotService from '../services/iot.service.js';

/**
 * Controller to fetch all registered simulated IoT devices.
 * GET /api/iot/devices
 */
export async function getDevices(req, res, next) {
  try {
    const devices = await iotService.getDevices();
    res.status(200).json({
      success: true,
      data: devices
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to trigger software-simulated sensor telemetry reading.
 * POST /api/iot/simulate
 * POST /api/iot/devices/:id/simulate
 */
export async function simulateTelemetry(req, res, next) {
  try {
    const deviceId = req.body.deviceId || req.body.device_id || req.params.id;
    const rawCalculatedUnits = req.body.calculatedUnits ?? req.body.calculated_units ?? req.body.calculatedQuantity ?? req.body.calculated_quantity;
    const rawReadingVal = req.body.rawReading ?? req.body.raw_reading ?? req.body.rawValue ?? req.body.raw_value;
    const rawBatteryVal = req.body.batteryLevel ?? req.body.battery_level;

    if (!deviceId || typeof deviceId !== 'string' || deviceId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'deviceId is required.'
      });
    }

    if (rawCalculatedUnits === undefined || rawCalculatedUnits === null || rawCalculatedUnits === '') {
      return res.status(400).json({
        success: false,
        message: 'calculatedUnits must be a valid number.'
      });
    }

    const units = Number(rawCalculatedUnits);
    if (isNaN(units) || !Number.isFinite(units)) {
      return res.status(400).json({
        success: false,
        message: 'calculatedUnits must be a valid number.'
      });
    }

    if (units < 0) {
      return res.status(400).json({
        success: false,
        message: 'Calculated quantity cannot be negative.'
      });
    }

    if (!Number.isInteger(units)) {
      return res.status(400).json({
        success: false,
        message: 'Calculated units must be a whole integer.'
      });
    }

    let parsedRawReading;
    if (rawReadingVal !== undefined && rawReadingVal !== null && rawReadingVal !== '') {
      parsedRawReading = Number(rawReadingVal);
      if (isNaN(parsedRawReading) || !Number.isFinite(parsedRawReading)) {
        return res.status(400).json({
          success: false,
          message: 'Raw reading must be a valid number.'
        });
      }
      if (parsedRawReading < 0) {
        return res.status(400).json({
          success: false,
          message: 'Raw reading cannot be negative.'
        });
      }
    }

    let parsedBattery;
    if (rawBatteryVal !== undefined && rawBatteryVal !== null && rawBatteryVal !== '') {
      parsedBattery = Number(rawBatteryVal);
      if (isNaN(parsedBattery) || !Number.isFinite(parsedBattery)) {
        return res.status(400).json({
          success: false,
          message: 'Battery level must be a valid number.'
        });
      }
      if (parsedBattery < 0 || parsedBattery > 100) {
        return res.status(400).json({
          success: false,
          message: 'Battery level must be between 0 and 100.'
        });
      }
    }

    const result = await iotService.simulateTelemetry({
      deviceId: deviceId.trim(),
      calculatedUnits: units,
      rawReading: parsedRawReading,
      batteryLevel: parsedBattery
    });

    res.status(200).json(result);
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.status === 400) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
}

export default {
  getDevices,
  simulateTelemetry
};
