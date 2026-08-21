import { describe, expect, it } from 'vitest';
import { makeupBookingDecision } from '../../server/services/makeup-credit-rules';

describe('makeupBookingDecision', () => {
  it('requires a credit and an available seat', () => {
    expect(makeupBookingDecision(0, 1, 8).allowed).toBe(false);
    expect(makeupBookingDecision(1, 8, 8).allowed).toBe(false);
    expect(makeupBookingDecision(1, 7, 8).allowed).toBe(true);
  });
});
