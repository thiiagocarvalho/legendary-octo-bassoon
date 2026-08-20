import { BookingStatus } from '@prisma/client';
import { prisma } from '../../lib/db';
import { canBookClass, canChangeBooking } from './booking-rules';

export class BookingError extends Error {
  constructor(public code: 'ENROLLMENT_INACTIVE' | 'CLASS_FULL' | 'WEEKLY_LIMIT_REACHED' | 'CHANGE_WINDOW_CLOSED' | 'ALREADY_BOOKED') { super(code); }
}

function weekRange(date: Date) {
  const start = new Date(date); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start); end.setDate(end.getDate() + 7);
  return { start, end };
}

export async function createBooking(studentId: string, occurrenceId: string) {
  return prisma.$transaction(async (tx) => {
    const occurrence = await tx.classOccurrence.findUnique({ where: { id: occurrenceId }, include: { classSlot: true } });
    if (!occurrence) throw new BookingError('CLASS_FULL');
    const enrollment = await tx.enrollment.findFirst({ where: { studentId, status: 'ACTIVE' }, include: { plan: true }, orderBy: { startsAt: 'desc' } });
    if (!enrollment) throw new BookingError('ENROLLMENT_INACTIVE');
    const { start, end } = weekRange(occurrence.startsAt);
    const [occupied, weeklyReservations, existing] = await Promise.all([
      tx.booking.count({ where: { occurrenceId, status: { not: 'CANCELED' } } }),
      tx.booking.count({ where: { studentId, status: { in: ['RESERVED', 'PRESENT'] }, occurrence: { startsAt: { gte: start, lt: end } } } }),
      tx.booking.findUnique({ where: { studentId_occurrenceId: { studentId, occurrenceId } } }),
    ]);
    if (existing) throw new BookingError('ALREADY_BOOKED');
    const decision = canBookClass(occupied, occurrence.classSlot.capacity, weeklyReservations, enrollment.plan.weeklyBookingLimit);
    if (!decision.allowed) throw new BookingError(decision.code);
    return tx.booking.create({ data: { studentId, occurrenceId } });
  });
}

export async function cancelBooking(studentId: string, bookingId: string, now = new Date()) {
  const booking = await prisma.booking.findFirst({ where: { id: bookingId, studentId }, include: { occurrence: true } });
  if (!booking || booking.status === BookingStatus.CANCELED) throw new BookingError('ALREADY_BOOKED');
  if (!canChangeBooking(now, booking.occurrence.startsAt)) throw new BookingError('CHANGE_WINDOW_CLOSED');
  return prisma.booking.update({ where: { id: bookingId }, data: { status: 'CANCELED' } });
}
