// ─── src/modules/categories/categories.service.ts ─────────────────────────────

import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../../middleware/error';
import type { CreateProposalInput, ReviewProposalInput } from './categories.schemas';

// ─── Categories ─────────────────────────────────────────────────────────────

/** Get all active categories for a community (built-in + approved custom) */
export async function getCategoriesForCommunity(communityId: string) {
  return prisma.category.findMany({
    where: {
      isActive: true,
      OR: [
        { isBuiltIn: true },
        { communityId },
      ],
    },
    orderBy: [
      { isBuiltIn: 'desc' },
      { name: 'asc' },
    ],
  });
}

// ─── Proposals ──────────────────────────────────────────────────────────────

/** Propose a new custom category for a community */
export async function createProposal(userId: string, data: CreateProposalInput) {
  // 1. Verify community
  const community = await prisma.community.findUnique({ where: { id: data.communityId } });
  if (!community) throw new NotFoundError('Community');

  // 2. Transaction for limits and limits
  return prisma.$transaction(async (tx) => {
    // Check if user already has a pending proposal
    const pending = await tx.categoryProposal.findFirst({
      where: { proposedById: userId, status: 'PENDING' },
    });
    if (pending) throw new ConflictError('You already have a pending category proposal.');

    // Check rolling 30-day limit per user
    const windowStart = new Date(Date.now() - env.CATEGORY_PROPOSAL_LIMIT_DAYS * 24 * 60 * 60 * 1000);
    const recentProposals = await tx.categoryProposal.count({
      where: {
        proposedById: userId,
        createdAt: { gte: windowStart },
      },
    });
    if (recentProposals >= env.CATEGORY_PROPOSAL_MAX_PER_WINDOW) {
      throw new RateLimitError('You have reached the limit for category proposals in the last 30 days.');
    }

    // Check community active custom categories limit
    const activeCustom = await tx.category.count({
      where: { communityId: data.communityId, isActive: true },
    });
    if (activeCustom >= env.CATEGORY_MAX_CUSTOM_PER_COMMUNITY) {
      throw new ForbiddenError(`This community already has the maximum of ${env.CATEGORY_MAX_CUSTOM_PER_COMMUNITY} custom categories.`);
    }

    // Check for exact name match in existing categories
    const normalizedName = data.name.toLowerCase().trim();
    const existing = await tx.category.findFirst({
      where: {
        OR: [
          { isBuiltIn: true },
          { communityId: data.communityId },
        ],
        name: { equals: normalizedName },
      },
    });
    if (existing) throw new ConflictError('A category with this name already exists.');

    // Create proposal
    const proposal = await tx.categoryProposal.create({
      data: {
        name: data.name,
        description: data.description,
        communityId: data.communityId,
        proposedById: userId,
      },
    });

    // Auto-support by creator
    await tx.proposalSupport.create({
      data: { userId, proposalId: proposal.id },
    });
    
    await tx.categoryProposal.update({
      where: { id: proposal.id },
      data: { supportCount: 1 },
    });

    return proposal;
  });
}

/** Support a pending category proposal */
export async function supportProposal(userId: string, proposalId: string) {
  return prisma.$transaction(async (tx) => {
    const proposal = await tx.categoryProposal.findUnique({ where: { id: proposalId } });
    if (!proposal) throw new NotFoundError('Proposal');
    if (proposal.status !== 'PENDING') throw new ConflictError('This proposal is no longer pending.');

    // Ensure user belongs to the community
    const membership = await tx.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId: proposal.communityId } },
    });
    if (!membership) throw new ForbiddenError('You must be a member of this community to support proposals.');

    // Add support
    await tx.proposalSupport.create({
      data: { userId, proposalId },
    });

    const updated = await tx.categoryProposal.update({
      where: { id: proposalId },
      data: { supportCount: { increment: 1 } },
    });

    // Notify moderators if threshold reached
    if (updated.supportCount >= env.CATEGORY_PROPOSAL_REQUIRED_SUPPORT) {
      // Logic for notification would go here
    }

    return updated;
  });
}

/** Moderator reviews a proposal */
export async function reviewProposal(
  moderatorId: string,
  proposalId: string,
  data: ReviewProposalInput
) {
  return prisma.$transaction(async (tx) => {
    const proposal = await tx.categoryProposal.findUnique({ where: { id: proposalId } });
    if (!proposal) throw new NotFoundError('Proposal');
    if (proposal.status !== 'PENDING') throw new ConflictError('This proposal has already been reviewed.');

    if (data.status === 'APPROVED') {
      // Create the new category
      const slug = proposal.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const newCategory = await tx.category.create({
        data: {
          name: proposal.name,
          slug,
          description: proposal.description,
          type: 'CUSTOM',
          communityId: proposal.communityId,
          isBuiltIn: false,
        },
      });

      await tx.categoryProposal.update({
        where: { id: proposalId },
        data: {
          status: 'APPROVED',
          reviewedById: moderatorId,
          reviewNote: data.reviewNote,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          actorId: moderatorId,
          action: 'APPROVE_CATEGORY_PROPOSAL',
          entityType: 'CategoryProposal',
          entityId: proposalId,
          communityId: proposal.communityId,
        },
      });

      return newCategory;
    }

    // Handle rejection or merge
    await tx.categoryProposal.update({
      where: { id: proposalId },
      data: {
        status: data.status,
        reviewedById: moderatorId,
        reviewNote: data.reviewNote,
        mergeTargetId: data.mergeTargetId,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: moderatorId,
        action: `REVIEW_CATEGORY_PROPOSAL_${data.status}`,
        entityType: 'CategoryProposal',
        entityId: proposalId,
        communityId: proposal.communityId,
      },
    });

    return null;
  });
}

// Temporary RateLimitError subclass for service layer
class RateLimitError extends Error {
  statusCode = 429;
  code = 'RATE_LIMITED';
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}
