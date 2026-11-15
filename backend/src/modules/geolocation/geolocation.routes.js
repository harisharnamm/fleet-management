import { Router } from 'express';
import { findNearbyController, getPositionsController, geocodeAddressController } from './geolocation.controller.js';
import { authenticateJWT } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validator.js';
import { nearbySearchSchema, geocodeAddressSchema } from './geolocation.schema.js';

const router = Router();

router.use(authenticateJWT);

router.get('/nearby', validateRequest(nearbySearchSchema, 'query'), findNearbyController);
router.get('/positions', getPositionsController);
router.get('/geocode', validateRequest(geocodeAddressSchema, 'query'), geocodeAddressController);

export default router;
