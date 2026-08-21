import { describe, expect, it } from 'vitest';
import { invoiceStatusLabel } from '../../lib/invoice-display';

describe('invoiceStatusLabel', () => {
  it('traduz os status de mensalidade para o painel administrativo', () => {
    expect(invoiceStatusLabel('PAID')).toBe('Pago');
    expect(invoiceStatusLabel('PENDING')).toBe('Pendente');
    expect(invoiceStatusLabel('OVERDUE')).toBe('Em atraso');
    expect(invoiceStatusLabel('VOID')).toBe('Cancelado');
  });
});
