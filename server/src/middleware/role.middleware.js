/**
 * Middleware factory for role-based access control.
 * 
 * @param  {...string} allowedRoles - List of permitted roles (e.g., 'MANAGER', 'STAFF')
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: Insufficient permissions'
      });
    }

    next();
  };
};
