import { prisma } from '../../lib/db';
export async function getDashboard(now = new Date()) {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [activeStudents, pendingInvoices, birthdays, revenue] = await Promise.all([
    prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
    prisma.invoice.count({ where: { status: { in: ['PENDING', 'OVERDUE'] } } }),
    prisma.student.findMany({ where: { birthDate: { gte: new Date(now.getFullYear() - 100, now.getMonth(), now.getDate()), lt: new Date(now.getFullYear() - 99, now.getMonth(), now.getDate() + 7) } }, select: { id: true, fullName: true, birthDate: true } }),
    prisma.invoice.aggregate({ where: { status: 'PAID', dueDate: { gte: monthStart } }, _sum: { amountCents: true } }),
  ]);
  return { activeStudents, pendingInvoices, birthdays, receivedCents: revenue._sum.amountCents ?? 0 };
}
