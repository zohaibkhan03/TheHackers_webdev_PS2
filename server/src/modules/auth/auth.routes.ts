// ─── src/modules/auth/auth.routes.ts ──────────────────────────────────────────

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as AuthController from './auth.controller';
import { requireAuth } from '../../middleware/auth';
import { env } from '../../config/env';

const router = Router();

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.RATE_LIMIT_MAX_AUTH,
  message: { success: false, code: 'RATE_LIMITED', message: 'Too many login attempts. Please try again later.' },
});

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.post('/request-reset', authLimiter, AuthController.requestPasswordReset);
router.post('/reset-password', authLimiter, AuthController.resetPassword);

// Protected routes
router.get('/me', requireAuth, AuthController.me);
router.post('/change-password', requireAuth, AuthController.changePassword);

export default router;
