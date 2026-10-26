import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  changePassword,
} from '../controllers/authController.js';
import {
  registerValidator,
  loginValidator,
  changePasswordValidator,
} from '../validators/authValidators.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, registerValidator, register);
router.post('/login', authLimiter, loginValidator, login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.patch('/change-password', requireAuth, changePasswordValidator, changePassword);

export default router;
