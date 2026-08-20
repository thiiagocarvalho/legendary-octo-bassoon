import { prisma } from '../../lib/db';
import { percentage } from './dashboard-metrics';

function weekRange(date: Date) {
  const start = new Date(date); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start); end.setDate(end.getDate() + 7);
  return { start, end };
}

export async function getDashboard(now = new Date()) {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const { start: weekStart, end: weekEnd } = weekRange(now);
  const frequencyStart = new Date(now); frequencyStart.setDate(now.getDate() - 28);
  const [activeEnrollments, pendingInvoices, students, revenue, expectedRevenue, upcoming, weeklyBookings, pastBookings] = await Promise.all([
    prisma.enrollment.findMany({ where: { status: 'ACTIVE' }, include: { student: { select: { id: true, fullName: true } } } }),
    prisma.invoice.count({ where: { status: { in: ['PENDING', 'OVERDUE'] } } }),
    prisma.student.findMany({ select: { id: true, fullName: true, birthDate: true } }),
    prisma.invoice.aggregate({ where: { status: 'PAID', dueDate: { gte: monthStart } }, _sum: { amountCents: true } }),
    prisma.invoice.aggregate({ where: { status: { not: 'VOID' }, dueDate: { gte: monthStart } }, _sum: { amountCents: true } }),
    prisma.classOccurrence.findMany({ where: { startsAt: { gte: now, lt: weekEnd } }, include: { classSlot: true, bookings: { where: { status: { not: 'CANCELED' } } } } }),
    prisma.booking.findMany({ where: { status: { in: ['RESERVED', 'PRESENT'] }, occurrence: { startsAt: { gte: weekStart, lt: weekEnd } } }, select: { studentId: true } }),
    prisma.booking.findMany({ where: { occurrence: { startsAt: { gte: frequencyStart, lt: now } } }, select: { studentId: true, status: true } }),
  ]);
  const limit = new Date(now); limit.setDate(now.getDate() + 7);
  const birthdays = students.filter((student) => { const birthday = new Date(now.getFullYear(), student.birthDate.getMonth(), student.birthDate.getDate()); return birthday >= now && birthday <= limit; }).map((student) => ({ id: student.id, fullName: student.fullName, birthDate: student.birthDate }));
  const activeStudents = activeEnrollments.length;
  const studentsWithWeeklyBooking = new Set(weeklyBookings.map((booking) => booking.studentId));
  const studentsWithoutBooking = activeEnrollments.filter((enrollment) => !studentsWithWeeklyBooking.has(enrollment.studentId)).map((enrollment) => ({ id: enrollment.student.id, fullName: enrollment.student.fullName }));
  const presentByStudent = new Map<string, number>();
  const registeredByStudent = new Map<string, number>();
  for (const booking of pastBookings) { registeredByStudent.set(booking.studentId, (registeredByStudent.get(booking.studentId) ?? 0) + 1); if (booking.status === 'PRESENT') presentByStudent.set(booking.studentId, (presentByStudent.get(booking.studentId) ?? 0) + 1); }
  const lowFrequency = activeEnrollments.filter((enrollment) => (presentByStudent.get(enrollment.studentId) ?? 0) < 4).map((enrollment) => ({ id: enrollment.student.id, fullName: enrollment.student.fullName }));
  const totalSeats = upcoming.reduce((sum, occurrence) => sum + occurrence.classSlot.capacity, 0);
  const reservedSeats = upcoming.reduce((sum, occurrence) => sum + occurrence.bookings.length, 0);
  const attended = [...presentByStudent.values()].reduce((sum, value) => sum + value, 0);
  const scheduled = [...registeredByStudent.values()].reduce((sum, value) => sum + value, 0);
  return { activeStudents, pendingInvoices, birthdays, receivedCents: revenue._sum.amountCents ?? 0, expectedCents: expectedRevenue._sum.amountCents ?? 0, occupancyPercent: percentage(reservedSeats, totalSeats), attendancePercent: percentage(attended, scheduled), studentsWithoutBooking, lowFrequency };
}
