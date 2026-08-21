import { InvoiceStatus } from '@prisma/client';
import { prisma } from '../../lib/db';
import { manualPaymentInput } from '../../lib/validation/manual-payments';
import { monthReference } from './invoices';

type InvoiceCandidate = { id: string; referenceMonth: Date; status: string };

export function selectInvoicesForManualPayment<T extends InvoiceCandidate>(invoices: T[], monthsCovered: number) {
  return invoices
    .filter((invoice) => invoice.status === InvoiceStatus.PENDING || invoice.status === InvoiceStatus.OVERDUE)
    .sort((left, right) => left.referenceMonth.getTime() - right.referenceMonth.getTime())
    .slice(0, monthsCovered);
}

function nextMonth(reference: Date) {
  return new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + 1, 1));
}

export async function recordManualPayment(input: unknown, actorId: string) {
  const data = manualPaymentInput.parse(input);
  const receivedAt = data.receivedAt ?? new Date();

  return prisma.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.findUniqueOrThrow({
      where: { id: data.enrollmentId },
      include: { plan: true, invoices: { orderBy: { referenceMonth: 'asc' } } },
    });
    const targets = selectInvoicesForManualPayment(enrollment.invoices, data.monthsCovered);
    const references = enrollment.invoices.map((invoice) => invoice.referenceMonth);
    let cursor = references.length ? nextMonth(references[references.length - 1]) : monthReference(receivedAt);

    while (targets.length < data.monthsCovered) {
      const invoice = await tx.invoice.upsert({
        where: { enrollmentId_referenceMonth: { enrollmentId: enrollment.id, referenceMonth: cursor } },
        create: { enrollmentId: enrollment.id, amountCents: enrollment.plan.monthlyPriceCents, dueDate: cursor, referenceMonth: cursor, status: InvoiceStatus.PENDING },
        update: {},
      });
      if (invoice.status !== InvoiceStatus.PAID && invoice.status !== InvoiceStatus.VOID) targets.push(invoice);
      cursor = nextMonth(cursor);
    }

    await tx.invoice.updateMany({ where: { id: { in: targets.map((invoice) => invoice.id) } }, data: { status: InvoiceStatus.PAID } });
    const payment = await tx.manualPayment.create({
      data: {
        enrollmentId: enrollment.id,
        method: data.method,
        amountCents: data.amountCents,
        monthsCovered: data.monthsCovered,
        receivedAt,
        notes: data.notes || null,
        receivedBy: actorId,
        invoices: { create: targets.map((invoice) => ({ invoiceId: invoice.id })) },
      },
      include: { invoices: { include: { invoice: true } } },
    });
    await tx.enrollment.update({ where: { id: enrollment.id }, data: { status: 'ACTIVE' } });
    await tx.auditLog.create({ data: { actorId, action: 'MANUAL_PAYMENT_RECORDED', entity: 'ManualPayment', entityId: payment.id, reason: data.notes || null } });
    return payment;
  }, { timeout: 20_000 });
}
