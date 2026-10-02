// ─── src/modules/categories/categories.routes.ts ────────────────────────────

import { Router } from 'express';
import * as CategoriesController from './categories.controller';
import { requireAuth, requireCommunityModerator } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createProposalSchema, reviewProposalSchema } from './categories.schemas';

const router = Router({ mergeParams: true });

// Public/Optional routes
// e.g. GET /api/communities/:communityId/categories
router.get('/', CategoriesController.getCommunityCategories);

// Protected routes (User)
router.post(
  '/proposals',
  requireAuth,
  validate(createProposalSchema),
  CategoriesController.createProposal
);

router.post(
  '/proposals/:proposalId/support',
  requireAuth,
  CategoriesController.supportProposal
);

// Protected routes (Moderator)
router.post(
  '/proposals/:proposalId/review',
  requireAuth,
  requireCommunityModerator, // Requires req.body.communityId or req.params.communityId
  validate(reviewProposalSchema),
  CategoriesController.reviewProposal
);

export default router;
