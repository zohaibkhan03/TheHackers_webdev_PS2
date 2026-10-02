// ─── src/modules/posts/posts.routes.ts ────────────────────────────────────────

import { Router } from 'express';
import * as PostsController from './posts.controller';
import { requireAuth, optionalAuth } from '../../middleware/auth';

const router = Router({ mergeParams: true });

// Read routes
router.get('/', optionalAuth, PostsController.getPosts);
router.get('/:postId', optionalAuth, PostsController.getPost);

// Write routes (require auth)
router.post('/', requireAuth, PostsController.createPost);
router.patch('/:postId/status', requireAuth, PostsController.updatePostStatus);
router.post('/:postId/updates', requireAuth, PostsController.addUpdate);

// Engagement routes
router.post('/:postId/helpful', requireAuth, PostsController.toggleHelpful);
router.post('/:postId/confirm', requireAuth, PostsController.confirmValidity);

export default router;
