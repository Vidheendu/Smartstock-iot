import { verifyToken } from '../utils/jwt.js';

/**
 * Middleware to authenticate requests via Bearer JWT.
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token missing'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization format. Format must be: Bearer <token>'
    });
  }

  const token = parts[1];

  try {
    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};
