import { errorResponse } from '../utils/response.js';

/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces role restrictions at the backend service layer
 * @param  {...string} allowedRoles Allowed roles (e.g. 'admin', 'fleet_manager', 'viewer')
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required before authorization check.', 401, 'AUTH_REQUIRED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Forbidden: role '${req.user.role}' lacks sufficient privileges for this resource. Required: [${allowedRoles.join(', ')}]`,
        403,
        'RBAC_ACCESS_DENIED'
      );
    }

    next();
  };
}
