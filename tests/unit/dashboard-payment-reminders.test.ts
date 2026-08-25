import { describe, expect, it } from 'vitest';
import { dashboardPaymentReminders } from '../../server/services/dashboard-payment-reminders';

describe('lembretes de mensalidade do painel', () => {
  it('inclui vencimento hoje, amanhã e atrasado com link de WhatsApp', () => {
    const now = new Date('2026-08-25T12:00:00');
    const reminders = dashboardPaymentReminders([
      { id: 'today', dueDate: new Date('2026-08-25T09:00:00'), enrollment: { student: { fullName: 'Ana', phone: '(11) 98888-1111' } } },
      { id: 'tomorrow', dueDate: new Date('2026-08-26T09:00:00'), enrollment: { student: { fullName: 'Bia', phone: '(21) 97777-2222' } } },
      { id: 'overdue', dueDate: new Date('2026-08-20T09:00:00'), enrollment: { student: { fullName: 'Cida', phone: '(31) 96666-3333' } } },
    ], now);

    expect(reminders.map((reminder) => reminder.label)).toEqual(['Em atraso', 'Vence hoje', 'Vence amanhã']);
    expect(reminders[1]).toMatchObject({ id: 'today', fullName: 'Ana', dueDate: new Date('2026-08-25T09:00:00').toISOString() });
    expect(reminders[1].href).toContain('https://wa.me/5511988881111?text=');
  });
});
