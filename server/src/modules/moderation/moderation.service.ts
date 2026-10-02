// ─── src/modules/moderation/moderation.service.ts ─────────────────────────────

import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { NotFoundError, ConflictError } from '../../middleware/error';
import type { CreateReportInput, ReviewReportInput } from './moderation.schemas';

// ─── Reports ────────────────────────────────────────────────────────────────

export async function createReport(userId: string, postId: string, data: CreateReportInput) {
  return prisma.$transaction(async (tx) => {
    // Ensure post exists
    const post = await tx.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundError('Post');

    // Prevent duplicate reports
    const existing = await tx.report.findUnique({
      where: { reporterId_postId: { reporterId: userId, postId } },
    });
    if (existing) throw new ConflictError('You have already reported this post.');

    // Create report
    const report = await tx.report.create({
      data: {
        postId,
        reporterId: userId,
        reason: data.reason,
        details: data.details,
      },
    });

    // Update post report count
    const updatedPost = await tx.post.update({
      where: { id: postId },
      data: { reportCount: { increment: 1 } },
    });

    // Check recent reports window (48 hours)
    const windowStart = new Date(Date.now() - env.REPORT_WINDOW_HOURS * 60 * 60 * 1000);
    const recentReportsCount = await tx.report.count({
      where: {
        postId,
        createdAt: { gte: windowStart },
        status: 'PENDING',
      },
    });

    // Auto-hide post if thresholds are met
    if (recentReportsCount >= env.REPORT_THRESHOLD_REVIEW && updatedPost.status === 'ACTIVE') {
      await tx.post.update({
        where: { id: postId },
        data: { status: 'HIDDEN' },
      });
      
      await tx.auditLog.create({
        data: {
          actorId: 'SYSTEM',
          action: 'AUTO_HIDE_POST',
          entityType: 'Post',
          entityId: postId,
          communityId: post.communityId,
          reason: `Post reached ${env.REPORT_THRESHOLD_REVIEW} recent reports`,
        },
      });
    }

    return report;
  });
}

// ─── Dashboard (Moderators) ─────────────────────────────────────────────────

export async function getPendingReports(communityId: string) {
  return prisma.report.findMany({
    where: {
      post: { communityId },
      status: 'PENDING',
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          status: true,
          reportCount: true,
          author: { select: { id: true, name: true, role: true } },
        },
      },
      reporter: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function reviewReport(
  moderatorId: string,
  reportId: string,
  data: ReviewReportInput
) {
  return prisma.$transaction(async (tx) => {
    const report = await tx.report.findUnique({
      where: { id: reportId },
      include: { post: true },
    });
    
    if (!report) throw new NotFoundError('Report');
    if (report.status !== 'PENDING') throw new ConflictError('This report has already been reviewed.');

    // Update report status
    const updated = await tx.report.update({
      where: { id: reportId },
      data: {
        status: data.status,
        reviewedById: moderatorId,
        reviewNote: data.reviewNote,
      },
    });

    // Apply moderation action to the post/user if necessary
    if (data.actionTaken === 'POST_HIDDEN' && report.post.status !== 'HIDDEN') {
      await tx.post.update({
        where: { id: report.postId },
        data: { status: 'HIDDEN' },
      });
    } else if (data.actionTaken === 'POST_DELETED' && report.post.status !== 'CLOSED') {
      // We soft-delete or close it depending on logic
      await tx.post.update({
        where: { id: report.postId },
        data: { status: 'CLOSED' },
      });
    }

    // Audit Log
    await tx.auditLog.create({
      data: {
        actorId: moderatorId,
        action: `REVIEW_REPORT_${data.status}`,
        entityType: 'Report',
        entityId: reportId,
        communityId: report.post.communityId,
        metadata: JSON.stringify({ actionTaken: data.actionTaken }),
      },
    });

    return updated;
  });
}
