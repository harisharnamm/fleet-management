import { Router } from 'express';
import {
  listUsersController,
  getUserController,
  updateUserRoleController,
  deleteUserController
} from './users.controller.js';
import { authenticateJWT } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/rbac.js';

const router = Router();

// Protect all user management routes with JWT and admin role check
router.use(authenticateJWT);
router.use(authorizeRoles('admin'));

router.get('/', listUsersController);
router.get('/:id', getUserController);
router.patch('/:id/role', updateUserRoleController);
router.delete('/:id', deleteUserController);

export default router;
