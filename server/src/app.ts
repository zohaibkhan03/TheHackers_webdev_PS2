// ─── src/app.ts ────────────────────────────────────────────────────────────────

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { errorHandler, NotFoundError } from './middleware/error';

// Routes
import authRoutes from './modules/auth/auth.routes';
import communitiesRoutes from './modules/communities/communities.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import postsRoutes from './modules/posts/posts.routes';

const app = express();

// ─── Security & Utility Middleware ──────────────────────────────────────────

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(compression());
app.use(cookieParser(env.COOKIE_SECRET));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Global rate limiting
const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_GENERAL,
  message: { success: false, code: 'RATE_LIMITED', message: 'Too many requests' },
});
app.use('/api', generalLimiter);

// ─── Routes ─────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// Modules
app.use('/api/auth', authRoutes);
app.use('/api/communities', communitiesRoutes);
app.use('/api/communities/:communityId/categories', categoriesRoutes);
app.use('/api/communities/:communityId/posts', postsRoutes);

app.all('/api/*', (req, res, next) => {
  next(new NotFoundError('API endpoint'));
});

// Global error handler
app.use(errorHandler);

export default app;
