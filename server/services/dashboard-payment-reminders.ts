import { paymentReminder } from '../../lib/whatsapp-payment-reminders';

type ReminderInvoice = {
  id: string;
  dueDate: Date;
  enrollment: { student: { fullName: string; phone: string } };
};

export function dashboardPaymentReminders(invoices: ReminderInvoice[], now = new Date()) {
  return invoices
    .map((invoice) => {
      const reminder = paymentReminder(invoice.enrollment.student, invoice.dueDate, now);
      return reminder ? { id: invoice.id, fullName: invoice.enrollment.student.fullName, dueDate: invoice.dueDate.toISOString(), ...reminder } : null;
    })
    .filter((reminder): reminder is NonNullable<typeof reminder> => reminder !== null)
    .sort((first, second) => first.dueDate.localeCompare(second.dueDate));
}
