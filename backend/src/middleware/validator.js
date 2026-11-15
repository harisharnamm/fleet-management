import { errorResponse } from '../utils/response.js';

/**
 * Zod Request Validation Middleware Factory
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
export function validateRequest(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return errorResponse(res, 'Request validation failed', 400, 'VALIDATION_ERROR', details);
      }
      return errorResponse(res, 'Invalid request payload', 400, 'VALIDATION_ERROR');
    }
  };
}
