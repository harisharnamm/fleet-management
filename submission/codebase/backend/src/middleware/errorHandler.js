import { errorResponse } from '../utils/response.js';

/**
 * Backend Centralized Error Handler Middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('[BACKEND ERROR]:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  return errorResponse(res, message, statusCode, code, err.details || null);
}
