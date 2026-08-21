import { describe, expect, it } from 'vitest';
import { canUseMakeupCredit } from '../../server/services/makeup-credit-rules';

describe('canUseMakeupCredit', () => {
  it('permite somente crédito disponível', () => {
    expect(canUseMakeupCredit({ status: 'AVAILABLE' })).toBe(true);
    expect(canUseMakeupCredit({ status: 'USED' })).toBe(false);
    expect(canUseMakeupCredit({ status: 'CANCELED' })).toBe(false);
  });
});
