// ─── src/modules/communities/communities.routes.ts ────────────────────────────

import { Router } from 'express';
import * as CommunitiesController from './communities.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.get('/', CommunitiesController.getAll);
router.get('/:slug', CommunitiesController.getBySlug);

// Protected routes
router.post('/:id/join', requireAuth, CommunitiesController.join);
router.post('/:id/leave', requireAuth, CommunitiesController.leave);

export default router;
