/**
 * SmartStock Security Headers Middleware
 * 
 * Provides HTTP security hardening equivalent to Helmet:
 * - Content-Type sniffing prevention (X-Content-Type-Options: nosniff)
 * - Clickjacking prevention (X-Frame-Options: DENY)
 * - Cross-Site Scripting protection header (X-XSS-Protection: 0)
 * - Strict Transport Security (HSTS)
 * - Cross-Origin Resource Policy (CORP: cross-origin)
 * - Cross-Origin Opener Policy (COOP: same-origin)
 * - Referrer-Policy: strict-origin-when-cross-origin
 * - Removes X-Powered-By fingerprint header
 */

export const securityHeaders = (req, res, next) => {
  // Prevent browsers from MIME-sniffing a response away from declared content-type
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Disallow embedding this API in iframes to prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Disable buggy legacy XSS filter in older browsers (React provides modern context-aware escaping)
  res.setHeader('X-XSS-Protection', '0');

  // Enforce HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Referrer header privacy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Cross-Origin Resource Policy: permits authorized frontends to read responses
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

  // Cross-Origin Opener Policy
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

  // Prevent DNS prefetching for privacy
  res.setHeader('X-DNS-Prefetch-Control', 'off');

  // IE-specific download restriction
  res.setHeader('X-Download-Options', 'noopen');

  // Restrict Flash and PDF cross-domain access
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  // Remove framework fingerprinting
  res.removeHeader('X-Powered-By');

  next();
};

export default securityHeaders;
