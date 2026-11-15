import { Router } from 'express';
import { listNotificationsController, simulateSmsController } from './notifications.controller.js';
import { authenticateJWT } from '../../middleware/auth.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', listNotificationsController);
router.post('/simulate', simulateSmsController);

export default router;
