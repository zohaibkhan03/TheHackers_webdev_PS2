// ─── src/modules/auth/auth.service.ts ────────────────────────────────────────

import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import {
  signAccessToken,
  signRefreshToken,
  AuthPayload,
} from '../../middleware/auth';
import {
  AuthError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../middleware/error';
import type { RegisterInput, LoginInput, ChangePasswordInput } from './auth.schemas';

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536,   // 64 MB
  timeCost: 3,
  parallelism: 2,
};

/** Maximum failed login attempts before account lock */
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

// ─── Helpers ────────────────────────────────────────────────────────────────

function safeUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
  communities?: { communityId: string; isModerator: boolean; community: { id: string; name: string; slug: string } }[];
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAt: user.createdAt,
    communities: user.communities?.map(m => ({
      communityId: m.communityId,
      name: m.community.name,
      slug: m.community.slug,
      isModerator: m.isModerator,
    })),
  };
}

// ─── Service functions ───────────────────────────────────────────────────────

export async function register(data: RegisterInput) {
  // Check email uniqueness
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new ConflictError('An account with this email already exists');

  // Verify community exists
  const community = await prisma.community.findUnique({ where: { id: data.communityId } });
  if (!community) throw new ValidationError('Community not found');

  const passwordHash = await argon2.hash(data.password, ARGON2_OPTIONS);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        notificationPrefs: {
          create: {}, // Default preferences
        },
      },
    });

    // Auto-join the selected community
    await tx.communityMember.create({
      data: { userId: newUser.id, communityId: data.communityId },
    });

    return newUser;
  });

  return { userId: user.id };
}

export async function login(
  data: LoginInput,
  userAgent?: string,
  ipAddress?: string,
) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      communities: { include: { community: { select: { id: true, name: true, slug: true } } } },
    },
  });

  if (!user) throw new AuthError('Invalid email or password');
  if (!user.isActive) throw new AuthError('This account has been disabled');

  // Check account lock
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    throw new AuthError(`Account locked. Try again in ${minutesLeft} minutes.`);
  }

  const passwordValid = await argon2.verify(user.passwordHash, data.password);

  if (!passwordValid) {
    const attempts = user.loginAttempts + 1;
    const shouldLock = attempts >= MAX_LOGIN_ATTEMPTS;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: attempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60_000)
          : null,
      },
    });
    if (shouldLock) throw new AuthError(`Too many failed attempts. Account locked for ${LOCK_DURATION_MINUTES} minutes.`);
    throw new AuthError('Invalid email or password');
  }

  // Reset failed attempts on success
  await prisma.user.update({
    where: { id: user.id },
    data: { loginAttempts: 0, lockedUntil: null },
  });

  const accessToken = signAccessToken(user.id, user.role);
  const refreshTokenValue = signRefreshToken(user.id);

  // Persist refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshTokenValue,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent,
      ipAddress,
    },
  });

  return { accessToken, refreshToken: refreshTokenValue, user: safeUser(user) };
}

export async function refreshTokens(refreshTokenValue: string) {
  let payload: { sub: string };
  try {
    payload = jwt.verify(refreshTokenValue, env.JWT_REFRESH_SECRET) as { sub: string };
  } catch {
    throw new AuthError('Invalid or expired refresh token');
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenValue },
    include: { user: { select: { id: true, role: true, isActive: true } } },
  });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    // Token reuse detected — revoke all tokens for this user
    if (payload.sub) {
      await prisma.refreshToken.updateMany({
        where: { userId: payload.sub, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    throw new AuthError('Refresh token invalid or reused. Please log in again.');
  }

  if (!stored.user.isActive) throw new AuthError('Account disabled');

  // Rotate: revoke old token, issue new ones
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const newAccessToken = signAccessToken(stored.user.id, stored.user.role);
  const newRefreshToken = signRefreshToken(stored.user.id);

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: stored.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshTokenValue: string) {
  await prisma.refreshToken.updateMany({
    where: { token: refreshTokenValue, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      communities: { include: { community: { select: { id: true, name: true, slug: true } } } },
      notificationPrefs: true,
    },
  });
  if (!user) throw new NotFoundError('User');
  return safeUser(user);
}

export async function changePassword(userId: string, data: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User');

  const valid = await argon2.verify(user.passwordHash, data.currentPassword);
  if (!valid) throw new ValidationError('Current password is incorrect');

  const newHash = await argon2.hash(data.newPassword, ARGON2_OPTIONS);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });

  // Revoke all existing refresh tokens to force re-login on all devices
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always return success to prevent email enumeration
  if (!user) return;

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: token, passwordResetExpires: expires },
  });

  // TODO: Send email — placeholder
  console.log(`[DEV] Password reset token for ${email}: ${token}`);
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { gt: new Date() },
    },
  });

  if (!user) throw new ValidationError('Invalid or expired reset token');

  const hash = await argon2.hash(newPassword, ARGON2_OPTIONS);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hash,
      passwordResetToken: null,
      passwordResetExpires: null,
      loginAttempts: 0,
      lockedUntil: null,
    },
  });

  // Revoke all sessions
  await prisma.refreshToken.updateMany({
    where: { userId: user.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
