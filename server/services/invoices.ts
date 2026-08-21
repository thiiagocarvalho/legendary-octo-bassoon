import { InvoiceStatus } from '@prisma/client';
import { prisma } from '../../lib/db';

export function monthReference(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export async function createInvoice(enrollmentId: string, dueDate: Date) {
  const enrollment = await prisma.enrollment.findUniqueOrThrow({ where: { id: enrollmentId }, include: { plan: true } });
  return prisma.invoice.upsert({
    where: { enrollmentId_referenceMonth: { enrollmentId, referenceMonth: monthReference(dueDate) } },
    create: { enrollmentId, amountCents: enrollment.plan.monthlyPriceCents, dueDate, referenceMonth: monthReference(dueDate), status: InvoiceStatus.PENDING },
    update: {},
  });
}

export async function createMonthlyInvoices(now = new Date()) {
  const enrollments = await prisma.enrollment.findMany({ where: { status: 'ACTIVE' }, select: { id: true } });
  const invoices = await Promise.all(enrollments.map((enrollment: (typeof enrollments)[number]) => createInvoice(enrollment.id, now)));
  return { createdOrExisting: invoices.length };
}

export async function markOverdueInvoices(now = new Date()) {
  return prisma.invoice.updateMany({ where: { status: InvoiceStatus.PENDING, dueDate: { lt: now } }, data: { status: InvoiceStatus.OVERDUE } });
}
