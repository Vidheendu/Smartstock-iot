/**
 * SmartStock In-Memory Rate Limiting Middleware
 * 
 * Protects authentication endpoints from brute-force attacks and safeguards
 * API endpoints against denial-of-service / scraping.
 */

// In-memory buckets: key -> { count, resetTime }
const requestBuckets = new Map();

/**
 * Creates a rate limiter middleware.
 * 
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (e.g. 15 * 60 * 1000)
 * @param {number} options.max - Maximum allowed requests within windowMs
 * @param {string} options.message - Error message when rate limit is exceeded
 * @param {string} options.bucketPrefix - Unique prefix to separate buckets (e.g. 'auth:', 'api:')
 */
export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = 'Too many requests from this IP, please try again later.',
  bucketPrefix = 'global:'
} = {}) => {
  return (req, res, next) => {
    // Extract client IP address
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                     req.socket?.remoteAddress ||
                     req.ip ||
                     '127.0.0.1';

    const key = `${bucketPrefix}${clientIp}`;
    const now = Date.now();

    let record = requestBuckets.get(key);

    if (!record || now > record.resetTime) {
      // First request or window expired
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      requestBuckets.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    // Standard rate limit headers
    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', resetSeconds);

    if (record.count > max) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        success: false,
        message
      });
    }

    next();
  };
};

/**
 * Authentication rate limiter:
 * Stricter threshold to protect login, register, and password-change against brute-force attacks.
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // 60 requests per 15 minutes
  message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  bucketPrefix: 'auth:'
});

/**
 * General API rate limiter:
 * Permissive threshold to protect backend from runaway loops and excessive scraping.
 */
export const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes
  message: 'Too many API requests from this IP. Please slow down.',
  bucketPrefix: 'api:'
});

/**
 * Resets rate limit buckets for test isolation.
 */
export const _resetRateLimits = () => {
  requestBuckets.clear();
};

export default {
  createRateLimiter,
  authRateLimiter,
  generalRateLimiter,
  _resetRateLimits
};
