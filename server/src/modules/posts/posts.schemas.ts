// ─── src/modules/posts/posts.schemas.ts ───────────────────────────────────────

import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(2000),
  category: z.string(), // slug of the category
  communityId: z.string().cuid(),
  locationCity: z.string().min(2),
  locationArea: z.string().min(2),
  locationPincode: z.string().optional(),
  
  // Optional category-specific fields
  contactInfo: z.string().optional(),
  deadline: z.string().datetime().optional(),
  stipend: z.string().optional(),
  organization: z.string().optional(),
  lostItemName: z.string().optional(),
  foundLocation: z.string().optional(),
  reward: z.string().optional(),
  eventDate: z.string().datetime().optional(),
  eventVenue: z.string().optional(),
  externalLink: z.string().url().optional(),
  
  tags: z.array(z.string()).max(5).optional(),
});

export const updatePostStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'RESOLVED', 'CLOSED', 'HIDDEN']),
});

export const addPostUpdateSchema = z.object({
  content: z.string().min(5).max(1000),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostStatusInput = z.infer<typeof updatePostStatusSchema>;
export type AddPostUpdateInput = z.infer<typeof addPostUpdateSchema>;
