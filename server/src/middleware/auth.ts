// ─── src/middleware/auth.ts ───────────────────────────────────────────────────
// JWT verification + role enforcement middleware.

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { AuthError, ForbiddenError } from './error';

export type Role = 'USER' | 'MODERATOR' | 'ADMIN';

export interface AuthPayload {
  sub: string;   // userId
  role: Role;
  iat: number;
  exp: number;
}

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/** Verifies the access token from the Authorization header or cookie */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    // 2. Fall back to http-only cookie
    if (!token && req.cookies?.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) throw new AuthError('No authentication token provided');

    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;

    // Check user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) throw new AuthError('Account not found or disabled');

    req.user = { ...payload, role: user.role as Role };
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
      return next(new AuthError('Invalid or expired token'));
    }
    next(err);
  }
}

/** Optional auth — attaches user if token is present but doesn't reject */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) token = authHeader.slice(7);
    if (!token && req.cookies?.access_token) token = req.cookies.access_token;
    if (!token) return next();

    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, isActive: true },
    });
    if (user?.isActive) req.user = { ...payload, role: user.role as Role };
    next();
  } catch {
    // Silently ignore invalid tokens for optional auth
    next();
  }
}

/** Role enforcement factory */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AuthError());
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError(`Requires role: ${roles.join(' or ')}`));
    }
    next();
  };
}

/** Check if the current user is a moderator of a specific community */
export async function requireCommunityModerator(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) return next(new AuthError());

    // Super admins bypass community-level checks
    if (req.user.role === 'ADMIN') return next();

    const communityId = req.params.communityId ?? req.body?.communityId;
    if (!communityId) return next(new ForbiddenError('Community ID required'));

    const membership = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId: req.user.sub, communityId } },
    });

    if (!membership?.isModerator) {
      return next(new ForbiddenError('Must be a moderator of this community'));
    }
    next();
  } catch (err) {
    next(err);
  }
}

/** Sign a new access token */
export function signAccessToken(userId: string, role: Role): string {
  return jwt.sign({ sub: userId, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES as string,
  });
}

/** Sign a new refresh token */
export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES as string,
  });
}

/** Cookie options for the access token */
export function accessCookieOptions() {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  };
}

/** Cookie options for the refresh token */
export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth/refresh',
  };
}
