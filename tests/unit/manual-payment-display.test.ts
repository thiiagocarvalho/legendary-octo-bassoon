import { describe, expect, it } from 'vitest';
import { expectedManualPaymentCents } from '../../lib/manual-payments';

describe('expectedManualPaymentCents', () => {
  it('calcula o valor esperado para as mensalidades escolhidas', () => {
    expect(expectedManualPaymentCents(30000, 3)).toBe(90000);
  });
});
