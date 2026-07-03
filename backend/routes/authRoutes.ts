import { Router } from 'express';
import { authController } from '../controllers/authController';
import { registerValidator, loginValidator } from '../validators/authValidator';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);

export default router;
