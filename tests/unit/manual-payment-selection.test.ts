import { describe, expect, it } from 'vitest';
import { selectInvoicesForManualPayment } from '../../server/services/manual-payments';

describe('manual payment invoice selection', () => {
  it('selects overdue invoices before future months', () => {
    const selected = selectInvoicesForManualPayment([
      { id: 'sep', referenceMonth: new Date('2026-09-01'), status: 'PENDING' },
      { id: 'aug', referenceMonth: new Date('2026-08-01'), status: 'OVERDUE' },
      { id: 'jul-paid', referenceMonth: new Date('2026-07-01'), status: 'PAID' },
    ], 2);
    expect(selected.map((invoice) => invoice.id)).toEqual(['aug', 'sep']);
  });
});
