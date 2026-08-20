import { prisma } from '../../lib/db';
export async function getDashboard(now = new Date()) {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [activeStudents, pendingInvoices, students, revenue] = await Promise.all([
    prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
    prisma.invoice.count({ where: { status: { in: ['PENDING', 'OVERDUE'] } } }),
    prisma.student.findMany({ select: { id: true, fullName: true, birthDate: true } }),
    prisma.invoice.aggregate({ where: { status: 'PAID', dueDate: { gte: monthStart } }, _sum: { amountCents: true } }),
  ]);
  const limit = new Date(now); limit.setDate(now.getDate() + 7);
  const birthdays = students.filter((student) => { const birthday = new Date(now.getFullYear(), student.birthDate.getMonth(), student.birthDate.getDate()); return birthday >= now && birthday <= limit; });
  return { activeStudents, pendingInvoices, birthdays, receivedCents: revenue._sum.amountCents ?? 0 };
}
