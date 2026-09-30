import * as alertService from '../services/alert.service.js';

/**
 * Controller to fetch all alerts with optional filtering.
 * GET /api/alerts
 */
export async function getAlerts(req, res, next) {
  try {
    const { severity, status, source, productId, search } = req.query;

    if (severity && severity !== 'ALL' && !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(severity.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid severity filter '${severity}'. Allowed: LOW, MEDIUM, HIGH, CRITICAL`
      });
    }

    if (status && status !== 'ALL' && !['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'].includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status filter '${status}'. Allowed: ACTIVE, ACKNOWLEDGED, RESOLVED`
      });
    }

    if (source && source !== 'ALL' && !['MANUAL', 'IOT', 'SYSTEM', 'RESTOCK'].includes(source.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid source filter '${source}'. Allowed: MANUAL, IOT, SYSTEM, RESTOCK`
      });
    }

    const filters = {
      severity: severity ? severity.toUpperCase() : undefined,
      status: status ? status.toUpperCase() : undefined,
      source: source ? source.toUpperCase() : undefined,
      productId,
      search: search ? String(search).trim().slice(0, 100) : undefined
    };

    const alerts = await alertService.getAlerts(filters);

    res.status(200).json({
      success: true,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to fetch summary metrics for active alerts.
 * GET /api/alerts/summary
 */
export async function getAlertSummary(req, res, next) {
  try {
    const summary = await alertService.getAlertSummary();
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to fetch a single alert by ID.
 * GET /api/alerts/:id
 */
export async function getAlertById(req, res, next) {
  try {
    const { id } = req.params;
    const alert = await alertService.getAlertById(id);

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found.'
      });
    }
    next(error);
  }
}

/**
 * Controller to acknowledge an alert.
 * PATCH /api/alerts/:id/acknowledge
 */
export async function acknowledgeAlert(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?.userId;

    const updatedAlert = await alertService.acknowledgeAlert(id, userId);

    res.status(200).json({
      success: true,
      message: 'Alert acknowledged successfully.',
      data: updatedAlert
    });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found.'
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

/**
 * Controller to manually resolve an alert.
 * PATCH /api/alerts/:id/resolve
 */
export async function resolveAlert(req, res, next) {
  try {
    const { id } = req.params;

    const updatedAlert = await alertService.resolveAlert(id);

    res.status(200).json({
      success: true,
      message: 'Alert resolved successfully.',
      data: updatedAlert
    });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found.'
      });
    }
    next(error);
  }
}

export default {
  getAlerts,
  getAlertSummary,
  getAlertById,
  acknowledgeAlert,
  resolveAlert
};
