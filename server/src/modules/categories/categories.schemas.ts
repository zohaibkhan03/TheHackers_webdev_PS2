// ─── src/modules/categories/categories.schemas.ts ─────────────────────────────

import { z } from 'zod';

export const createProposalSchema = z.object({
  name: z.string().min(3).max(30).trim(),
  description: z.string().min(30).max(500).trim(),
  communityId: z.string().cuid(),
});

export const reviewProposalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'MERGED']),
  reviewNote: z.string().max(500).optional(),
  mergeTargetId: z.string().cuid().optional(),
}).refine(data => {
  if (data.status === 'MERGED' && !data.mergeTargetId) return false;
  return true;
}, "mergeTargetId is required when status is MERGED");

export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type ReviewProposalInput = z.infer<typeof reviewProposalSchema>;
