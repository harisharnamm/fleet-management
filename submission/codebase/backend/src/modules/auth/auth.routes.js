import { Router } from 'express';
import { loginController, registerController, meController } from './auth.controller.js';
import { validateRequest } from '../../middleware/validator.js';
import { loginSchema, registerSchema } from './auth.schema.js';
import { authenticateJWT } from '../../middleware/auth.js';

const router = Router();

// Public auth endpoints
router.post('/login', validateRequest(loginSchema), loginController);
router.post('/register', validateRequest(registerSchema), registerController);

// Protected profile endpoint
router.get('/me', authenticateJWT, meController);

export default router;
