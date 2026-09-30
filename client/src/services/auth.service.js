import api from '../api/axios.js';

/**
 * Register a new user.
 * 
 * @param {object} userData - { name, email, password, role }
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Log in a user with email and password.
 * 
 * @param {object} credentials - { email, password }
 */
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

/**
 * Fetch currently authenticated user profile.
 */
export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Log out user on server.
 */
export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

/**
 * Update current user profile.
 * 
 * @param {object} profileData - { name }
 */
export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

/**
 * Change current user password.
 * 
 * @param {object} passwordData - { currentPassword, newPassword, confirmPassword }
 */
export const changePassword = async (passwordData) => {
  const response = await api.put('/auth/change-password', passwordData);
  return response.data;
};

/**
 * Test endpoint for MANAGER role access.
 */
export const testManagerAccess = async () => {
  const response = await api.get('/auth/manager-test');
  return response.data;
};

/**
 * Test endpoint for STAFF / MANAGER role access.
 */
export const testStaffAccess = async () => {
  const response = await api.get('/auth/staff-test');
  return response.data;
};
