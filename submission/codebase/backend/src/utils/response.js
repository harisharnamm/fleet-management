/**
 * Standardized API Response Utilities
 */

export function successResponse(res, data = null, statusCode = 200, message = 'Success') {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

export function errorResponse(res, message = 'An error occurred', statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
  const payload = {
    success: false,
    error: {
      message,
      code
    }
  };

  if (details) {
    payload.error.details = details;
  }

  return res.status(statusCode).json(payload);
}
