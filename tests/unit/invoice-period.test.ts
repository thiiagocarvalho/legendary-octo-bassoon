import { describe, expect, it } from 'vitest';
import { monthReference } from '../../server/services/invoices';

describe('invoice month reference', () => {
  it('normalizes any date to the first day of its month', () => {
    expect(monthReference(new Date('2026-08-20T14:45:00.000Z')).toISOString()).toBe('2026-08-01T00:00:00.000Z');
  });
});
