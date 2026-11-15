import { authService } from './auth.service.js';
import { successResponse } from '../../utils/response.js';

export async function loginController(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return successResponse(res, result, 200, 'Authentication successful');
  } catch (err) {
    next(err);
  }
}

export async function registerController(req, res, next) {
  try {
    const result = await authService.register(req.body);
    return successResponse(res, result, 201, 'User registered successfully');
  } catch (err) {
    next(err);
  }
}

export async function meController(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    return successResponse(res, { user }, 200, 'Current profile retrieved');
  } catch (err) {
    next(err);
  }
}
