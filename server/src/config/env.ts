// ─── src/config/env.ts ────────────────────────────────────────────────────────
// Centralised, validated environment configuration.
// All other modules import from here — never from process.env directly.

import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  FRONTEND_URL: z.string().url().default('http://localhost:5175'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),

  COOKIE_SECRET: z.string().min(16),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),

  UPLOAD_DIR: z.string().default('uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(5),
  MAX_FILES_PER_POST: z.coerce.number().default(4),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),
  RATE_LIMIT_MAX_GENERAL: z.coerce.number().default(100),
  RATE_LIMIT_MAX_AUTH: z.coerce.number().default(10),

  // Moderation thresholds — all configurable
  REPORT_THRESHOLD_FLAG: z.coerce.number().default(1),
  REPORT_THRESHOLD_RECONFIRM: z.coerce.number().default(2),
  REPORT_THRESHOLD_REVIEW: z.coerce.number().default(3),
  REPORT_WINDOW_HOURS: z.coerce.number().default(48),

  // Category proposals
  CATEGORY_PROPOSAL_LIMIT_DAYS: z.coerce.number().default(30),
  CATEGORY_PROPOSAL_MAX_PER_WINDOW: z.coerce.number().default(2),
  CATEGORY_MAX_CUSTOM_PER_COMMUNITY: z.coerce.number().default(5),
  CATEGORY_PROPOSAL_REQUIRED_SUPPORT: z.coerce.number().default(3),

  POST_DEFAULT_EXPIRY_DAYS: z.coerce.number().default(30),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌  Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
