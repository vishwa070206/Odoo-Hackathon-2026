import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../dto';

const router = Router();
const controller = new AuthController();

router.post('/signup', validate(signupSchema), controller.signup);
router.post('/login', validate(loginSchema), controller.login);
router.post('/refresh', controller.refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);
router.get('/verify-email', controller.verifyEmail);
router.get('/me', authMiddleware, controller.getMe);
router.post('/logout', authMiddleware, controller.logout);

export default router;
