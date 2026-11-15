import { Router } from 'express';
import {
  listVehiclesController,
  getVehicleController,
  createVehicleController,
  updateVehicleController,
  deleteVehicleController
} from './vehicles.controller.js';
import { authenticateJWT } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/rbac.js';
import { validateRequest } from '../../middleware/validator.js';
import { createVehicleSchema, updateVehicleSchema } from './vehicles.schema.js';

const router = Router();

// All vehicle endpoints require valid JWT authentication
router.use(authenticateJWT);

// Read-only access: admin, fleet_manager, viewer
router.get('/', listVehiclesController);
router.get('/:id', getVehicleController);

// Write access: admin and fleet_manager
router.post(
  '/',
  authorizeRoles('admin', 'fleet_manager'),
  validateRequest(createVehicleSchema),
  createVehicleController
);

router.patch(
  '/:id',
  authorizeRoles('admin', 'fleet_manager'),
  validateRequest(updateVehicleSchema),
  updateVehicleController
);

// Delete access: Strictly restricted to 'admin'
router.delete(
  '/:id',
  authorizeRoles('admin'),
  deleteVehicleController
);

export default router;
