// ─── src/modules/auth/auth.controller.ts ─────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import * as AuthService from './auth.service';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  requestResetSchema,
  resetPasswordSchema,
} from './auth.schemas';
import {
  accessCookieOptions,
  refreshCookieOptions,
} from '../../middleware/auth';
import { ValidationError } from '../../middleware/error';

function ok(res: Response, data: unknown, status = 200) {
  return res.status(status).json({ success: true, data });
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);
    const result = await AuthService.register(input);
    return ok(res, result, 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const { accessToken, refreshToken, user } = await AuthService.login(
      input,
      req.headers['user-agent'],
      req.ip,
    );

    res.cookie('access_token', accessToken, accessCookieOptions());
    res.cookie('refresh_token', refreshToken, refreshCookieOptions());

    return ok(res, { user, accessToken });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refresh_token ?? req.body?.refreshToken;
    if (!token) throw new ValidationError('Refresh token required');

    const { accessToken, refreshToken } = await AuthService.refreshTokens(token);

    res.cookie('access_token', accessToken, accessCookieOptions());
    res.cookie('refresh_token', refreshToken, refreshCookieOptions());

    return ok(res, { accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refresh_token ?? req.body?.refreshToken;
    if (token) await AuthService.logout(token);

    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/api/auth/refresh' });

    return ok(res, { message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await AuthService.getMe(req.user!.sub);
    return ok(res, user);
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const input = changePasswordSchema.parse(req.body);
    await AuthService.changePassword(req.user!.sub, input);
    // Clear sessions — user must re-login
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
    return ok(res, { message: 'Password changed. Please log in again.' });
  } catch (err) {
    next(err);
  }
}

export async function requestPasswordReset(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = requestResetSchema.parse(req.body);
    await AuthService.requestPasswordReset(email);
    // Always return 200 to prevent email enumeration
    return ok(res, { message: 'If this email is registered, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    await AuthService.resetPassword(token, newPassword);
    return ok(res, { message: 'Password reset successfully. Please log in.' });
  } catch (err) {
    next(err);
  }
}
