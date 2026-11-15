/**
 * API Key Verification Middleware for Gateway
 * Checks for x-api-key header or api-key header or query parameter
 */
export function apiKeyMiddleware(req, res, next) {
  // Allow health check and preflight CORS requests without API key
  if (req.path === '/health' || req.method === 'OPTIONS') {
    return next();
  }

  const configuredKey = process.env.API_KEY || 'dev-secret-key-12345';
  const providedKey = req.headers['x-api-key'] || req.headers['api-key'] || req.query.api_key;

  if (!providedKey || providedKey !== configuredKey) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Unauthorized: Invalid or missing API key. Provide a valid x-api-key header.',
        code: 'GATEWAY_UNAUTHORIZED'
      }
    });
  }

  next();
}
