import * as authService from '../services/auth.service.js';

/**
 * Handle user registration.
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await authService.register({ name, email, password, role });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user login.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login({ email, password });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile.
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.userId);

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User logout.
 */
export const logout = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * Manager test endpoint (RBAC demonstration).
 */
export const managerTest = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Manager access granted'
  });
};

/**
 * Staff test endpoint (RBAC demonstration).
 */
export const staffTest = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Staff access granted'
  });
};
