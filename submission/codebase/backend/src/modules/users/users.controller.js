import { usersService } from './users.service.js';
import { successResponse } from '../../utils/response.js';

export async function listUsersController(req, res, next) {
  try {
    const users = await usersService.listUsers();
    return successResponse(res, users, 200, 'Users retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getUserController(req, res, next) {
  try {
    const user = await usersService.getUserById(req.params.id);
    return successResponse(res, user, 200, 'User details retrieved');
  } catch (err) {
    next(err);
  }
}

export async function updateUserRoleController(req, res, next) {
  try {
    const { role } = req.body;
    const updated = await usersService.updateUserRole(req.params.id, role);
    return successResponse(res, updated, 200, 'User role updated');
  } catch (err) {
    next(err);
  }
}

export async function deleteUserController(req, res, next) {
  try {
    const deleted = await usersService.deleteUser(req.params.id);
    return successResponse(res, deleted, 200, 'User removed successfully');
  } catch (err) {
    next(err);
  }
}
