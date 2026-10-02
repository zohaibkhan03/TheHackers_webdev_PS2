// ─── src/modules/communities/communities.controller.ts ────────────────────────

import { Request, Response, NextFunction } from 'express';
import * as CommunitiesService from './communities.service';

function ok(res: Response, data: unknown, status = 200) {
  return res.status(status).json({ success: true, data });
}

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const communities = await CommunitiesService.getAllCommunities();
    return ok(res, communities);
  } catch (err) {
    next(err);
  }
}

export async function getBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const community = await CommunitiesService.getCommunityBySlug(req.params.slug);
    return ok(res, community);
  } catch (err) {
    next(err);
  }
}

export async function join(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const { id } = req.params;
    await CommunitiesService.joinCommunity(userId, id);
    return ok(res, { message: 'Successfully joined community' });
  } catch (err) {
    next(err);
  }
}

export async function leave(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const { id } = req.params;
    await CommunitiesService.leaveCommunity(userId, id);
    return ok(res, { message: 'Successfully left community' });
  } catch (err) {
    next(err);
  }
}
