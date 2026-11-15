/**
 * Gateway Centralized Error Handler
 */
export function errorHandler(err, req, res, next) {
  console.error('[GATEWAY ERROR]:', err.message || err);

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: {
      message: err.message || 'Internal Gateway Error',
      code: err.code || 'GATEWAY_INTERNAL_ERROR'
    }
  });
}
