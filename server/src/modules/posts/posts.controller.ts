// ─── src/modules/posts/posts.controller.ts ────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import * as PostsService from './posts.service';
import { createPostSchema, updatePostStatusSchema, addPostUpdateSchema } from './posts.schemas';

function ok(res: Response, data: unknown, status = 200) {
  return res.status(status).json({ success: true, data });
}

export async function getPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const { communityId } = req.params;
    const { category } = req.query;
    const posts = await PostsService.getPosts(communityId, category as string);
    return ok(res, posts);
  } catch (err) {
    next(err);
  }
}

export async function getPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await PostsService.getPostById(req.params.postId);
    return ok(res, post);
  } catch (err) {
    next(err);
  }
}

export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const input = createPostSchema.parse({ ...req.body, communityId: req.params.communityId });
    const post = await PostsService.createPost(userId, input);
    return ok(res, post, 201);
  } catch (err) {
    next(err);
  }
}

export async function updatePostStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const input = updatePostStatusSchema.parse(req.body);
    const updated = await PostsService.updatePostStatus(userId, req.params.postId, input);
    return ok(res, updated);
  } catch (err) {
    next(err);
  }
}

export async function addUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const input = addPostUpdateSchema.parse(req.body);
    const update = await PostsService.addPostUpdate(userId, req.params.postId, input);
    return ok(res, update, 201);
  } catch (err) {
    next(err);
  }
}

export async function toggleHelpful(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const result = await PostsService.toggleHelpfulVote(userId, req.params.postId);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function confirmValidity(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const result = await PostsService.confirmValidity(userId, req.params.postId);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
}
