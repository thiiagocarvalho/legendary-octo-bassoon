import { z } from 'zod';

const dayPairs = {
  MON_WED: { weekday: 1, secondWeekday: 3 },
  TUE_THU: { weekday: 2, secondWeekday: 4 },
} as const;

const dayPair = z.enum(['MON_WED', 'TUE_THU']);
const timeInput = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const durationInput = z.coerce.number().int().min(30).max(180);
const capacityInput = z.coerce.number().int().min(1).max(30);

export const dayPairInput = z.object({ dayPair }).transform(({ dayPair }) => dayPairs[dayPair]);

export const classSlotInput = z.object({
  dayPair,
  startsTime: timeInput,
  duration: durationInput,
  capacity: capacityInput,
}).transform(({ dayPair, ...data }) => ({ ...data, ...dayPairs[dayPair] }));
