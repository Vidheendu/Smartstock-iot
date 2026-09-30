import * as settingsService from '../services/settings.service.js';

/**
 * Get notification preferences for the currently authenticated user.
 */
export const getPreferences = async (req, res, next) => {
  try {
    const preferences = await settingsService.getUserPreferences(req.user.userId);

    return res.status(200).json({
      success: true,
      preferences
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update notification preferences for the currently authenticated user.
 */
export const updatePreferences = async (req, res, next) => {
  try {
    const preferences = await settingsService.updateUserPreferences(
      req.user.userId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getPreferences,
  updatePreferences
};
