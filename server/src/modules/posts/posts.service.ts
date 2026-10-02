// ─── src/modules/posts/posts.service.ts ───────────────────────────────────────

import { prisma } from '../../lib/prisma';
import { NotFoundError, ForbiddenError } from '../../middleware/error';
import type { CreatePostInput, UpdatePostStatusInput, AddPostUpdateInput } from './posts.schemas';

// ─── Get Posts ──────────────────────────────────────────────────────────────

export async function getPosts(communityId: string, filterCategory?: string) {
  return prisma.post.findMany({
    where: {
      communityId,
      status: { in: ['ACTIVE', 'RESOLVED', 'CLOSED'] },
      ...(filterCategory ? { category: filterCategory } : {}),
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true, role: true } },
      customCategory: { select: { name: true, slug: true } },
      images: { orderBy: { order: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPostById(postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true, role: true } },
      customCategory: { select: { name: true, slug: true } },
      images: { orderBy: { order: 'asc' } },
      updates: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!post) throw new NotFoundError('Post');

  // Increment view count asynchronously
  prisma.post.update({
    where: { id: postId },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  return post;
}

// ─── Create & Update ────────────────────────────────────────────────────────

export async function createPost(userId: string, data: CreatePostInput) {
  return prisma.post.create({
    data: {
      title: data.title,
      titleNormalized: data.title.toLowerCase().replace(/[^a-z0-9]/g, ''),
      description: data.description,
      category: data.category,
      communityId: data.communityId,
      locationCity: data.locationCity,
      locationArea: data.locationArea,
      locationPincode: data.locationPincode,
      authorId: userId,
      
      contactInfo: data.contactInfo,
      deadline: data.deadline ? new Date(data.deadline) : null,
      stipend: data.stipend,
      organization: data.organization,
      lostItemName: data.lostItemName,
      foundLocation: data.foundLocation,
      reward: data.reward,
      eventDate: data.eventDate ? new Date(data.eventDate) : null,
      eventVenue: data.eventVenue,
      externalLink: data.externalLink,
      
      tags: data.tags ? JSON.stringify(data.tags) : null,
      status: 'ACTIVE',
    },
  });
}

export async function updatePostStatus(userId: string, postId: string, data: UpdatePostStatusInput) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new NotFoundError('Post');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (post.authorId !== userId && user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
    throw new ForbiddenError('You do not have permission to update this post.');
  }

  const updates: any = { status: data.status };
  if (data.status === 'RESOLVED') updates.resolvedAt = new Date();

  return prisma.post.update({
    where: { id: postId },
    data: updates,
  });
}

export async function addPostUpdate(userId: string, postId: string, data: AddPostUpdateInput) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new NotFoundError('Post');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (post.authorId !== userId && user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
    throw new ForbiddenError('You do not have permission to add updates to this post.');
  }

  return prisma.postUpdate.create({
    data: {
      postId,
      authorId: userId,
      content: data.content,
      type: user?.role === 'MODERATOR' ? 'MODERATOR_NOTE' : 'UPDATE',
    },
  });
}

// ─── Engagements ────────────────────────────────────────────────────────────

export async function toggleHelpfulVote(userId: string, postId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.helpfulVote.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await tx.helpfulVote.delete({ where: { userId_postId: { userId, postId } } });
      await tx.post.update({ where: { id: postId }, data: { helpfulCount: { decrement: 1 } } });
      return { helpful: false };
    } else {
      await tx.helpfulVote.create({ data: { userId, postId } });
      await tx.post.update({ where: { id: postId }, data: { helpfulCount: { increment: 1 } } });
      return { helpful: true };
    }
  });
}

export async function confirmValidity(userId: string, postId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.validityConfirmation.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await tx.validityConfirmation.delete({ where: { userId_postId: { userId, postId } } });
      await tx.post.update({ where: { id: postId }, data: { confirmCount: { decrement: 1 } } });
      return { confirmed: false };
    } else {
      await tx.validityConfirmation.create({ data: { userId, postId } });
      const updated = await tx.post.update({ where: { id: postId }, data: { confirmCount: { increment: 1 } } });
      
      // Auto-verify if confirms reach threshold
      if (updated.confirmCount >= 5 && !updated.isVerified) {
        await tx.post.update({ where: { id: postId }, data: { isVerified: true } });
      }
      return { confirmed: true };
    }
  });
}
