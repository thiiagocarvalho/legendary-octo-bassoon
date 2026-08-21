import { prisma } from '../../lib/db';
import { monthlyForecastCents, percentage } from './dashboard-metrics';
import { latestDashboardMessages } from './dashboard-messages';

function weekRange(date: Date) {
  const start = new Date(date); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start); end.setDate(end.getDate() + 7);
  return { start, end };
}

export async function getDashboard(now = new Date()) {
  const { start: weekStart, end: weekEnd } = weekRange(now);
  const frequencyStart = new Date(now); frequencyStart.setDate(now.getDate() - 28);
  const [activeEnrollments, forecastEnrollments, paidInvoices, pendingInvoices, students, receivedPayments, upcoming, weeklyBookings, pastBookings, messages] = await Promise.all([
    prisma.enrollment.findMany({ where: { status: 'ACTIVE' }, include: { student: { select: { id: true, fullName: true } } } }),
    prisma.enrollment.findMany({ where: { status: { not: 'CANCELED' } }, include: { plan: { select: { monthlyPriceCents: true } } } }),
    prisma.invoice.findMany({ where: { status: 'PAID', enrollment: { status: { not: 'CANCELED' } } }, select: { enrollmentId: true, referenceMonth: true } }),
    prisma.invoice.count({ where: { status: { in: ['PENDING', 'OVERDUE'] } } }),
    prisma.student.findMany({ select: { id: true, fullName: true, birthDate: true } }),
    prisma.manualPayment.aggregate({ _sum: { amountCents: true } }),
    prisma.classOccurrence.findMany({ where: { startsAt: { gte: now, lt: weekEnd } }, include: { classSlot: true, bookings: { where: { status: { not: 'CANCELED' } } } } }),
    prisma.booking.findMany({ where: { status: { in: ['RESERVED', 'PRESENT'] }, occurrence: { startsAt: { gte: weekStart, lt: weekEnd } } }, select: { studentId: true } }),
    prisma.booking.findMany({ where: { occurrence: { startsAt: { gte: frequencyStart, lt: now } } }, select: { studentId: true, status: true } }),
    prisma.studentMessage.findMany({ include: { student: { select: { fullName: true } } } }),
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
  const monthlyForecasts = [0, 1, 2].map((offset) => {
    const month = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const paidEnrollmentIds = new Set(paidInvoices.filter((invoice) => invoice.referenceMonth.getUTCFullYear() === month.getUTCFullYear() && invoice.referenceMonth.getUTCMonth() === month.getUTCMonth()).map((invoice) => invoice.enrollmentId));
    const cents = monthlyForecastCents(forecastEnrollments.filter((enrollment) => !paidEnrollmentIds.has(enrollment.id)));
    return { label: month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }), cents };
  });
  return { activeStudents, pendingInvoices, birthdays, receivedCents: receivedPayments._sum.amountCents ?? 0, monthlyForecasts, occupancyPercent: percentage(reservedSeats, totalSeats), attendancePercent: percentage(attended, scheduled), studentsWithoutBooking, lowFrequency, messages: latestDashboardMessages(messages) };
}
