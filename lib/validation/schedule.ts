import { z } from 'zod';

export const classSlotInput = z.object({
  weekday: z.coerce.number().int().min(0).max(6),
  startsTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  duration: z.coerce.number().int().min(30).max(180),
  capacity: z.coerce.number().int().min(1).max(30),
});
