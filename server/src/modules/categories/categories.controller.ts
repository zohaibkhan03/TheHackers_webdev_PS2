// ─── src/modules/categories/categories.controller.ts ────────────────────────

import { Request, Response, NextFunction } from 'express';
import * as CategoriesService from './categories.service';

function ok(res: Response, data: unknown, status = 200) {
  return res.status(status).json({ success: true, data });
}

export async function getCommunityCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const { communityId } = req.params;
    const categories = await CategoriesService.getCategoriesForCommunity(communityId);
    return ok(res, categories);
  } catch (err) {
    next(err);
  }
}

export async function createProposal(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const proposal = await CategoriesService.createProposal(userId, req.body);
    return ok(res, proposal, 201);
  } catch (err) {
    next(err);
  }
}

export async function supportProposal(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const { proposalId } = req.params;
    const updated = await CategoriesService.supportProposal(userId, proposalId);
    return ok(res, updated);
  } catch (err) {
    next(err);
  }
}

export async function reviewProposal(req: Request, res: Response, next: NextFunction) {
  try {
    const moderatorId = req.user!.sub;
    const { proposalId } = req.params;
    const result = await CategoriesService.reviewProposal(moderatorId, proposalId, req.body);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
}
