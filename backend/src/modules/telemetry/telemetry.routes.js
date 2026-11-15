import { Router } from 'express';
import {
  submitTelemetryController,
  getVehicleTelemetryController,
  getLatestTelemetryController
} from './telemetry.controller.js';
import { authenticateJWT } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/rbac.js';
import { validateRequest } from '../../middleware/validator.js';
import { telemetrySubmissionSchema } from './telemetry.schema.js';

const router = Router();

router.use(authenticateJWT);

router.post(
  '/',
  authorizeRoles('admin', 'fleet_manager'),
  validateRequest(telemetrySubmissionSchema),
  submitTelemetryController
);

router.get('/latest', getLatestTelemetryController);
router.get('/vehicle/:vehicleId', getVehicleTelemetryController);

export default router;
