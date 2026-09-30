/**
 * 404 Not Found Middleware
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`
  });
};

/**
 * Centralized Error Handling Middleware
 * Protects sensitive internal details, database error traces, and secrets from leaking.
 */
export const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.statusCode || err.status || 500;

  // Log error details server-side safely without leaking credentials
  if (statusCode >= 500) {
    console.error(`[SERVER ERROR ${statusCode}] ${req.method} ${req.originalUrl}:`, err.message);
  }

  // Determine safe user-facing message
  let safeMessage = err.message || 'Internal Server Error';

  // Check for database error signatures
  const isDatabaseError = err.code?.startsWith?.('23') ||
                          err.code?.startsWith?.('42') ||
                          /postgres|supabase|relation|syntax error|constraint|foreign key/i.test(err.message || '');

  if (statusCode >= 500 && isProduction) {
    safeMessage = 'Internal Server Error. Please try again later.';
  } else if (isDatabaseError && isProduction) {
    safeMessage = 'Unable to complete database operation.';
  }

  res.status(statusCode).json({
    success: false,
    message: safeMessage
  });
};

export default {
  notFoundHandler,
  errorHandler
};

