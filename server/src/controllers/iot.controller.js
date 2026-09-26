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
 */
export async function simulateTelemetry(req, res, next) {
  try {
    const { deviceId, calculatedUnits, rawReading, batteryLevel } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'deviceId is required.'
      });
    }

    if (calculatedUnits === undefined || calculatedUnits === null || isNaN(Number(calculatedUnits))) {
      return res.status(400).json({
        success: false,
        message: 'calculatedUnits must be a valid number.'
      });
    }

    const result = await iotService.simulateTelemetry({
      deviceId,
      calculatedUnits: Number(calculatedUnits),
      rawReading: rawReading ? Number(rawReading) : undefined,
      batteryLevel: batteryLevel ? Number(batteryLevel) : undefined
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
