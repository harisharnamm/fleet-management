import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { errorResponse } from '../utils/response.js';

/**
 * Authentication Middleware
 * Validates JSON Web Token in Authorization header (Bearer <token>)
 */
export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authentication required: missing or malformed Bearer token.', 401, 'AUTH_TOKEN_MISSING');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded; // { id, email, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Session token has expired. Please log in again.', 401, 'AUTH_TOKEN_EXPIRED');
    }
    return errorResponse(res, 'Invalid authentication token.', 401, 'AUTH_TOKEN_INVALID');
  }
}
