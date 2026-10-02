// ─── src/modules/communities/communities.service.ts ───────────────────────────

import { prisma } from '../../lib/prisma';
import { NotFoundError, ConflictError } from '../../middleware/error';

/** Get all communities with basic stats */
export async function getAllCommunities() {
  const communities = await prisma.community.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { members: true, posts: { where: { status: 'ACTIVE' } } },
      },
    },
    orderBy: { name: 'asc' },
  });

  return communities.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    city: c.city,
    description: c.description,
    memberCount: c._count.members,
    activePostCount: c._count.posts,
  }));
}

/** Get community by slug */
export async function getCommunityBySlug(slug: string) {
  const community = await prisma.community.findUnique({
    where: { slug, isActive: true },
    include: {
      _count: {
        select: { members: true, posts: { where: { status: 'ACTIVE' } } },
      },
    },
  });

  if (!community) throw new NotFoundError('Community');
  return community;
}

/** Join a community */
export async function joinCommunity(userId: string, communityId: string) {
  const community = await prisma.community.findUnique({ where: { id: communityId } });
  if (!community) throw new NotFoundError('Community');

  const existing = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId, communityId } },
  });

  if (existing) throw new ConflictError('You are already a member of this community.');

  return prisma.communityMember.create({
    data: { userId, communityId },
  });
}

/** Leave a community */
export async function leaveCommunity(userId: string, communityId: string) {
  const existing = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId, communityId } },
  });

  if (!existing) throw new NotFoundError('Community membership');
  if (existing.isModerator) throw new ConflictError('Moderators cannot leave a community without transferring roles first.');

  await prisma.communityMember.delete({
    where: { userId_communityId: { userId, communityId } },
  });
}
