import { describe, expect, it } from 'vitest';
import { manualPaymentInput } from '../../lib/validation/manual-payments';

describe('manual payment input', () => {
  it('accepts a Pix payment for three months', () => {
    expect(manualPaymentInput.safeParse({ enrollmentId: 'enr_1', method: 'PIX', monthsCovered: 3, amountCents: 90000 }).success).toBe(true);
  });

  it('rejects payment methods outside the presencial options', () => {
    expect(manualPaymentInput.safeParse({ enrollmentId: 'enr_1', method: 'TRANSFER', monthsCovered: 1, amountCents: 30000 }).success).toBe(false);
  });
});
