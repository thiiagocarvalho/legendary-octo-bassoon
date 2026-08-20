import { describe, expect, it } from 'vitest';
import { canBookClass, canChangeBooking, canReserveInWeek, canSwapBooking } from '../../server/services/booking-rules';

describe('booking rules', () => {
  it('does not allow a third reservation in one week', () => {
    expect(canReserveInWeek(2, 2)).toBe(false);
  });

  it('blocks a change two hours before the class', () => {
    expect(canChangeBooking(new Date('2026-08-20T16:00:00Z'), new Date('2026-08-20T18:00:00Z'))).toBe(false);
  });

  it('refuses a full class before checking the weekly limit', () => {
    expect(canBookClass(6, 6, 0, 2)).toEqual({ allowed: false, code: 'CLASS_FULL' });
  });

  it('allows a swap only when both the current and target classes are outside the two-hour window', () => {
    const now = new Date('2026-08-20T12:00:00Z');
    expect(canSwapBooking(now, new Date('2026-08-20T15:00:00Z'), new Date('2026-08-20T16:00:00Z'))).toBe(true);
    expect(canSwapBooking(now, new Date('2026-08-20T13:30:00Z'), new Date('2026-08-20T16:00:00Z'))).toBe(false);
  });
});
