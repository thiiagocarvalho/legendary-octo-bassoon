import { z } from 'zod';

export const manualPaymentInput = z.object({
  enrollmentId: z.string().min(1),
  method: z.enum(['PIX', 'CASH', 'CARD_IN_PERSON']),
  monthsCovered: z.coerce.number().int().min(1).max(24),
  amountCents: z.coerce.number().int().positive(),
  notes: z.string().trim().max(1000).optional(),
  receivedAt: z.coerce.date().optional(),
});
