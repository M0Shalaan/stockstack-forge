import { Router } from 'express';
import { login, register, getProfile } from '../controllers/authController';
import { validate, authSchemas } from '../middleware/validation';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/register', validate(authSchemas.register), register);
router.post('/login', validate(authSchemas.login), login);
router.get('/profile', auth, getProfile);

export default router;
