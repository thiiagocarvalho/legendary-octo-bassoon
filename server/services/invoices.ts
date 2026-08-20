import { InvoiceStatus } from '@prisma/client';
import { prisma } from '../../lib/db';

export async function createInvoice(enrollmentId: string, dueDate: Date) {
  const enrollment = await prisma.enrollment.findUniqueOrThrow({ where: { id: enrollmentId }, include: { plan: true } });
  return prisma.invoice.create({ data: { enrollmentId, amountCents: enrollment.plan.monthlyPriceCents, dueDate, status: InvoiceStatus.PENDING } });
}

export async function markOverdueInvoices(now = new Date()) {
  return prisma.invoice.updateMany({ where: { status: InvoiceStatus.PENDING, dueDate: { lt: now } }, data: { status: InvoiceStatus.OVERDUE } });
}
