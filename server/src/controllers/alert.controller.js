import * as alertService from '../services/alert.service.js';

/**
 * Controller to fetch all alerts with optional filtering.
 * GET /api/alerts
 */
export async function getAlerts(req, res, next) {
  try {
    const filters = {
      severity: req.query.severity,
      status: req.query.status,
      source: req.query.source,
      productId: req.query.productId,
      search: req.query.search
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
