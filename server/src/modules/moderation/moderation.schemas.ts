// ─── src/modules/moderation/moderation.schemas.ts ─────────────────────────────

import { z } from 'zod';

export const createReportSchema = z.object({
  reason: z.enum(['SPAM', 'INAPPROPRIATE', 'MISINFORMATION', 'OFF_TOPIC', 'OTHER']),
  details: z.string().max(500).optional(),
});

export const reviewReportSchema = z.object({
  status: z.enum(['DISMISSED', 'ACTION_TAKEN']),
  actionTaken: z.enum(['NONE', 'POST_HIDDEN', 'POST_DELETED', 'USER_WARNED', 'USER_BANNED']).optional(),
  reviewNote: z.string().max(500).optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type ReviewReportInput = z.infer<typeof reviewReportSchema>;
