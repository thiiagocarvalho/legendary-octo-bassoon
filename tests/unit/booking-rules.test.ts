import { describe, expect, it } from 'vitest';
import { canBookClass, canChangeBooking, canReserveInWeek, canSwapBooking } from '../../server/services/booking-rules';

describe('booking rules', () => {
  it('does not allow a third reservation in one week', () => {
    expect(canReserveInWeek(2, 2)).toBe(false);
  });

  it('blocks a change with less than one day before the class', () => {
    expect(canChangeBooking(new Date('2026-08-20T12:00:00Z'), new Date('2026-08-21T11:59:59Z'))).toBe(false);
    expect(canChangeBooking(new Date('2026-08-20T12:00:00Z'), new Date('2026-08-21T12:00:01Z'))).toBe(true);
  });

  it('refuses a full class before checking the weekly limit', () => {
    expect(canBookClass(6, 6, 0, 2)).toEqual({ allowed: false, code: 'CLASS_FULL' });
  });

  it('allows a swap only when both the current and target classes are outside the one-day window', () => {
    const now = new Date('2026-08-20T12:00:00Z');
    expect(canSwapBooking(now, new Date('2026-08-21T13:00:00Z'), new Date('2026-08-22T14:00:00Z'))).toBe(true);
    expect(canSwapBooking(now, new Date('2026-08-21T11:30:00Z'), new Date('2026-08-22T14:00:00Z'))).toBe(false);
  });
});
