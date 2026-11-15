import rateLimit from 'express-rate-limit';

/**
 * Gateway Rate Limiter Middleware
 * Protects downstream backend services from request flooding
 */
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // default: 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // default: 100 requests
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests from this client. Please retry after some time.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfterSeconds: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10) / 1000)
      }
    });
  }
});
