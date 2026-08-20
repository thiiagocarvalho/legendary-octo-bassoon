import { describe, expect, it } from 'vitest';
import { studentInvoiceAction } from '../../lib/student-finance';

describe('student finance', () => {
  it('does not render a payment action for pending invoices', () => {
    expect(studentInvoiceAction('PENDING')).toBeNull();
  });
});
